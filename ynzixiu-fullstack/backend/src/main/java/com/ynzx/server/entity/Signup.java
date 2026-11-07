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
 * 数据表 {@code signups} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("signups")
public class Signup implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** user_id */
    private Integer userId;

    /** name */
    private String name;

    /** phone */
    private String phone;

    /** bid */
    private Integer bid;

    /** course_id */
    private Integer courseId;

    /** source */
    private String source;

    /** note */
    private String note;

    /** status */
    private String status;

    /** created_at */
    private LocalDateTime createdAt;

}
