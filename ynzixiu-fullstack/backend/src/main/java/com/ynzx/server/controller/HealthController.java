package com.ynzx.server.controller;

import com.ynzx.server.common.R;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查。
 *
 * <p>供 Docker/K8s 探活使用，返回服务时间与时区——顺便验证时区配置是否正确。</p>
 */
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private final Clock clock;

    public HealthController(Clock clock) {
        this.clock = clock;
    }

    @GetMapping("/health")
    public R<Map<String, Object>> health() {
        Map<String, Object> data = new HashMap<>(4);
        data.put("status", "ok");
        data.put("serverTime", LocalDateTime.now(clock));
        data.put("timezone", clock.getZone().getId());
        data.put("app", "ynzixiu-server-java");
        return R.ok(data);
    }
}
