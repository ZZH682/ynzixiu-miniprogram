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
 * 数据表 {@code banners} 的实体。
 * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>
 */
@Data
@TableName("banners")
public class Banner implements Serializable {

    /** id */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /** kicker */
    private String kicker;

    /** title */
    private String title;

    /** action */
    private String action;

    /** to_url */
    private String toUrl;

    /** theme */
    private String theme;

    /** is_tab */
    private Integer isTab;

    /** sort */
    private Integer sort;

    /** status */
    private Integer status;

}
