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
 * 数据表 {@code orders} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("orders")
public class Order implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** order_no */
    private String orderNo;

    /** user_id */
    private Integer userId;

    /** course_id */
    private Integer courseId;

    /** bid */
    private Integer bid;

    /** plan */
    private String plan;

    /** amount */
    private Integer amount;

    /** paid */
    private Integer paid;

    /** coupon_claim_id */
    private Integer couponClaimId;

    /** group_id */
    private Integer groupId;

    /** status */
    private String status;

    /** created_at */
    private LocalDateTime createdAt;

    /** paid_at */
    private LocalDateTime paidAt;

    /** final_paid_at */
    private LocalDateTime finalPaidAt;

    /** remark */
    private String remark;

    /** version */
    private Integer version;

    /** request_id */
    private String requestId;

}
