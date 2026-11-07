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
 * 数据表 {@code coupons} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("coupons")
public class Coupon implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** bid */
    private Integer bid;

    /** name */
    private String name;

    /** amount */
    private Integer amount;

    /** min_spend */
    private Integer minSpend;

    /** days */
    private Integer days;

    /** stock */
    private Integer stock;

    /** claimed */
    private Integer claimed;

    /** status */
    private Integer status;

}
