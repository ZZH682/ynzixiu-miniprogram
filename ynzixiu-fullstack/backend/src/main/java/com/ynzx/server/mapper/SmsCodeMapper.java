package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.SmsCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

/**
 * 验证码 Mapper。
 */
@Mapper
public interface SmsCodeMapper extends BaseMapper<SmsCode> {

    /**
     * 标记验证码已使用。
     *
     * <p>{@code WHERE used = 0} 是并发保护：同一验证码被并发提交时，
     * 只有一条 UPDATE 能受影响，另一条 affected=0 直接判失败，
     * 避免"一个验证码同时登录两个账号"。</p>
     */
    @Update("UPDATE sms_codes SET used = 1 WHERE id = #{id} AND used = 0")
    int markUsed(@Param("id") Integer id);
}
