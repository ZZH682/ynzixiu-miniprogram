package com.ynzx.server.security;

import com.ynzx.server.common.BizException;
import com.ynzx.server.common.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 认证拦截器。
 *
 * <p>职责：</p>
 * <ol>
 *   <li>解析 Authorization: Bearer xxx，校验签名与有效期</li>
 *   <li>校验通过则把 {@link LoginUser} 放进 {@link UserContext}</li>
 *   <li>请求结束务必清理 ThreadLocal（线程池复用会串号）</li>
 * </ol>
 *
 * <p>设计取舍：没有用 Spring Security，是因为本项目只需"是否登录 + 是否管理员"
 * 两个维度，引入 Security 需要理解 FilterChain / SecurityContext / 认证管理器，
 * 对实习生来说是额外负担。面试时可以讲清楚这个 trade-off。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 放行非 Controller 方法（如静态资源）和预检请求
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String token = resolveToken(request);
        if (token == null) {
            // 未登录不在这里抛错，由 @RequireLogin 注解决定是否强制
            return true;
        }
        LoginUser user = jwtUtil.parseUserToken(token);
        if (user != null) {
            UserContext.set(user);
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        // 关键：清理 ThreadLocal，否则 Tomcat 线程复用会把上一个用户的身份带给下一个请求
        UserContext.clear();
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER);
        if (header != null && header.startsWith(PREFIX)) {
            return header.substring(PREFIX.length()).trim();
        }
        // 兼容 WebSocket / 某些客户端把 token 放 query 的场景
        return request.getParameter("token");
    }

    /** 强制登录断言，配合业务方法显式调用 */
    public static LoginUser requireLogin() {
        LoginUser user = UserContext.get();
        if (user == null) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
        return user;
    }
}
