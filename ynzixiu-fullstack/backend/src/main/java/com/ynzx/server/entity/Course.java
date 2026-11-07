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
 * 数据表 {@code courses} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("courses")
public class Course implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** bid */
    private Integer bid;

    /** title */
    private String title;

    /** short */
    @TableField("short")
    private String _short;

    /** type */
    private String type;

    /** price */
    private Integer price;

    /** orig_price */
    private Integer origPrice;

    /** teacher */
    private String teacher;

    /** teacher_note */
    private String teacherNote;

    /** sales */
    private Integer sales;

    /** intro */
    private String intro;

    /** highlights */
    private String highlights;

    /** status */
    private Integer status;

    /** stock */
    private Integer stock;

}
