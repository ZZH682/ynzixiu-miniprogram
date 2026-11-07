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
 * 数据表 {@code error_book} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("error_book")
public class ErrorBook implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** user_id */
    private Integer userId;

    /** question_id */
    private Integer questionId;

    /** wrong_count */
    private Integer wrongCount;

    /** last_chosen */
    private String lastChosen;

    /** created_at */
    private LocalDateTime createdAt;

    /** updated_at */
    private LocalDateTime updatedAt;

}
