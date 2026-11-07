package com.ynzx.server.controller;

import com.ynzx.server.common.R;
import com.ynzx.server.dto.LoginRequest;
import com.ynzx.server.dto.SendSmsRequest;
import com.ynzx.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 认证接口。
 *
 * <p>接口设计遵循"薄 Controller"原则：Controller 只做三件事
 * —— 参数校验、调用 Service、包装响应。
 * 业务逻辑一律在 Service，事务边界也在 Service 方法上声明。</p>
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** 发送验证码 */
    @PostMapping("/sms")
    public R<Map<String, Object>> sendSms(@Valid @RequestBody SendSmsRequest request) {
        return R.ok(authService.sendSmsCode(request.getPhone()));
    }

    /** 验证码登录（登录即注册） */
    @PostMapping("/login")
    public R<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        return R.ok(authService.loginBySms(request.getPhone(), request.getCode(), request.getInviteCode()));
    }

    /** 密码登录（管理端） */
    @PostMapping("/admin/login")
    public R<Map<String, Object>> adminLogin(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String password = body.get("password");
        return R.ok(authService.loginByPassword(phone, password));
    }
}
