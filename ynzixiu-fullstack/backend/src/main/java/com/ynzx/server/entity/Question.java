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
 * 数据表 {@code questions} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("questions")
public class Question implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** sid */
    private Integer sid;

    /** stem */
    private String stem;

    /** opts */
    private String opts;

    /** answer */
    private String answer;

    /** analysis */
    private String analysis;

}
