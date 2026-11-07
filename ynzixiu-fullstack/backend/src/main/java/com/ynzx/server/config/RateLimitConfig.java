package com.ynzx.server.config;

import com.ynzx.server.ratelimit.LocalRateLimiter;
import com.ynzx.server.ratelimit.RateLimiter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 限流器 Bean 单独定义，避免与 {@link WebMvcConfig} 形成循环依赖：
 * WebMvcConfig → RateLimitInterceptor → RateLimiter → WebMvcConfig。
 */
@Configuration
@RequiredArgsConstructor
public class RateLimitConfig {

    private final AppProperties props;

    @Bean
    public RateLimiter rateLimiter() {
        return new LocalRateLimiter(props.getRateLimit().getRequestsPerMinute(), 60);
    }
}
