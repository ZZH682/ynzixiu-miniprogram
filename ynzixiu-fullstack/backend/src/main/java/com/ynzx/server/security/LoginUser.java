package com.ynzx.server.security;

import lombok.Builder;
import lombok.Data;

/**
 * 登录主体。
 *
 * <p>由 JWT 解析得到，通过 {@link UserContext} 绑定到当前请求线程。</p>
 */
@Data
@Builder
public class LoginUser {

    private Integer userId;
    private String phone;
    private String nickname;
    /** user | admin */
    private String role;
    private Long balance;
}
