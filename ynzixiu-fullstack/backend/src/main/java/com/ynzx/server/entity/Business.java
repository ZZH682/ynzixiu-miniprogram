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
 * 数据表 {@code businesses} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("businesses")
public class Business implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** code */
    private String code;

    /** name */
    private String name;

    /** char */
    @TableField("char")
    private String _char;

    /** color */
    private String color;

    /** tint */
    private String tint;

    /** summary */
    private String summary;

    /** tags */
    private String tags;

    /** audience */
    private String audience;

    /** intro */
    private String intro;

    /** offers */
    private String offers;

    /** sort */
    private Integer sort;

}
