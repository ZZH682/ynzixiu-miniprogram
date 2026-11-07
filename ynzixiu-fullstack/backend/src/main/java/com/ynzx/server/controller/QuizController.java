package com.ynzx.server.controller;

import com.ynzx.server.common.R;
import com.ynzx.server.dto.ExamSubmitRequest;
import com.ynzx.server.dto.QuizSubmitRequest;
import com.ynzx.server.security.AuthInterceptor;
import com.ynzx.server.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 在线教学：题库刷题、自动判卷、错题本、在线模考。
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    /** 题库列表（练习模式） */
    @GetMapping("/quiz/questions")
    public R<?> questions(@RequestParam Integer sid,
                          @RequestParam(defaultValue = "1") Integer page,
                          @RequestParam(defaultValue = "20") Integer size) {
        return R.ok(quizService.listQuestions(sid, page, size));
    }

    /** 提交单题答案，自动判卷 */
    @PostMapping("/quiz/submit")
    public R<?> submit(@RequestBody QuizSubmitRequest req) {
        int userId = AuthInterceptor.requireLogin().getUserId();
        return R.ok(quizService.submitAnswer(userId, req.getQuestionId(), req.getChosen()));
    }

    /** 我的错题本 */
    @GetMapping("/quiz/error-book")
    public R<?> errorBook() {
        int userId = AuthInterceptor.requireLogin().getUserId();
        return R.ok(quizService.errorBook(userId));
    }

    /** 开始模考 */
    @PostMapping("/exam/start")
    public R<?> startExam(@RequestParam Integer sid, @RequestParam(defaultValue = "20") Integer count) {
        int userId = AuthInterceptor.requireLogin().getUserId();
        return R.ok(quizService.startExam(userId, sid, count));
    }

    /** 模考交卷 */
    @PostMapping("/exam/submit")
    public R<?> submitExam(@RequestBody ExamSubmitRequest req) {
        int userId = AuthInterceptor.requireLogin().getUserId();
        Map<Integer, String> answers = new HashMap<>(req.getAnswers().size());
        for (Map.Entry<String, String> e : req.getAnswers().entrySet()) {
            answers.put(Integer.parseInt(e.getKey()), e.getValue());
        }
        return R.ok(quizService.submitExam(userId, req.getSid(), req.getDuration() == null ? 0 : req.getDuration(), answers));
    }

    /** 我的模考记录 */
    @GetMapping("/exam/records")
    public R<?> examRecords() {
        int userId = AuthInterceptor.requireLogin().getUserId();
        return R.ok(quizService.examRecords(userId));
    }
}
