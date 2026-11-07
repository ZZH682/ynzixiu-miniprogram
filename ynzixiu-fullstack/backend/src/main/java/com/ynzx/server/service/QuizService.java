package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.common.BizException;
import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.entity.ErrorBook;
import com.ynzx.server.entity.ExamRecord;
import com.ynzx.server.entity.Question;
import com.ynzx.server.entity.QuizRecord;
import com.ynzx.server.entity.Subject;
import com.ynzx.server.mapper.ErrorBookMapper;
import com.ynzx.server.mapper.ExamRecordMapper;
import com.ynzx.server.mapper.QuestionMapper;
import com.ynzx.server.mapper.QuizRecordMapper;
import com.ynzx.server.mapper.SubjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 在线教学：题库刷题、自动判卷、错题本、在线模考。
 *
 * <p>对应标书"全科在线教学系统"章节。本服务集中体现了
 * <b>事务一致性</b>（判卷 + 错题本更新在一个事务内）、
 * <b>判卷逻辑</b>（选项归一化比较）、
 * <b>幂等</b>（错题本对同一题只累加 wrongCount，不会重复建行）。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuestionMapper questionMapper;
    private final QuizRecordMapper quizRecordMapper;
    private final ExamRecordMapper examRecordMapper;
    private final ErrorBookMapper errorBookMapper;
    private final SubjectMapper subjectMapper;

    /**
     * 题库列表（练习模式：不下发表答案与分析，避免前端偷看）。
     */
    public List<Map<String, Object>> listQuestions(Integer sid, Integer page, Integer size) {
        if (sid == null) {
            throw new BizException(ErrorCode.PARAM_ERROR, "请选择科目");
        }
        int p = page == null || page < 1 ? 1 : page;
        int s = size == null || size < 1 ? 20 : Math.min(size, 100);
        List<Question> list = questionMapper.selectList(new LambdaQueryWrapper<Question>()
                .eq(Question::getSid, sid)
                .last("LIMIT " + s + " OFFSET " + (p - 1) * s));
        return list.stream().map(this::toPracticeVo).collect(Collectors.toList());
    }

    /**
     * 提交一道题答案，自动判卷。
     *
     * <p><b>判卷规则</b>：答案可能含多选（如 "AB"），统一转大写、按字符集比较，
     * 顺序无关（{@code "AB"} 与 {@code "BA"} 等价）。</p>
     *
     * <p><b>错题本维护</b>：答错则 upsert 错题本（wrongCount+1）；答对则从错题本移除。</p>
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> submitAnswer(Integer userId, Integer questionId, String chosen) {
        Question q = questionMapper.selectById(questionId);
        if (q == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "题目不存在");
        }
        boolean correct = normalize(q.getAnswer()).equals(normalize(chosen));

        QuizRecord rec = new QuizRecord();
        rec.setUserId(userId);
        rec.setSid(q.getSid());
        rec.setQuestionId(questionId);
        rec.setChosen(chosen == null ? "" : chosen);
        rec.setCorrect((correct || q.getAnswer() == null) ? 1 : 0);
        rec.setCreatedAt(LocalDateTime.now());
        quizRecordMapper.insert(rec);

        if (correct) {
            // 答对：若该题曾在错题本，移除
            errorBookMapper.delete(new LambdaQueryWrapper<ErrorBook>()
                    .eq(ErrorBook::getUserId, userId)
                    .eq(ErrorBook::getQuestionId, questionId));
        } else {
            upsertErrorBook(userId, q, chosen);
        }

        Map<String, Object> result = new HashMap<>(8);
        result.put("correct", correct);
        result.put("chosen", chosen);
        result.put("answer", q.getAnswer());
        result.put("analysis", q.getAnalysis());
        return result;
    }

    /**
     * 我的错题本（含题目详情）。
     */
    public List<Map<String, Object>> errorBook(Integer userId) {
        List<ErrorBook> books = errorBookMapper.selectList(new LambdaQueryWrapper<ErrorBook>()
                .eq(ErrorBook::getUserId, userId).orderByDesc(ErrorBook::getUpdatedAt));
        List<Map<String, Object>> out = new ArrayList<>(books.size());
        for (ErrorBook b : books) {
            Question q = questionMapper.selectById(b.getQuestionId());
            Map<String, Object> m = new HashMap<>(8);
            m.put("wrongCount", b.getWrongCount());
            m.put("lastChosen", b.getLastChosen());
            m.put("updatedAt", b.getUpdatedAt());
            if (q != null) {
                m.put("id", q.getId());
                m.put("stem", q.getStem());
                m.put("opts", q.getOpts());
                m.put("answer", q.getAnswer());
                m.put("analysis", q.getAnalysis());
            }
            out.add(m);
        }
        return out;
    }

    /**
     * 开始模考：从指定科目随机抽取 count 道题（练习模式，不下发答案）。
     */
    public Map<String, Object> startExam(Integer userId, Integer sid, Integer count) {
        Subject subject = subjectMapper.selectById(sid);
        if (subject == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "科目不存在");
        }
        List<Question> all = questionMapper.selectList(new LambdaQueryWrapper<Question>()
                .eq(Question::getSid, sid));
        if (all.isEmpty()) {
            throw new BizException(ErrorCode.NOT_FOUND, "该科目暂无题目");
        }
        int n = count == null || count < 1 ? Math.min(20, all.size()) : Math.min(count, all.size());
        // DB 无关随机：Java 侧洗牌，避免依赖数据库随机函数
        List<Question> pool = new ArrayList<>(all);
        Collections.shuffle(pool);
        List<Question> picked = pool.subList(0, n);

        Map<String, Object> result = new HashMap<>(4);
        result.put("sid", sid);
        result.put("subject", subject.getName());
        result.put("total", n);
        result.put("questions", picked.stream().map(this::toPracticeVo).collect(Collectors.toList()));
        return result;
    }

    /**
     * 交卷：判分并落库 ExamRecord，错题自动进入错题本。
     *
     * <p><b>整体在一个事务内</b>：模考记录 + N 条错题本更新要么全成要么全败。</p>
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> submitExam(Integer userId, Integer sid, int duration,
                                          Map<Integer, String> answers) {
        int total = answers.size();
        int right = 0;
        List<Map<String, Object>> wrong = new ArrayList<>();
        for (Map.Entry<Integer, String> e : answers.entrySet()) {
            Question q = questionMapper.selectById(e.getKey());
            if (q == null) {
                continue;
            }
            boolean ok = normalize(q.getAnswer()).equals(normalize(e.getValue()));
            if (ok) {
                right++;
            } else {
                upsertErrorBook(userId, q, e.getValue());
                Map<String, Object> w = new HashMap<>(4);
                w.put("questionId", q.getId());
                w.put("chosen", e.getValue());
                w.put("answer", q.getAnswer());
                wrong.add(w);
            }
        }
        ExamRecord rec = new ExamRecord();
        rec.setUserId(userId);
        rec.setSid(sid);
        rec.setTotal(total);
        rec.setRight(right);
        rec.setDuration(duration);
        rec.setCreatedAt(LocalDateTime.now());
        examRecordMapper.insert(rec);

        Map<String, Object> result = new HashMap<>(8);
        result.put("examId", rec.getId());
        result.put("total", total);
        result.put("right", right);
        result.put("wrong", total - right);
        result.put("score", total == 0 ? 0 : (int) Math.round(right * 100.0 / total));
        result.put("wrongQuestions", wrong);
        return result;
    }

    /** 我的模考记录 */
    public List<ExamRecord> examRecords(Integer userId) {
        return examRecordMapper.selectList(new LambdaQueryWrapper<ExamRecord>()
                .eq(ExamRecord::getUserId, userId).orderByDesc(ExamRecord::getCreatedAt).last("LIMIT 20"));
    }

    // ===== 内部工具 =====

    private void upsertErrorBook(Integer userId, Question q, String chosen) {
        ErrorBook exist = errorBookMapper.selectOne(new LambdaQueryWrapper<ErrorBook>()
                .eq(ErrorBook::getUserId, userId)
                .eq(ErrorBook::getQuestionId, q.getId()));
        if (exist == null) {
            ErrorBook b = new ErrorBook();
            b.setUserId(userId);
            b.setQuestionId(q.getId());
            b.setWrongCount(1);
            b.setLastChosen(chosen);
            b.setCreatedAt(LocalDateTime.now());
            b.setUpdatedAt(LocalDateTime.now());
            errorBookMapper.insert(b);
        } else {
            exist.setWrongCount((exist.getWrongCount() == null ? 0 : exist.getWrongCount()) + 1);
            exist.setLastChosen(chosen);
            exist.setUpdatedAt(LocalDateTime.now());
            errorBookMapper.updateById(exist);
        }
    }

    /** 选项归一化：去空格、转大写、按字符排序，使 "BA"=="AB" */
    private String normalize(String s) {
        if (s == null) {
            return "";
        }
        return s.replaceAll("\\s+", "").toUpperCase().chars()
                .sorted()
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }

    private Map<String, Object> toPracticeVo(Question q) {
        Map<String, Object> m = new HashMap<>(6);
        m.put("id", q.getId());
        m.put("sid", q.getSid());
        m.put("stem", q.getStem());
        m.put("opts", q.getOpts());
        // 故意不下发 answer / analysis
        return m;
    }
}
