package com.ynzx.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 密码编码器。
 *
 * <p><b>为什么用 BCrypt 而不是 MD5/SHA-256？</b></p>
 * <ul>
 *   <li>MD5/SHA 是<b>可逆摘要</b>（彩虹表可反查），加盐也只是防批量破解，单条仍可被爆破</li>
 *   <li>BCrypt 是<b>自适应哈希</b>：内置随机 salt，且代价因子（cost）可随硬件提升调高，
 *       存量密码不会因此失效（登录时读出 cost 再验证）</li>
 *   <li>Spring Security 的 {@code BCryptPasswordEncoder} 默认 cost=10，
 *       约 100ms/次，兼顾安全与登录体验</li>
 * </ul>
 */
@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
