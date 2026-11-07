package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.Coupon;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

/**
 * 优惠券 Mapper。
 */
@Mapper
public interface CouponMapper extends BaseMapper<Coupon> {

    /**
     * 领券扣库存。
     *
     * <p>{@code WHERE claimed < stock} 保证不会超发，
     * affected=0 表示券已领完或不存在。</p>
     */
    @Update("UPDATE coupons SET claimed = claimed + 1 WHERE id = #{id} AND status = 1 AND claimed < stock")
    int claimCoupon(@Param("id") Integer id);
}
