package com.ynzx.server.controller;

import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.common.R;
import com.ynzx.server.dto.CreateOrderRequest;
import com.ynzx.server.entity.Order;
import com.ynzx.server.lock.DistributedLock;
import com.ynzx.server.security.AuthInterceptor;
import com.ynzx.server.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 订单与支付接口。
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final DistributedLock distributedLock;

    /** 创建订单 */
    @PostMapping
    public R<Map<String, Object>> create(@Valid @RequestBody CreateOrderRequest request) {
        var user = AuthInterceptor.requireLogin();
        return R.ok(orderService.createOrder(user.getUserId(), request.getCourseId(),
                request.getPlan(), request.getCouponClaimId(), request.getGroupId(), request.getRequestId()));
    }

    /** 我的订单 */
    @GetMapping
    public R<List<Order>> list(@RequestParam(required = false) String status) {
        var user = AuthInterceptor.requireLogin();
        return R.ok(orderService.listMyOrders(user.getUserId(), status));
    }

    /** 订单详情 */
    @GetMapping("/{orderNo}")
    public R<Order> detail(@PathVariable String orderNo) {
        return R.ok(orderService.getByOrderNo(orderNo));
    }

    /**
     * 演示支付。
     *
     * <p>{@code payAmount} 为空时服务端按规则计算；
     * 传了则与服务端计算值比对，不一致直接拒绝——
     * 防止前端被篡改金额。</p>
     */
    @PostMapping("/{orderNo}/pay")
    public R<Map<String, Object>> pay(@PathVariable String orderNo,
                                      @RequestParam(required = false) Integer payAmount,
                                      @RequestParam(required = false) String channel) {
        var user = AuthInterceptor.requireLogin();
        Order order = orderService.getByOrderNo(orderNo);
        if (order == null || !order.getUserId().equals(user.getUserId())) {
            return R.fail(ErrorCode.ORDER_NOT_FOUND);
        }
        // 锁在事务之外：OrderService.pay 自带 @Transactional，
        // 若把锁加在事务内部，锁会在事务提交前释放，仍然可能被并发重复支付。
        try {
            return R.ok(distributedLock.executeWithLock("pay:" + orderNo,
                    () -> orderService.pay(orderNo, payAmount, channel)));
        } catch (IllegalStateException e) {
            return R.fail(ErrorCode.CONFLICT, "该订单正在支付中，请稍后重试");
        }
    }
}
