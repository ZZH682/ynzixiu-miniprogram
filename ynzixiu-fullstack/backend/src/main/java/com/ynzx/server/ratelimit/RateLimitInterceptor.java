package com.ynzx.server.ratelimit;

import com.ynzx.server.common.R;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;

/**
 * 全局限流拦截器。
 *
 * <p><b>限流维度用 IP + URI 前缀</b>：只按 IP 限流的话，一个 NAT 出口的
 * 整个公司会被误伤；只按 URI 限流的话，单个用户可以打爆一个接口。
 * 用"IP + 业务前缀"两个维度做 Key，粒度最合理。</p>
 */
@Slf4j
@Order(1)
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper;

    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!enabled || !(handler instanceof HandlerMethod)) {
            return true;
        }
        String ip = resolveIp(request);
        // 只对写操作和敏感接口限流，GET 查询不限制（否则浏览页面就可能被拦）
        String method = request.getMethod();
        if ("GET".equalsIgnoreCase(method) && !request.getRequestURI().contains("/admin")) {
            return true;
        }
        String key = ip + ":" + resolveBucket(request.getRequestURI());
        if (!rateLimiter.tryAcquire(key)) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json;charset=UTF-8");
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setHeader("Retry-After", "60");
            response.getWriter().write(objectMapper.writeValueAsString(
                    R.fail(com.ynzx.server.common.ErrorCode.TOO_MANY_REQUESTS)));
            return false;
        }
        return true;
    }

    /** 业务桶：把接口按业务域分组，避免每个 URL 一个 key 造成 registry 膨胀 */
    private String resolveBucket(String uri) {
        int idx = uri.lastIndexOf('/');
        if (idx <= 0) {
            return "root";
        }
        String[] parts = uri.split("/");
        return parts.length >= 4 ? parts[3] : "misc";
    }

    /**
     * 取真实客户端 IP。
     *
     * <p>要读 X-Forwarded-For 的第一个值（最左侧是原始客户端），
     * 因为代理会按"客户端, 代理1, 代理2"顺序追加。
     * 注意：这个头可以被伪造，所以生产上必须只在可信反向代理后面才用。</p>
     */
    private String resolveIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank() && !"unknown".equalsIgnoreCase(xff)) {
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
