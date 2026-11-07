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
 * 数据表 {@code withdraws} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("withdraws")
public class Withdraw implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** user_id */
    private Integer userId;

    /** amount */
    private Integer amount;

    /** status */
    private String status;

    /** account */
    private String account;

    /** created_at */
    private LocalDateTime createdAt;

    /** handled_at */
    private LocalDateTime handledAt;

}
