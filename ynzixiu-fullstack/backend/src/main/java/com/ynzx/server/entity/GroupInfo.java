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
 * 数据表 {@code groups} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("groups")
public class GroupInfo implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** group_no */
    private String groupNo;

    /** course_id */
    private Integer courseId;

    /** leader_id */
    private Integer leaderId;

    /** size */
    private Integer size;

    /** price */
    private Integer price;

    /** joined */
    private Integer joined;

    /** status */
    private String status;

    /** expires_at */
    private LocalDateTime expiresAt;

    /** created_at */
    private LocalDateTime createdAt;

    /** version */
    private Integer version;

}
