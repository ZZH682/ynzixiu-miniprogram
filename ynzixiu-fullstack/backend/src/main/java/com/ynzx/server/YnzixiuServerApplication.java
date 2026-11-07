package com.ynzx.server;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 五站合一 Java 版后端启动类。
 *
 * <p>对应 JD：Java / Spring / SpringCloud / MySQL / Redis / Dubbo / Netty / MongoDB。
 * 本工程聚焦"一条完整业务链路打透"，覆盖 JD 明确要求的：
 * JVM、并发编程、多线程、IO、网络、面向对象与设计模式。</p>
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableTransactionManagement
@EnableAsync
@EnableScheduling
@MapperScan("com.ynzx.server.mapper")
public class YnzixiuServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(YnzixiuServerApplication.class, args);
    }
}
