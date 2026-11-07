package com.ynzx.server.config;

import com.ynzx.server.ratelimit.RateLimitInterceptor;
import com.ynzx.server.security.AuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置：跨域 + 拦截器注册 + 限流器。
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;
    private final AppProperties props;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 限流在鉴权之前执行（@Order(1)），刷接口的请求在校验 token 前就被挡掉
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns(props.getApiPrefix() + "/**");
        registry.addInterceptor(authInterceptor)
                .addPathPatterns(props.getApiPrefix() + "/**")
                .excludePathPatterns(
                        props.getApiPrefix() + "/auth/**",
                        props.getApiPrefix() + "/health",
                        props.getApiPrefix() + "/school/**",
                        props.getApiPrefix() + "/content/**",
                        props.getApiPrefix() + "/courses",
                        props.getApiPrefix() + "/misc/**",
                        props.getApiPrefix() + "/service/**",
                        props.getApiPrefix() + "/signups"
                );
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping(props.getApiPrefix() + "/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
