package com.ynzx.server.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;
import java.util.Set;
import java.util.function.Supplier;

/**
 * Redis 缓存实现（生产环境）。
 *
 * <p><b>为什么用 {@link StringRedisTemplate} 而不是 {@code RedisTemplate&lt;Object,Object&gt;}？</b>
 * JDK 默认的 {@code RedisTemplate} 用 JdkSerializationRedisSerializer 序列化，
 * 产生的是二进制乱码，不可读、跨语言不友好、且 JDK 序列化有反序列化攻击风险。
 * 统一用 String + Jackson 手工序列化，缓存内容可读、可直接用 redis-cli 查看。</p>
 *
 * <p><b>TTL 抖动</b>：{@code ttl + random(ttl/10)}，防雪崩。</p>
 */
@Slf4j
public class RedisCacheService implements CacheService {

    private static final String NULL_MARKER = "__NULL__";
    private static final String KEY_PREFIX = "ynzixiu:";

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final long defaultTtlSeconds;

    public RedisCacheService(StringRedisTemplate redis, ObjectMapper objectMapper, long defaultTtlSeconds) {
        this.redis = redis;
        this.objectMapper = objectMapper;
        this.defaultTtlSeconds = defaultTtlSeconds;
    }

    @Override
    public <T> T get(String key, Class<T> type) {
        String json = redis.opsForValue().get(KEY_PREFIX + key);
        if (json == null) {
            return null;
        }
        if (NULL_MARKER.equals(json)) {
            return null;
        }
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            log.warn("缓存反序列化失败 key={}，已删除", key, e);
            redis.delete(KEY_PREFIX + key);
            return null;
        }
    }

    @Override
    public void set(String key, Object value, Duration ttl) {
        try {
            redis.opsForValue().set(KEY_PREFIX + key, objectMapper.writeValueAsString(value),
                    jitter(ttl.getSeconds()));
        } catch (Exception e) {
            log.warn("缓存写入失败 key={}", key, e);
        }
    }

    @Override
    public void delete(String key) {
        redis.delete(KEY_PREFIX + key);
    }

    @Override
    public void deleteByPrefix(String prefix) {
        Set<String> keys = redis.keys(KEY_PREFIX + prefix + "*");
        if (keys != null && !keys.isEmpty()) {
            redis.delete(keys);
        }
    }

    @Override
    public <T> T getOrLoad(String key, Class<T> type, Supplier<T> loader) {
        T cached = get(key, type);
        if (cached != null) {
            return cached;
        }
        T value = loader.get();
        if (value == null) {
            redis.opsForValue().set(KEY_PREFIX + key, NULL_MARKER, Duration.ofSeconds(60));
            return null;
        }
        set(key, value, Duration.ofSeconds(defaultTtlSeconds));
        return value;
    }

    @Override
    public String type() {
        return "redis";
    }

    /** TTL 加 0~10% 随机抖动，避免缓存雪崩 */
    private Duration jitter(long baseSeconds) {
        long jitter = (long) (baseSeconds * 0.1);
        long extra = jitter == 0 ? 0 : (long) (Math.random() * jitter);
        return Duration.ofSeconds(Math.max(1, baseSeconds + extra));
    }
}
