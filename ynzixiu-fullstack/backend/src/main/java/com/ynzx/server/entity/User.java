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
 * 数据表 {@code users} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("users")
public class User implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** phone */
    private String phone;

    /** nickname */
    private String nickname;

    /** avatar */
    private String avatar;

    /** role */
    private String role;

    /** inviter_id */
    private Integer inviterId;

    /** invite_code */
    private String inviteCode;

    /** password_hash */
    private String passwordHash;

    /** balance */
    private Integer balance;

    /** created_at */
    private LocalDateTime createdAt;

    /** updated_at */
    private LocalDateTime updatedAt;

}
