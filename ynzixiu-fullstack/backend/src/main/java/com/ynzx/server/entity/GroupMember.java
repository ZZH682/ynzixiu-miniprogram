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
 * 数据表 {@code group_members} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("group_members")
public class GroupMember implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** group_id */
    private Integer groupId;

    /** user_id */
    private Integer userId;

    /** order_id */
    private Integer orderId;

    /** created_at */
    private LocalDateTime createdAt;

}
