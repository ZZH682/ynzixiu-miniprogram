package com.ynzx.server.ratelimit;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.atomic.AtomicReference;

/**
 * 滑动窗口限流器（单 key）。
 *
 * <p><b>为什么用滑动窗口而不是固定窗口？</b>
 * 固定窗口在边界会被打穿：限 100/min 时，第 59 秒发 100 个、第 61 秒再发 100 个，
 * 实际 2 秒内通过了 200 个。滑动窗口把窗口按秒切片并保留最近 N 秒的计数，
 * 任意连续 N 秒内的请求数都不会超过阈值。</p>
 *
 * <p><b>并发安全实现</b>：状态对象不可变，更新时<b>写时复制</b>整份计数数组，
 * 再用 {@link AtomicReference#compareAndSet} 提交；CAS 失败则重新读取最新状态重试。
 * 全程无锁（不阻塞其他线程），在 JDK9+ 上用 {@code Thread.onSpinWait()} 降低自旋开销。</p>
 *
 * <p><b>为什么必须写时复制？</b>
 * 如果原地修改共享数组再 CAS，比较的是旧引用、新引用其实同一对象，
 * CAS 会"永远成功"，并发下计数就会丢失——这是典型的 CAS 误用。
 * 不可变快照 + 原子替换才能保证正确性。</p>
 *
 * <p><b>取舍</b>：单机内存实现，多实例部署时各限各的；
 * 生产应换成 Redis + Lua 分布式限流。这里保留 {@link RateLimiter} 接口便于替换。</p>
 */
@Slf4j
public class SlidingWindowRateLimiter {

    private final int limit;
    private final int windowSeconds;

    /**
     * 不可变窗口快照。
     *
     * @param baseSecond 快照对应的窗口起始秒（epochSecond）
     * @param counts     每个秒槽的计数，索引 = (当前秒 - baseSecond) % windowSeconds
     */
    public static final class State {
        private final long baseSecond;
        private final int[] counts;

        public State(long baseSecond, int[] counts) {
            this.baseSecond = baseSecond;
            this.counts = counts;
        }

        public long baseSecond() {
            return baseSecond;
        }

        public int[] counts() {
            return counts;
        }
    }

    public SlidingWindowRateLimiter(int limit, int windowSeconds) {
        this.limit = limit;
        this.windowSeconds = windowSeconds;
    }

    /**
     * 尝试获取一个令牌。
     *
     * @param ref  持有当前窗口状态的原子引用（每个 key 一个）
     * @param nowMillis 当前时间戳
     * @return true 放行，false 超限
     */
    public boolean tryAcquire(AtomicReference<State> ref, long nowMillis) {
        long currentSecond = nowMillis / 1000;
        while (true) {
            State cur = ref.get();
            State next = advance(cur, currentSecond);

            int total = 0;
            for (int c : next.counts()) {
                total += c;
            }
            if (total >= limit) {
                // 超限：提交清理后的状态（把过期槽位清零），但不占用额度
                ref.compareAndSet(cur, next);
                return false;
            }

            // 占用一个额度：定位当前秒的槽位并 +1
            int slot = (int) Math.floorMod(currentSecond - next.baseSecond(), (long) windowSeconds);
            int[] newCounts = next.counts().clone();
            newCounts[slot]++;
            State updated = new State(next.baseSecond(), newCounts);

            if (ref.compareAndSet(cur, updated)) {
                return true;
            }
            // CAS 失败：有人抢先改了状态，重新读取重试
            Thread.onSpinWait();
        }
    }

    /**
     * 把旧状态推进到当前秒：清零已滑出窗口的槽位。
     */
    private State advance(State cur, long currentSecond) {
        if (cur == null) {
            return new State(currentSecond, new int[windowSeconds]);
        }
        long elapsed = currentSecond - cur.baseSecond();
        if (elapsed <= 0) {
            return cur;
        }
        if (elapsed >= windowSeconds) {
            // 整个窗口都已过期
            return new State(currentSecond, new int[windowSeconds]);
        }
        int[] counts = cur.counts().clone();
        for (long i = 0; i < elapsed; i++) {
            long sec = cur.baseSecond() + i;
            int slot = (int) Math.floorMod(sec - cur.baseSecond(), (long) windowSeconds);
            counts[slot] = 0;
        }
        return new State(currentSecond, counts);
    }
}
