package com.ynzx.server.cache;

import java.time.Duration;
import java.util.function.Supplier;

/**
 * 缓存抽象。
 *
 * <p><b>为什么要抽象？</b>
 * 开发环境本机没有 Redis，如果代码里直接依赖 {@code RedisTemplate}，
 * 开发时就得装 Redis。抽象成接口后：
 * <ul>
 *   <li>本地用 Caffeine（进程内，零依赖，行为与 Redis 一致）</li>
 *   <li>生产用 Redis（多实例共享）</li>
 *   <li>业务代码只依赖接口，切换靠配置不靠改代码</li>
 * </ul>
 *
 * <p><b>缓存三大经典问题</b>（面试高频），本接口对应处理方式：</p>
 * <ul>
 *   <li><b>穿透</b>（查不存在的 key，每次都打到 DB）：{@link #getOrLoad} 对 null 结果也缓存一个"空标记"</li>
 *   <li><b>击穿</b>（热点 key 过期瞬间大量请求打到 DB）：加互斥锁，只放一个线程回源</li>
 *   <li><b>雪崩</b>（大量 key 同时过期）：TTL 加随机抖动，见各实现</li>
 * </ul>
 */
public interface CacheService {

    /**
     * 读取缓存。
     *
     * @return 缓存值；不存在返回 null
     */
    <T> T get(String key, Class<T> type);

    /**
     * 写缓存。
     */
    void set(String key, Object value, Duration ttl);

    /**
     * 删除缓存。
     */
    void delete(String key);

    /**
     * 按前缀批量删除。
     */
    void deleteByPrefix(String prefix);

    /**
     * 缓存穿透保护：查不到时回源并缓存空标记。
     *
     * @param loader     回源函数，返回 null 表示数据不存在
     * @param emptyValue 不存在时的占位对象（反序列化回 null 用）
     */
    <T> T getOrLoad(String key, Class<T> type, Supplier<T> loader);

    /**
     * 当前使用的实现类型：redis / caffeine
     */
    String type();
}
