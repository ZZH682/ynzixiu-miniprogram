package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.common.BizException;
import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.config.AppProperties;
import com.ynzx.server.entity.SmsCode;
import com.ynzx.server.entity.User;
import com.ynzx.server.mapper.SmsCodeMapper;
import com.ynzx.server.mapper.UserMapper;
import com.ynzx.server.ratelimit.RateLimiter;
import com.ynzx.server.security.JwtUtil;
import com.ynzx.server.security.LoginUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 认证服务：验证码登录 / 密码登录 / 管理端登录。
 *
 * <p><b>相比原 Node 版修复的缺陷</b>：</p>
 * <ul>
 *   <li><b>验证码有效期</b>：原版写入本地时间字符串、比较用 UTC 字符串，
 *       中国时区下凭空多 8 小时，"5 分钟有效"实际变成 485 分钟。
 *       本版统一用 {@link LocalDateTime} + 注入的 {@link Clock}，
 *       写入与比较用同一时区基准，不可能再错位。</li>
 *   <li><b>邀请码丢失</b>：原版参数校验只拷贝 schema 里声明的字段，
 *       {@code inviteCode} 没声明就被静默丢弃，邀请关系永远建不起来。
 *       本版用 DTO + {@code @Valid} 显式声明，不存在"静默丢字段"。</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String CODE_ALPHABET = "0123456789";

    private final UserMapper userMapper;
    private final SmsCodeMapper smsCodeMapper;
    private final JwtUtil jwtUtil;
    private final AppProperties props;
    private final Clock clock;
    private final RateLimiter rateLimiter;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    /**
     * 发送验证码。
     *
     * <p>限流维度用手机号，避免同号刷短信；原版是"每分钟最多 N 条"，
     * 这里用滑动窗口实现。</p>
     */
    public Map<String, Object> sendSmsCode(String phone) {
        if (phone == null || !phone.matches("^1[3-9]\\d{9}$")) {
            throw new BizException(ErrorCode.PARAM_ERROR, "手机号格式不正确");
        }
        String limitKey = "sms:" + phone;
        if (!rateLimiter.tryAcquire(limitKey)) {
            throw new BizException(ErrorCode.SMS_SEND_TOO_FREQUENT);
        }

        String code = props.getSms().getDevCode() != null && !props.getSms().getDevCode().isBlank()
                ? props.getSms().getDevCode()
                : randomCode();

        LocalDateTime now = LocalDateTime.now(clock);
        LocalDateTime expireAt = now.plusMinutes(props.getSms().getTtlMinutes());

        SmsCode entity = new SmsCode();
        entity.setPhone(phone);
        entity.setCode(code);
        entity.setPurpose("login");
        entity.setExpiredAt(expireAt);
        entity.setUsed(0);
        entity.setCreatedAt(now);
        smsCodeMapper.insert(entity);

        Map<String, Object> result = new HashMap<>(4);
        result.put("expireSeconds", props.getSms().getTtlMinutes() * 60);
        // 演示模式把验证码直接返回给前端，方便本地联调；生产必须去掉
        if (props.getSms().getDevCode() != null && !props.getSms().getDevCode().isBlank()) {
            result.put("devCode", code);
        }
        log.info("验证码已生成 phone={} expireAt={}", phone, expireAt);
        return result;
    }

    /**
     * 验证码登录（登录即注册）。
     *
     * @param inviteCode 邀请码，可选；用于建立推荐关系
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> loginBySms(String phone, String code, String inviteCode) {
        SmsCode sms = smsCodeMapper.selectOne(new LambdaQueryWrapper<SmsCode>()
                .eq(SmsCode::getPhone, phone)
                .eq(SmsCode::getPurpose, "login")
                .eq(SmsCode::getUsed, 0)
                .orderByDesc(SmsCode::getId)
                .last("LIMIT 1"));
        if (sms == null) {
            throw new BizException(ErrorCode.SMS_CODE_INVALID);
        }
        LocalDateTime now = LocalDateTime.now(clock);
        // 关键修复：写入与比较都用同一个 LocalDateTime.now(clock)，不存在时区错位
        if (now.isAfter(sms.getExpiredAt())) {
            throw new BizException(ErrorCode.SMS_CODE_EXPIRED);
        }
        if (!sms.getCode().equals(code)) {
            throw new BizException(ErrorCode.SMS_CODE_INVALID);
        }
        // 标记已使用：用条件更新，保证并发下同一验证码只能用一次
        int updated = smsCodeMapper.markUsed(sms.getId());
        if (updated == 0) {
            throw new BizException(ErrorCode.SMS_CODE_INVALID);
        }

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getPhone, phone));
        boolean isNew = false;
        if (user == null) {
            user = new User();
            user.setPhone(phone);
            user.setNickname("学员" + phone.substring(phone.length() - 4));
            user.setRole("user");
            user.setBalance(0);
            user.setInviteCode(generateInviteCode(phone));
            user.setCreatedAt(now);
            user.setUpdatedAt(now);
            userMapper.insert(user);
            isNew = true;
        }

        // 绑定邀请关系（只在注册时绑定一次，避免老用户被"劫持"邀请人）
        if (isNew && inviteCode != null && !inviteCode.isBlank()) {
            User inviter = userMapper.selectByInviteCode(inviteCode);
            if (inviter != null && !inviter.getId().equals(user.getId())) {
                user.setInviterId(inviter.getId());
                userMapper.updateById(user);
            }
        }

        String token = jwtUtil.issueUserToken(user.getId(), user.getPhone(), user.getNickname(), user.getRole());
        Map<String, Object> result = new HashMap<>(6);
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("phone", user.getPhone());
        result.put("nickname", user.getNickname());
        result.put("role", user.getRole());
        result.put("balance", user.getBalance());
        result.put("isNewUser", isNew);
        return result;
    }

    /**
     * 密码登录（管理端使用）。
     */
    public Map<String, Object> loginByPassword(String phone, String password) {
        if (!rateLimiter.tryAcquire("login:" + phone)) {
            throw new BizException(ErrorCode.TOO_MANY_REQUESTS);
        }
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getPhone, phone));
        if (user == null || user.getPasswordHash() == null
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BizException(ErrorCode.LOGIN_FAILED);
        }
        String token = "admin".equals(user.getRole())
                ? jwtUtil.issueAdminToken(user.getId(), user.getPhone(), user.getNickname())
                : jwtUtil.issueUserToken(user.getId(), user.getPhone(), user.getNickname(), user.getRole());

        Map<String, Object> result = new HashMap<>(5);
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("phone", user.getPhone());
        result.put("nickname", user.getNickname());
        result.put("role", user.getRole());
        return result;
    }

    /**
     * 生成邀请码：YZ + 手机号后 6 位。
     *
     * <p><b>关键修复</b>：原 Node 版前端用 {@code 'YZ'+手机号后6位}，
     * 服务端却用 {@code 'U'+base36时间戳}，两边规则不一致，
     * 即使前端正确传了邀请码也匹配不上。这里统一规则并写进文档。</p>
     */
    private String generateInviteCode(String phone) {
        return "YZ" + phone.substring(phone.length() - 6);
    }

    private String randomCode() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
        }
        return sb.toString();
    }
}
