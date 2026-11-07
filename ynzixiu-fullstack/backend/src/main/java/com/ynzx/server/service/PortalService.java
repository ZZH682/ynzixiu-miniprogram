package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.common.BizException;
import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.entity.Banner;
import com.ynzx.server.entity.Business;
import com.ynzx.server.entity.Campus;
import com.ynzx.server.entity.Chapter;
import com.ynzx.server.entity.Coupon;
import com.ynzx.server.entity.CouponClaim;
import com.ynzx.server.entity.Course;
import com.ynzx.server.entity.ErrorBook;
import com.ynzx.server.entity.ExamRecord;
import com.ynzx.server.entity.GroupInfo;
import com.ynzx.server.entity.GroupMember;
import com.ynzx.server.entity.GroupRule;
import com.ynzx.server.entity.Material;
import com.ynzx.server.entity.MaterialDownload;
import com.ynzx.server.entity.News;
import com.ynzx.server.entity.Order;
import com.ynzx.server.entity.PushLog;
import com.ynzx.server.entity.Question;
import com.ynzx.server.entity.QuizRecord;
import com.ynzx.server.entity.Receipt;
import com.ynzx.server.entity.Referral;
import com.ynzx.server.entity.Review;
import com.ynzx.server.entity.ServiceMessage;
import com.ynzx.server.entity.Setting;
import com.ynzx.server.entity.Signup;
import com.ynzx.server.entity.Story;
import com.ynzx.server.entity.StudyProgress;
import com.ynzx.server.entity.Subject;
import com.ynzx.server.entity.Teacher;
import com.ynzx.server.entity.User;
import com.ynzx.server.entity.Withdraw;
import com.ynzx.server.mapper.BannerMapper;
import com.ynzx.server.mapper.BusinessMapper;
import com.ynzx.server.mapper.CampusMapper;
import com.ynzx.server.mapper.ChapterMapper;
import com.ynzx.server.mapper.CouponClaimMapper;
import com.ynzx.server.mapper.CouponMapper;
import com.ynzx.server.mapper.CourseMapper;
import com.ynzx.server.mapper.ErrorBookMapper;
import com.ynzx.server.mapper.ExamRecordMapper;
import com.ynzx.server.mapper.GroupInfoMapper;
import com.ynzx.server.mapper.GroupMemberMapper;
import com.ynzx.server.mapper.GroupRuleMapper;
import com.ynzx.server.mapper.MaterialDownloadMapper;
import com.ynzx.server.mapper.MaterialMapper;
import com.ynzx.server.mapper.NewsMapper;
import com.ynzx.server.mapper.OrderMapper;
import com.ynzx.server.mapper.PushLogMapper;
import com.ynzx.server.mapper.QuestionMapper;
import com.ynzx.server.mapper.QuizRecordMapper;
import com.ynzx.server.mapper.ReceiptMapper;
import com.ynzx.server.mapper.ReferralMapper;
import com.ynzx.server.mapper.ReviewMapper;
import com.ynzx.server.mapper.ServiceMessageMapper;
import com.ynzx.server.mapper.SettingMapper;
import com.ynzx.server.mapper.SignupMapper;
import com.ynzx.server.mapper.StoryMapper;
import com.ynzx.server.mapper.StudyProgressMapper;
import com.ynzx.server.mapper.SubjectMapper;
import com.ynzx.server.mapper.TeacherMapper;
import com.ynzx.server.mapper.UserMapper;
import com.ynzx.server.mapper.WithdrawMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 门户聚合服务：把分散在 30 张表里的展示内容与用户态数据一次性聚合给前端。
 *
 * <p>设计目的：H5 首屏只需要一个请求就能拿到全站内容；登录后再用一个请求
 * 同步学员的订单 / 学习 / 刷题 / 营销数据，避免 N+1 次往返。
 * 金额统一沿用数据库的「分」，由前端同步层换算成「元」展示。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PortalService {

    private final BusinessMapper businessMapper;
    private final CourseMapper courseMapper;
    private final ChapterMapper chapterMapper;
    private final NewsMapper newsMapper;
    private final SubjectMapper subjectMapper;
    private final QuestionMapper questionMapper;
    private final StoryMapper storyMapper;
    private final TeacherMapper teacherMapper;
    private final CampusMapper campusMapper;
    private final ReviewMapper reviewMapper;
    private final MaterialMapper materialMapper;
    private final BannerMapper bannerMapper;
    private final CouponMapper couponMapper;
    private final CouponClaimMapper couponClaimMapper;
    private final GroupRuleMapper groupRuleMapper;
    private final GroupInfoMapper groupInfoMapper;
    private final GroupMemberMapper groupMemberMapper;
    private final OrderMapper orderMapper;
    private final SignupMapper signupMapper;
    private final QuizRecordMapper quizRecordMapper;
    private final ExamRecordMapper examRecordMapper;
    private final ErrorBookMapper errorBookMapper;
    private final StudyProgressMapper studyProgressMapper;
    private final MaterialDownloadMapper materialDownloadMapper;
    private final ReferralMapper referralMapper;
    private final ReceiptMapper receiptMapper;
    private final ServiceMessageMapper serviceMessageMapper;
    private final UserMapper userMapper;
    private final WithdrawMapper withdrawMapper;
    private final PushLogMapper pushLogMapper;
    private final SettingMapper settingMapper;
    private final CouponService couponService;
    private final ReferralService referralService;
    private final Clock clock;

    /** 全站展示内容（公开，无需登录） */
    public Map<String, Object> catalog() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("businesses", businessMapper.selectList(
                new LambdaQueryWrapper<Business>().orderByAsc(Business::getSort)));
        m.put("courses", courseMapper.selectList(
                new LambdaQueryWrapper<Course>().eq(Course::getStatus, 1).orderByAsc(Course::getId)));
        m.put("chapters", chapterMapper.selectList(
                new LambdaQueryWrapper<Chapter>().orderByAsc(Chapter::getCourseId, Chapter::getSort, Chapter::getId)));
        m.put("news", newsMapper.selectList(
                new LambdaQueryWrapper<News>().orderByDesc(News::getTop).orderByDesc(News::getDate)));
        m.put("subjects", subjectMapper.selectList(
                new LambdaQueryWrapper<Subject>().orderByAsc(Subject::getId)));
        m.put("questions", questionMapper.selectList(
                new LambdaQueryWrapper<Question>().orderByAsc(Question::getSid, Question::getId)));
        m.put("stories", storyMapper.selectList(
                new LambdaQueryWrapper<Story>().orderByDesc(Story::getId)));
        m.put("teachers", teacherMapper.selectList(
                new LambdaQueryWrapper<Teacher>().orderByDesc(Teacher::getYears)));
        m.put("campus", campusMapper.selectList(
                new LambdaQueryWrapper<Campus>().orderByAsc(Campus::getSort)));
        m.put("reviews", reviewMapper.selectList(
                new LambdaQueryWrapper<Review>().eq(Review::getStatus, "approved").orderByDesc(Review::getId)));
        m.put("materials", materialMapper.selectList(
                new LambdaQueryWrapper<Material>().orderByAsc(Material::getSort)));
        m.put("banners", bannerMapper.selectList(
                new LambdaQueryWrapper<Banner>().eq(Banner::getStatus, 1).orderByAsc(Banner::getSort)));
        m.put("coupons", couponMapper.selectList(
                new LambdaQueryWrapper<Coupon>().eq(Coupon::getStatus, 1).orderByAsc(Coupon::getId)));
        m.put("groupRules", groupRuleMapper.selectList(
                new LambdaQueryWrapper<GroupRule>().orderByAsc(GroupRule::getCourseId)));
        m.put("openGroups", groupInfoMapper.selectList(
                new LambdaQueryWrapper<GroupInfo>().eq(GroupInfo::getStatus, "forming").orderByDesc(GroupInfo::getId)));
        // settings 以 [{k,v}] 行数组下发（前端 sync.js 读 row.k / row.v）；
        // 走实体的 String 属性，规避 H2 CLOB 被当成 JdbcClob 序列化出畸形 JSON。
        List<Map<String, Object>> settingRows = new ArrayList<>();
        for (Setting s : settingMapper.selectAll()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("k", s.getK());
            row.put("v", s.getV());
            settingRows.add(row);
        }
        m.put("settings", settingRows);
        return m;
    }

    /** 学校基础设置（公开） */
    public Map<String, String> settings() {
        Map<String, String> out = new LinkedHashMap<>();
        for (Setting s : settingMapper.selectAll()) {
            if (s.getK() != null) {
                out.put(s.getK(), s.getV() == null ? "" : s.getV());
            }
        }
        return out;
    }

    /** 学员全链路数据（需登录）。password_hash 等敏感字段不下发。 */
    public Map<String, Object> me(Integer userId) {
        Map<String, Object> m = new LinkedHashMap<>();
        User user = userMapper.selectById(userId);
        Map<String, Object> safeUser = new LinkedHashMap<>();
        if (user != null) {
            safeUser.put("id", user.getId());
            safeUser.put("phone", user.getPhone());
            safeUser.put("nickname", user.getNickname());
            safeUser.put("role", user.getRole());
            safeUser.put("inviteCode", user.getInviteCode());
            safeUser.put("balance", user.getBalance());
        }
        m.put("user", safeUser);
        m.put("orders", orderMapper.selectList(byUser(new LambdaQueryWrapper<Order>(), Order::getUserId, userId)));
        m.put("signups", signupMapper.selectList(byUser(new LambdaQueryWrapper<Signup>(), Signup::getUserId, userId)));
        m.put("quizRecords", quizRecordMapper.selectList(byUser(new LambdaQueryWrapper<QuizRecord>(), QuizRecord::getUserId, userId)));
        m.put("examRecords", examRecordMapper.selectList(byUser(new LambdaQueryWrapper<ExamRecord>(), ExamRecord::getUserId, userId)));
        m.put("errorBook", errorBookMapper.selectList(byUser(new LambdaQueryWrapper<ErrorBook>(), ErrorBook::getUserId, userId)));
        m.put("studyProgress", studyProgressMapper.selectList(byUser(new LambdaQueryWrapper<StudyProgress>(), StudyProgress::getUserId, userId)));
        m.put("downloads", materialDownloadMapper.selectList(byUser(new LambdaQueryWrapper<MaterialDownload>(), MaterialDownload::getUserId, userId)));
        m.put("couponClaims", couponClaimMapper.selectList(byUser(new LambdaQueryWrapper<CouponClaim>(), CouponClaim::getUserId, userId)));
        m.put("referrals", referralMapper.selectList(byUser(new LambdaQueryWrapper<Referral>(), Referral::getUserId, userId)));
        m.put("withdraws", withdrawMapper.selectList(byUser(new LambdaQueryWrapper<Withdraw>(), Withdraw::getUserId, userId)));
        m.put("receipts", receiptMapper.selectList(byUser(new LambdaQueryWrapper<Receipt>(), Receipt::getUserId, userId)));
        m.put("serviceMessages", serviceMessageMapper.selectList(byUser(new LambdaQueryWrapper<ServiceMessage>(), ServiceMessage::getUserId, userId)));
        m.put("groups", groupMemberMapper.selectList(byUser(new LambdaQueryWrapper<GroupMember>(), GroupMember::getUserId, userId)));
        m.put("messages", pushLogMapper.selectList(byUser(new LambdaQueryWrapper<PushLog>(), PushLog::getUserId, userId)));
        m.put("referralStats", referralService.stats(userId));
        return m;
    }

    private <T> LambdaQueryWrapper<T> byUser(LambdaQueryWrapper<T> w,
                                             com.baomidou.mybatisplus.core.toolkit.support.SFunction<T, ?> field,
                                             Integer userId) {
        // 只做归属过滤；排序交给前端，避免不同数据库对 NULL 排序行为不一致
        return w.eq(field, userId);
    }

    /** 标记章节已学（试听章节或已购课程可学） */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> markStudy(Integer userId, Integer courseId, Integer chapterNo) {
        List<Chapter> chapters = chapterMapper.selectList(new LambdaQueryWrapper<Chapter>()
                .eq(Chapter::getCourseId, courseId)
                .orderByAsc(Chapter::getSort, Chapter::getId));
        if (chapters.isEmpty()) {
            throw new BizException(ErrorCode.NOT_FOUND, "课程暂无章节");
        }
        int idx = (chapterNo == null ? 1 : chapterNo) - 1;
        if (idx < 0 || idx >= chapters.size()) {
            throw new BizException(ErrorCode.PARAM_ERROR, "章节序号不合法");
        }
        Chapter ch = chapters.get(idx);
        boolean owned = orderMapper.selectCount(new LambdaQueryWrapper<Order>()
                .eq(Order::getUserId, userId)
                .eq(Order::getCourseId, courseId)
                .in(Order::getStatus, "paid", "part_paid")) > 0;
        if (!owned && (ch.getTrial() == null || ch.getTrial() != 1)) {
            throw new BizException(ErrorCode.CHAPTER_LOCKED);
        }
        StudyProgress exist = studyProgressMapper.selectOne(new LambdaQueryWrapper<StudyProgress>()
                .eq(StudyProgress::getUserId, userId)
                .eq(StudyProgress::getCourseId, courseId)
                .eq(StudyProgress::getChapterId, ch.getId())
                .last("LIMIT 1"));
        LocalDateTime now = LocalDateTime.now(clock);
        if (exist == null) {
            StudyProgress p = new StudyProgress();
            p.setUserId(userId);
            p.setCourseId(courseId);
            p.setChapterId(ch.getId());
            p.setProgress(100);
            p.setFinished(1);
            p.setUpdatedAt(now);
            studyProgressMapper.insert(p);
        } else {
            exist.setFinished(1);
            exist.setProgress(100);
            exist.setUpdatedAt(now);
            studyProgressMapper.updateById(exist);
        }
        Map<String, Object> out = new HashMap<>(4);
        out.put("courseId", courseId);
        out.put("chapterNo", idx + 1);
        out.put("chapterId", ch.getId());
        out.put("owned", owned);
        return out;
    }

    /** 领券 */
    public Map<String, Object> claimCoupon(Integer userId, Integer couponId) {
        return couponService.claim(userId, couponId);
    }

    /** 客服留言（允许未登录） */
    @Transactional(rollbackFor = Exception.class)
    public Integer postMessage(Integer userId, String phone, String content) {
        if (content == null || content.isBlank()) {
            throw new BizException(ErrorCode.PARAM_ERROR, "留言内容不能为空");
        }
        ServiceMessage msg = new ServiceMessage();
        msg.setUserId(userId);
        msg.setPhone(phone);
        msg.setContent(content.length() > 2000 ? content.substring(0, 2000) : content);
        msg.setFromUser(1);
        msg.setCreatedAt(LocalDateTime.now(clock));
        serviceMessageMapper.insert(msg);
        return msg.getId();
    }

    /** 申请提现：条件扣减余额，余额不足不产生提现单 */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> withdraw(Integer userId, Integer amount, String account) {
        if (amount == null || amount <= 0) {
            throw new BizException(ErrorCode.WITHDRAW_AMOUNT_INVALID);
        }
        if (userMapper.deductBalance(userId, amount) == 0) {
            throw new BizException(ErrorCode.BALANCE_INSUFFICIENT);
        }
        Withdraw w = new Withdraw();
        w.setUserId(userId);
        w.setAmount(amount);
        w.setStatus("pending");
        w.setAccount(account == null ? "" : account);
        w.setCreatedAt(LocalDateTime.now(clock));
        withdrawMapper.insert(w);
        User user = userMapper.selectById(userId);
        Map<String, Object> out = new HashMap<>(4);
        out.put("withdrawId", w.getId());
        out.put("amount", amount);
        out.put("balance", user == null ? 0 : user.getBalance());
        out.put("status", "pending");
        return out;
    }

    /** 电子收据（按订单号，校验归属） */
    public Map<String, Object> receipt(String orderNo, Integer userId) {
        Order order = orderMapper.selectOne(new LambdaQueryWrapper<Order>().eq(Order::getOrderNo, orderNo));
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BizException(ErrorCode.ORDER_NOT_FOUND);
        }
        Receipt receipt = receiptMapper.selectOne(new LambdaQueryWrapper<Receipt>()
                .eq(Receipt::getOrderNo, orderNo).orderByDesc(Receipt::getId).last("LIMIT 1"));
        Course course = courseMapper.selectById(order.getCourseId());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("orderNo", order.getOrderNo());
        out.put("receiptNo", receipt == null ? "" : receipt.getReceiptNo());
        out.put("title", course == null ? "课程" : course.getTitle());
        out.put("amount", order.getAmount());
        out.put("paid", order.getPaid());
        out.put("listPrice", course == null ? order.getAmount() : course.getPrice());
        out.put("plan", order.getPlan());
        out.put("status", order.getStatus());
        out.put("channel", receipt == null ? "demo" : receipt.getChannel());
        out.put("createdAt", order.getCreatedAt());
        out.put("paidAt", receipt == null ? null : receipt.getPaidAt());
        return out;
    }
}
