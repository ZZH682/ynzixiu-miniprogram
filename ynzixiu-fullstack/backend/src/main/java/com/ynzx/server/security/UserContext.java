package com.ynzx.server.security;

import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.common.BizException;

/**
 * 当前请求的登录用户上下文。
 *
 * <p>用 ThreadLocal 而不用 SecurityContextHolder，是因为本项目不引入 Spring Security
 * 全家桶（JD 只要求"扎实的 Java 基础"，轻量可控更适合实习生上手）。</p>
 *
 * <p><b>关键点：必须在请求结束时清理</b>，否则线程池复用会导致 A 用户拿到 B 用户身份。
 * 清理逻辑放在 {@code AuthInterceptor#afterCompletion}。</p>
 */
public final class UserContext {

    private static final ThreadLocal<LoginUser> HOLDER = new ThreadLocal<>();

    private UserContext() {
    }

    public static void set(LoginUser user) {
        HOLDER.set(user);
    }

    /** 获取当前登录用户，未登录抛 401 */
    public static LoginUser require() {
        LoginUser user = HOLDER.get();
        if (user == null) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
        return user;
    }

    /** 获取当前登录用户，未登录返回 null（用于"登录可选"接口） */
    public static LoginUser get() {
        return HOLDER.get();
    }

    public static Integer userId() {
        LoginUser u = HOLDER.get();
        return u == null ? null : u.getUserId();
    }

    public static void clear() {
        HOLDER.remove();
    }
}
