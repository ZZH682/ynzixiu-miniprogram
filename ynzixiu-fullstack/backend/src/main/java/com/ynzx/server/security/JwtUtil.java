package com.ynzx.server.security;

import com.ynzx.server.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 签发与解析。
 *
 * <p><b>两个密钥域</b>：用户端 token 与管理端 token 用不同密钥签名，
 * 因此用户 token 无法访问管理端接口——这是"最小权限"在密钥层面的落地。</p>
 *
 * <p><b>时间处理</b>：所有时间计算统一走注入的 {@link Clock}，而不是
 * {@code new Date()} / {@code System.currentTimeMillis()}。
 * 这样测试可以注入固定时钟，验证"验证码 5 分钟过期"这类逻辑，
 * 也避免了原 Node 版把本地时间字符串与 UTC 串比较导致过期时间多出 8 小时的时区 bug。</p>
 */
@Slf4j
@Component
public class JwtUtil {

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_PHONE = "phone";
    private static final String CLAIM_NICKNAME = "nickname";
    private static final String CLAIM_TYPE = "typ";
    private static final String TYPE_USER = "user";
    private static final String TYPE_ADMIN = "admin";

    private final AppProperties props;
    private final Clock clock;
    private final SecretKey userKey;
    private final SecretKey adminKey;

    public JwtUtil(AppProperties props, Clock clock) {
        this.props = props;
        this.clock = clock;
        this.userKey = buildKey(props.getJwt().getUserSecret());
        this.adminKey = buildKey(props.getJwt().getAdminSecret());
    }

    private static SecretKey buildKey(String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT 密钥长度不足 32 字节，拒绝启动（当前 " + bytes.length + "）");
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    // ==================== 用户端 ====================

    public String issueUserToken(Integer userId, String phone, String nickname, String role) {
        Instant now = clock.instant();
        Instant exp = now.plus(Duration.ofMinutes(props.getJwt().getExpireMinutes()));
        Map<String, Object> claims = new HashMap<>(4);
        claims.put(CLAIM_ROLE, role);
        claims.put(CLAIM_PHONE, phone);
        claims.put(CLAIM_NICKNAME, nickname);
        claims.put(CLAIM_TYPE, TYPE_USER);
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuer(props.getJwt().getIssuer())
                .claims(claims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(userKey)
                .compact();
    }

    /** 解析并校验用户端 token；失败返回 null（由调用方决定抛 401） */
    public LoginUser parseUserToken(String token) {
        Claims claims = parse(token, userKey, TYPE_USER);
        if (claims == null) {
            return null;
        }
        return LoginUser.builder()
                .userId(Integer.valueOf(claims.getSubject()))
                .phone(claims.get(CLAIM_PHONE, String.class))
                .nickname(claims.get(CLAIM_NICKNAME, String.class))
                .role(claims.get(CLAIM_ROLE, String.class))
                .build();
    }

    // ==================== 管理端 ====================

    public String issueAdminToken(Integer userId, String phone, String nickname) {
        Instant now = clock.instant();
        Instant exp = now.plus(Duration.ofMinutes(props.getJwt().getAdminExpireMinutes()));
        Map<String, Object> claims = new HashMap<>(4);
        claims.put(CLAIM_ROLE, "admin");
        claims.put(CLAIM_PHONE, phone);
        claims.put(CLAIM_NICKNAME, nickname);
        claims.put(CLAIM_TYPE, TYPE_ADMIN);
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuer(props.getJwt().getIssuer())
                .claims(claims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(adminKey)
                .compact();
    }

    public LoginUser parseAdminToken(String token) {
        Claims claims = parse(token, adminKey, TYPE_ADMIN);
        if (claims == null) {
            return null;
        }
        return LoginUser.builder()
                .userId(Integer.valueOf(claims.getSubject()))
                .phone(claims.get(CLAIM_PHONE, String.class))
                .nickname(claims.get(CLAIM_NICKNAME, String.class))
                .role("admin")
                .build();
    }

    // ==================== 内部 ====================

    private Claims parse(String token, SecretKey key, String expectedType) {
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(props.getJwt().getIssuer())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            // 额外校验 token 类型，防止用户 token 冒用管理端密钥域（虽已用不同密钥，此处为纵深防御）
            if (!expectedType.equals(claims.get(CLAIM_TYPE, String.class))) {
                return null;
            }
            return claims;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT 解析失败: {}", e.getMessage());
            return null;
        }
    }
}
