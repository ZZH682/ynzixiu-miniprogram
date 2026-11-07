package com.ynzx.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * 全局时钟。
 *
 * <p>把"当前时间"变成可注入的依赖，是可测试性设计的关键一环：
 * 验证码过期、拼团过期、订单超时这些逻辑全部依赖时间，
 * 有了固定 Clock，单元测试就不需要 sleep 也能精确验证边界。</p>
 */
@Configuration
public class TimeConfig {

    /**
     * 统一使用 Asia/Shanghai。
     *
     * <p>原 Node 版把本地时间字符串写入数据库，却用 UTC 字符串比较过期时间，
     * 导致验证码"5 分钟有效期"实际变成 485 分钟。Java 版用 Instant + ZoneId
     * 统一时区，从根上消除这类时区歧义。</p>
     */
    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("Asia/Shanghai"));
    }
}
