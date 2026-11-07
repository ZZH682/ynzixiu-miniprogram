package com.ynzx.server.lock;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;

import java.util.Collections;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Redis 分布式锁实现。
 *
 * <p><b>正确性三要素</b>（面试必背）：</p>
 * <ol>
 *   <li><b>加锁用 SET key value NX PX ttl</b>：一条命令完成"不存在才设置 + 设置过期时间"。
 *       拆成 SETNX 再 EXPIRE 两步，中间崩溃会留下永不释放的死锁。</li>
 *   <li><b>value 用唯一标识（UUID）</b>：释放锁时校验 value 是否是自己持有的。
 *       否则 A 的锁超时释放后，B 拿到锁，此时 A 执行完毕去释放，会误删 B 的锁。</li>
 *   <li><b>释放用 Lua 脚本保证原子</b>：判断 value + 删除必须是一个原子操作。
 *       用两条命令的话，判断通过后锁可能已过期并被他人获取，仍会误删。
 *       Lua 在 Redis 中是单线程执行的脚本，天然原子。</li>
 * </ol>
 *
 * <p><b>看门狗续期</b>：本实现用固定 TTL，适合临界区耗时可控的场景。
 * 若临界区可能超过 TTL，需要引入"续期线程"或 Redisson 的 watchdog 机制。</p>
 */
@Slf4j
public class RedisDistributedLock implements DistributedLock {

    private static final String KEY_PREFIX = "ynzixiu:lock:";
    private static final DefaultRedisScript<Long> UNLOCK_SCRIPT = new DefaultRedisScript<>(
            "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
            Long.class);

    private final StringRedisTemplate redis;
    private final java.time.Duration leaseDuration;
    private final long waitMillis;

    public RedisDistributedLock(StringRedisTemplate redis, long leaseSeconds, long waitMillis) {
        this.redis = redis;
        this.leaseDuration = java.time.Duration.ofSeconds(leaseSeconds);
        this.waitMillis = waitMillis;
    }

    @Override
    public LockHandle tryLock(String key) {
        String lockKey = KEY_PREFIX + key;
        // 唯一标识：用于释放时校验持有者
        String token = UUID.randomUUID().toString();
        long deadline = System.currentTimeMillis() + waitMillis;
        while (System.currentTimeMillis() < deadline) {
            // SET key token NX PX ttl —— 一条命令完成"不存在才设置 + 设置过期时间"
            Boolean ok = redis.opsForValue().setIfAbsent(lockKey, token, leaseDuration);
            if (Boolean.TRUE.equals(ok)) {
                return () -> unlock(lockKey, token);
            }
            try {
                Thread.sleep(30);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        return null;
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

    /** Lua 原子释放：值匹配才删 */
    private void unlock(String lockKey, String token) {
        try {
            redis.execute(UNLOCK_SCRIPT, Collections.singletonList(lockKey), token);
        } catch (Exception e) {
            log.warn("释放分布式锁失败 key={}", lockKey, e);
        }
    }
}
