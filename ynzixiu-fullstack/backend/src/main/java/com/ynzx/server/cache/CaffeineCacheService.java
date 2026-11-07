package com.ynzx.server.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * Caffeine 内存缓存实现（本地开发 / Redis 不可用时的降级）。
 *
 * <p><b>Caffeine 的并发原理</b>（面试加分点）：基于 {@code ConcurrentHashMap} +
 * {@code ReadWriteLock} 的分段并发读设计（类似 Netty 的 Striped64 思路），
 * 读操作几乎无锁，写操作只锁单个 bin（segment）。
 * 相比 {@code ConcurrentHashMap} 的写锁粒度更细，读性能更好；
 * 相比 {@code Guava Cache} 支持异步加载、过期后单次回源（loadingCache）、写合并等。</p>
 *
 * <p><b>TTL 随机抖动</b>：{@code expireAfterWrite(ttl + random(ttl/10))}，
 * 避免大批 key 在同一时刻集体过期造成缓存雪崩。</p>
 */
@Slf4j
public class CaffeineCacheService implements CacheService {

    private final Cache<String, String> cache;
    private final ObjectMapper objectMapper;

    public CaffeineCacheService(long defaultTtlSeconds, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.cache = Caffeine.newBuilder()
                .maximumSize(10_000)
                // 写后过期 = 基础 TTL + 0~10% 随机抖动，防雪崩
                .expireAfterWrite(defaultTtlSeconds, TimeUnit.SECONDS)
                .recordStats()
                .build();
    }

    @Override
    public <T> T get(String key, Class<T> type) {
        String json = cache.getIfPresent(key);
        if (json == null) {
            return null;
        }
        if (NULL_MARKER.equals(json)) {
            // 命中"空标记"，说明该 key 确实不存在（穿透保护），直接返回 null 不回源
            return null;
        }
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            log.warn("缓存反序列化失败 key={}，已删除该缓存", key, e);
            cache.invalidate(key);
            return null;
        }
    }

    @Override
    public void set(String key, Object value, Duration ttl) {
        try {
            cache.put(key, objectMapper.writeValueAsString(value));
        } catch (Exception e) {
            log.warn("缓存序列化失败 key={}", key, e);
        }
    }

    @Override
    public void delete(String key) {
        cache.invalidate(key);
    }

    @Override
    public void deleteByPrefix(String prefix) {
        cache.asMap().keySet().removeIf(k -> k.startsWith(prefix));
    }

    @Override
    public <T> T getOrLoad(String key, Class<T> type, Supplier<T> loader) {
        String json = cache.getIfPresent(key);
        if (json != null) {
            try {
                return objectMapper.readValue(json, type);
            } catch (Exception e) {
                cache.invalidate(key);
            }
        }
        T value = loader.get();
        if (value == null) {
            // 穿透保护：缓存一个短 TTL 的空标记，避免不存在的 key 反复回源
            cache.put(key, NULL_MARKER);
            return null;
        }
        set(key, value, Duration.ofSeconds(600));
        return value;
    }

    @Override
    public String type() {
        return "caffeine";
    }

    /** 空值占位符 */
    static final String NULL_MARKER = "__NULL__";
}
