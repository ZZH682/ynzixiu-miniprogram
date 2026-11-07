package com.ynzx.server.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 数据表 {@code coupon_claims} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("coupon_claims")
public class CouponClaim implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** user_id */
    private Integer userId;

    /** coupon_id */
    private Integer couponId;

    /** status */
    private String status;

    /** order_id */
    private Integer orderId;

    /** claimed_at */
    private LocalDateTime claimedAt;

    /** used_at */
    private LocalDateTime usedAt;

}
