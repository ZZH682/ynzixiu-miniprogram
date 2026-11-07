package com.ynzx.server.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 电子收据。支付成功后由 {@code OrderService} 自动生成，学员端可下载。
 */
@Data
@TableName("receipts")
public class Receipt implements Serializable {

    @TableId(type = IdType.AUTO)
    private Integer id;

    /** 收据编号，如 RCP2026110400001 */
    private String receiptNo;

    /** 关联订单号 */
    private String orderNo;

    private Integer userId;

    private Integer courseId;

    /** 业务板块 id（用于分板块统计） */
    private Integer bid;

    /** 实付金额（分） */
    private Integer amount;

    /** 支付渠道 */
    private String channel;

    /** 支付流水号 */
    private String payNo;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;
}
