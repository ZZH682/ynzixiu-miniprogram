package com.ynzx.server.ratelimit;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 基于 {@link ConcurrentHashMap} + 滑动窗口的限流器注册表。
 *
 * <p><b>并发点</b>：</p>
 * <ul>
 *   <li>{@code ConcurrentHashMap}：key → 窗口状态的并发安全注册表，避免用 synchronized 全局锁</li>
 *   <li>{@code AtomicReference + CAS}：单 key 内部的无锁状态更新</li>
 *   <li>定时清理过期 key，防止内存无限增长（这是生产上最常见的内存泄漏点）</li>
 * </ul>
 *
 * <p>注意：构造器带参数，所以不能加 {@code @Component}，
 * 由 {@code WebMvcConfig#rateLimiter()} 显式创建为 Bean。</p>
 */
@Slf4j
public class LocalRateLimiter implements RateLimiter {

    private final SlidingWindowRateLimiter window;
    private final Map<String, AtomicReference<SlidingWindowRateLimiter.State>> registry = new ConcurrentHashMap<>();

    public LocalRateLimiter(int limit, int windowSeconds) {
        this.window = new SlidingWindowRateLimiter(limit, windowSeconds);
    }

    @Override
    public boolean tryAcquire(String key) {
        AtomicReference<SlidingWindowRateLimiter.State> ref =
                registry.computeIfAbsent(key, k -> new AtomicReference<>(null));
        return window.tryAcquire(ref, System.currentTimeMillis());
    }

    /**
     * 清理长时间未活跃的 key。
     *
     * <p>为什么需要：如果只用 {@code computeIfAbsent} 而不清理，
     * 攻击者用随机 IP 打请求会让 map 无限增长，最终 OOM。
     * 生产上这里应换成 Caffeine 的 expireAfterWrite 自动淘汰。</p>
     */
    public void evictIdle(long idleMillis) {
        long deadline = System.currentTimeMillis() - idleMillis;
        registry.entrySet().removeIf(e -> {
            SlidingWindowRateLimiter.State s = e.getValue().get();
            return s == null || s.baseSecond() * 1000 < deadline;
        });
    }

    public int size() {
        return registry.size();
    }
}
