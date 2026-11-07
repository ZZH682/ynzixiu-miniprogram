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
 * 数据表 {@code campus} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("campus")
public class Campus implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** name */
    private String name;

    /** addr */
    private String addr;

    /** phone */
    private String phone;

    /** areas */
    private String areas;

    /** lat */
    private BigDecimal lat;

    /** lng */
    private BigDecimal lng;

    /** sort */
    private Integer sort;

}
