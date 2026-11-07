package com.ynzx.server.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 创建订单请求。
 */
@Data
public class CreateOrderRequest {

    @NotNull(message = "课程ID不能为空")
    private Integer courseId;

    /** full（一次付清）| installment（分期） */
    private String plan = "full";

    private Integer couponClaimId;

    private Integer groupId;

    /**
     * 幂等键：客户端生成，同一业务请求重复提交时传相同的值。
     * 服务端靠 {@code idx_orders_request_id} 唯一索引保证只创建一笔订单。
     */
    private String requestId;

    @Min(value = 1, message = "分页大小至少 1")
    @Max(value = 100, message = "分页大小最大 100")
    private Integer pageSize = 20;
}
