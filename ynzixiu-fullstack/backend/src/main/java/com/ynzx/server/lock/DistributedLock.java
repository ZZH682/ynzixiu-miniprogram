package com.ynzx.server.lock;

import java.util.function.Supplier;

/**
 * 分布式锁抽象。
 *
 * <p><b>核心语义</b>：跨进程的互斥。单机用 {@code synchronized}/{@code ReentrantLock}
 * 只能保证本进程内互斥，多实例部署时必须依赖 Redis/ZK 等外部协调。</p>
 */
public interface DistributedLock {

    /**
     * 在锁保护下执行操作。
     *
     * @param key    锁的业务 key
     * @param action 临界区逻辑
     * @return action 的返回值
     * @throws IllegalStateException 获取锁超时
     */
    <T> T executeWithLock(String key, Supplier<T> action);

    /**
     * 尝试加锁，不阻塞。
     *
     * @return 获得的锁句柄；null 表示未获得
     */
    LockHandle tryLock(String key);

    /**
     * 锁句柄，用于手动释放。
     */
    interface LockHandle extends AutoCloseable {
        @Override
        void close();
    }
}
