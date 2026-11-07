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
 * 数据表 {@code payments} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("payments")
public class Payment implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** order_id */
    private Integer orderId;

    /** pay_no */
    private String payNo;

    /** channel */
    private String channel;

    /** amount */
    private Integer amount;

    /** status */
    private String status;

    /** transaction_id */
    private String transactionId;

    /** created_at */
    private LocalDateTime createdAt;

    /** paid_at */
    private LocalDateTime paidAt;

}
