package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.Coupon;
import com.ynzx.server.entity.CouponClaim;
import com.ynzx.server.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 用户 / 优惠券 Mapper。
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * 邀请码查询（用于反查邀请人）。
     */
    @Select("SELECT * FROM users WHERE invite_code = #{code}")
    User selectByInviteCode(@Param("code") String code);

    /**
     * 佣金入账：余额累加。
     *
     * <p>用 {@code balance = balance + #{amount}} 而不是先查后写，
     * 避免"读-改-写"竞态导致佣金丢失。</p>
     */
    @Update("UPDATE users SET balance = balance + #{amount}, updated_at = CURRENT_TIMESTAMP WHERE id = #{id}")
    int addBalance(@Param("id") Integer id, @Param("amount") Integer amount);

    /**
     * 扣减余额（提现）。{@code WHERE balance >= amount} 保证不会出现负余额，
     * affected=0 表示余额不足。</p>
     */
    @Update("UPDATE users SET balance = balance - #{amount}, updated_at = CURRENT_TIMESTAMP "
            + "WHERE id = #{id} AND balance >= #{amount}")
    int deductBalance(@Param("id") Integer id, @Param("amount") Integer amount);
}
