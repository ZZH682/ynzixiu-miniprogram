package com.ynzx.server.ratelimit;

/**
 * 限流器抽象。
 *
 * <p>抽接口是为了让"单机内存实现"和"Redis 分布式实现"可以互换，
 * 上层业务（拦截器）不感知具体实现。</p>
 */
public interface RateLimiter {

    /**
     * 尝试获取令牌。
     *
     * @param key 限流维度（如 IP、用户ID、手机号）
     * @return true 放行，false 触发限流
     */
    boolean tryAcquire(String key);
}
