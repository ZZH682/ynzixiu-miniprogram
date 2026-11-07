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
 * 数据表 {@code materials} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("materials")
public class Material implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** bid */
    private Integer bid;

    /** name */
    private String name;

    /** cat */
    private String cat;

    /** format */
    private String format;

    /** size */
    private String size;

    /** member */
    private Integer member;

    /** file_url */
    private String fileUrl;

    /** downloads */
    private Integer downloads;

    /** sort */
    private Integer sort;

}
