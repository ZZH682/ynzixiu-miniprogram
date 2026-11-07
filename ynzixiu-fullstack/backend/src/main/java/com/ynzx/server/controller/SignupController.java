package com.ynzx.server.controller;

import com.ynzx.server.common.R;
import com.ynzx.server.entity.Signup;
import com.ynzx.server.security.UserContext;
import com.ynzx.server.service.SignupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 预约/留资表单（公开提交）。
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SignupController {

    private final SignupService signupService;

    /**
     * 提交预约/留资。对应标书验收标准 3（咨询留资）与 6（表单提交后台可查）。
     * 该路径已在 {@code WebMvcConfig} 中放行，无需登录。
     */
    @PostMapping("/signups")
    public R<Integer> submit(@RequestBody Signup signup) {
        Integer id = signupService.submit(signup, UserContext.userId());
        return R.ok(id);
    }

    /** 我提交的预约（登录可选） */
    @GetMapping("/signups/mine")
    public R<List<Signup>> mine() {
        return R.ok(signupService.mySignups(UserContext.userId()));
    }
}
