package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.entity.Signup;
import com.ynzx.server.mapper.SignupMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 招生获客：预约/留资表单。
 *
 * <p>对应标书"招生获客工具集"：多类型预约表单（学历规划、试听、公考咨询等）、
 * 线索统一管理。提交接口公开（无需登录），管理端可查看/筛选/导出/跟进。</p>
 */
@Service
@RequiredArgsConstructor
public class SignupService {

    private final SignupMapper signupMapper;

    /**
     * 提交预约/留资。登录用户自动关联 userId，游客也可匿名提交。
     */
    public Integer submit(Signup signup, Integer userId) {
        if (signup.getName() == null || signup.getName().isBlank()) {
            signup.setName("匿名访客");
        }
        if (signup.getPhone() == null || !signup.getPhone().matches("^1\\d{10}$")) {
            throw new com.ynzx.server.common.BizException(com.ynzx.server.common.ErrorCode.PARAM_ERROR, "请填写正确的手机号");
        }
        signup.setUserId(userId);
        signup.setSource(signup.getSource() == null ? "h5" : signup.getSource());
        signup.setStatus("new");
        signup.setCreatedAt(LocalDateTime.now());
        signupMapper.insert(signup);
        return signup.getId();
    }

    /** 我提交的预约 */
    public List<Signup> mySignups(Integer userId) {
        if (userId == null) {
            return List.of();
        }
        return signupMapper.selectList(new LambdaQueryWrapper<Signup>()
                .eq(Signup::getUserId, userId).orderByDesc(Signup::getCreatedAt));
    }
}
