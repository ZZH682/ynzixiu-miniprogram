package com.ynzx.server.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 应用自定义配置，对应 application.yml 中 {@code app.*}。
 */
@Data
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String apiPrefix = "/api/v1";
    private Jwt jwt = new Jwt();
    private Sms sms = new Sms();
    private RateLimit rateLimit = new RateLimit();
    private Cache cache = new Cache();
    private Lock lock = new Lock();
    private DataSource datasource = new DataSource();

    @Data
    public static class Jwt {
        private String userSecret;
        private String adminSecret;
        private long expireMinutes = 720;
        private long adminExpireMinutes = 480;
        private String issuer = "ynzixiu-server-java";
    }

    @Data
    public static class Sms {
        /** 演示验证码；生产应置空并接真实短信通道 */
        private String devCode = "123456";
        private long ttlMinutes = 5;
        private int sendLimitPerMinute = 10;
    }

    @Data
    public static class RateLimit {
        private boolean enabled = true;
        private int requestsPerMinute = 300;
    }

    @Data
    public static class Cache {
        /** redis | caffeine | auto */
        private String type = "auto";
        private long defaultTtlSeconds = 600;
        private long nullTtlSeconds = 60;
    }

    @Data
    public static class Lock {
        /** redis | local | auto */
        private String type = "auto";
        private long leaseSeconds = 10;
        private long waitMillis = 2000;
    }

    @Data
    public static class DataSource {
        /** mysql | h2 */
        private String type = "h2";
    }
}
