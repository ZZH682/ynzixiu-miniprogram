package com.ynzx.server.lock;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

/**
 * 本地锁实现（单机 / 本地开发环境）。
 *
 * <p><b>为什么本地开发也要有分布式锁的实现？</b>
 * 为了让同一份业务代码在两种环境跑出相同行为——
 * 业务层只依赖 {@link DistributedLock} 接口，
 * 开发环境用本地锁，生产环境用 Redis 锁，切换只改配置。</p>
 *
 * <p><b>实现要点</b>：</p>
 * <ul>
 *   <li>{@link ReentrantLock}：可重入、公平锁（{@code new ReentrantLock(true)}），
 *       公平锁按 FIFO 排队，避免饥饿；但性能略低于非公平锁，
 *       高并发场景默认用非公平锁更划算。</li>
 *   <li>用 {@link ConcurrentHashMap} 存锁对象，避免每个 key 新建锁造成对象泄漏。</li>
 *   <li>{@code tryLock(timeout, unit)}：拿不到锁就抛异常，而不是无限等待。</li>
 * </ul>
 */
@Slf4j
public class LocalDistributedLock implements DistributedLock {

    private final Map<String, ReentrantLock> locks = new ConcurrentHashMap<>();
    private final long waitMillis;

    public LocalDistributedLock(long waitMillis) {
        this.waitMillis = waitMillis;
    }

    @Override
    public LockHandle tryLock(String key) {
        ReentrantLock lock = locks.computeIfAbsent(key, k -> new ReentrantLock());
        boolean acquired;
        try {
            acquired = lock.tryLock(waitMillis, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
        if (!acquired) {
            return null;
        }
        return () -> {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        };
    }

    @Override
    public <T> T executeWithLock(String key, Supplier<T> action) {
        LockHandle handle = tryLock(key);
        if (handle == null) {
            throw new IllegalStateException("获取锁超时: " + key);
        }
        try (handle) {
            return action.get();
        }
    }

    public int size() {
        return locks.size();
    }
}
