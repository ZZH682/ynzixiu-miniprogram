package com.ynzx.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * 验证码登录请求。
 *
 * <p><b>关键点：{@code inviteCode} 在这里被显式声明。</b>
 * 原 Node 版的参数校验函数只拷贝"schema 里声明过的字段"，
 * 没声明的字段会被静默丢弃，导致邀请码传了也建不起邀请关系。
 * Java 版用 DTO + Bean Validation，字段在编译期就固定，不存在"漏传"的可能。</p>
 */
@Data
public class LoginRequest {

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "验证码不能为空")
    private String code;

    /** 邀请码，可选 */
    private String inviteCode;
}
