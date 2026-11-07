package com.ynzx.server.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ynzx.server.cache.CacheService;
import com.ynzx.server.cache.CaffeineCacheService;
import com.ynzx.server.cache.RedisCacheService;
import com.ynzx.server.lock.DistributedLock;
import com.ynzx.server.lock.LocalDistributedLock;
import com.ynzx.server.lock.RedisDistributedLock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.concurrent.TimeUnit;

/**
 * 缓存与分布式锁的装配。
 *
 * <p><b>核心设计：能力探测 + 优雅降级。</b>
 * 配置 {@code app.cache.type=auto} 时，启动时探测 Redis 是否可用：
 * <ul>
 *   <li>可用 → 用 Redis（多实例共享缓存与锁）</li>
 *   <li>不可用 → 自动降级为 Caffeine 内存缓存 + 本地锁，并打 WARN 日志</li>
 * </ul>
 * 这样开发机上没装 Redis 也能跑通全流程，部署到生产又能无缝切到 Redis。
 * 生产环境建议显式配置 {@code app.cache.type=redis}，避免"探测失败被静默降级"变成事故。</p>
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class CacheConfig {

    private final AppProperties props;

    @Bean
    public CacheService cacheService(ObjectMapper objectMapper, StringRedisTemplate redisTemplate) {
        String type = props.getCache().getType();
        if ("caffeine".equalsIgnoreCase(type)) {
            log.info("缓存实现：Caffeine（进程内）");
            return new CaffeineCacheService(props.getCache().getDefaultTtlSeconds(), objectMapper);
        }
        if ("redis".equalsIgnoreCase(type)) {
            log.info("缓存实现：Redis");
            return new RedisCacheService(redisTemplate, objectMapper, props.getCache().getDefaultTtlSeconds());
        }
        // auto：探测 Redis
        if (redisAvailable(redisTemplate)) {
            log.info("缓存实现：Redis（自动探测可用）");
            return new RedisCacheService(redisTemplate, objectMapper, props.getCache().getDefaultTtlSeconds());
        }
        log.warn("⚠ Redis 不可用，缓存自动降级为 Caffeine（仅当前实例生效，多实例部署请显式配置 app.cache.type=redis）");
        return new CaffeineCacheService(props.getCache().getDefaultTtlSeconds(), objectMapper);
    }

    @Bean
    public DistributedLock distributedLock(StringRedisTemplate redisTemplate) {
        String type = props.getLock().getType();
        if ("local".equalsIgnoreCase(type)) {
            log.info("分布式锁实现：本地锁（单机）");
            return new LocalDistributedLock(props.getLock().getWaitMillis());
        }
        if ("redis".equalsIgnoreCase(type)) {
            log.info("分布式锁实现：Redis 分布式锁");
            return new RedisDistributedLock(redisTemplate, props.getLock().getLeaseSeconds(), props.getLock().getWaitMillis());
        }
        if (redisAvailable(redisTemplate)) {
            log.info("分布式锁实现：Redis（自动探测可用）");
            return new RedisDistributedLock(redisTemplate, props.getLock().getLeaseSeconds(), props.getLock().getWaitMillis());
        }
        log.warn("⚠ Redis 不可用，分布式锁自动降级为本地锁（多实例部署下无法互斥，请显式配置 app.lock.type=redis）");
        return new LocalDistributedLock(props.getLock().getWaitMillis());
    }

    /**
     * 探测 Redis 可用性。
     *
     * <p>用 1 秒超时，避免启动被网络问题拖死。生产上更稳妥的做法是
     * 配置固定的 Redis 地址并在健康检查里暴露状态，而不是启动时探测。</p>
     */
    private boolean redisAvailable(StringRedisTemplate redisTemplate) {
        try {
            redisTemplate.opsForValue().get("__ping__");
            return true;
        } catch (Exception e) {
            log.debug("Redis 探测失败: {}", e.getMessage());
            return false;
        }
    }
}
