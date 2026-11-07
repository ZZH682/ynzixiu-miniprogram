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
 * 数据表 {@code group_rules} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("group_rules")
public class GroupRule implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** course_id */
    private Integer courseId;

    /** size */
    private Integer size;

    /** price */
    private Integer price;

    /** hours */
    private Integer hours;

}
