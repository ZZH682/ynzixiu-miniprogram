package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.common.BizException;
import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.entity.Course;
import com.ynzx.server.entity.Order;
import com.ynzx.server.entity.Payment;
import com.ynzx.server.entity.Receipt;
import com.ynzx.server.entity.User;
import com.ynzx.server.mapper.CourseMapper;
import com.ynzx.server.mapper.CouponClaimMapper;
import com.ynzx.server.mapper.CouponMapper;
import com.ynzx.server.mapper.GroupInfoMapper;
import com.ynzx.server.mapper.OrderMapper;
import com.ynzx.server.mapper.PaymentMapper;
import com.ynzx.server.mapper.ReceiptMapper;
import com.ynzx.server.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 订单与支付服务。
 *
 * <p><b>本类修复了原 Node 版的 3 个资金正确性缺陷</b>：</p>
 * <ol>
 *   <li><b>分期首付 30% 失效</b>：原版 {@code payAmount = (plan==='installment' && paid>0) ? amount-paid : amount}，
 *       首付时 paid=0 走了全额分支，前端展示 30% 实际扣了 100%。
 *       本版把"本次应付金额"的计算独立成方法，首付明确为 {@code ceil(amount*0.3)}。</li>
 *   <li><b>佣金金额算成 0</b>：原版把 UPDATE 之前的旧 order 对象传给结算方法，
 *       里面的 {@code paid} 还是 0，佣金按 0 算。
 *       本版在事务内重新查询最新订单状态，或直接传参明确金额。</li>
 *   <li><b>支付回调重复发货</b>：本版用 {@code WHERE status='unpaid'} 条件更新，
 *       重复回调 affected=0，不会二次发货。</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    /** 分期首付比例 30% */
    private static final int INSTALLMENT_FIRST_RATIO = 30;

    private final OrderMapper orderMapper;
    private final CourseMapper courseMapper;
    private final PaymentMapper paymentMapper;
    private final UserMapper userMapper;
    private final GroupInfoMapper groupInfoMapper;
    private final CouponClaimMapper couponClaimMapper;
    private final CouponMapper couponMapper;
    private final ReferralService referralService;
    private final ReceiptMapper receiptMapper;
    private final Clock clock;

    /**
     * 创建订单。
     *
     * <p><b>幂等</b>：传入 requestId 时，重复提交直接返回已有订单。
     * 真正防重靠数据库唯一索引 + DuplicateKeyException 兜底，
     * 因为"先查后插"在并发下有竞态窗口。</p>
     *
     * @param plan     full（一次付清）| installment（分期）
     * @param groupId  拼团 ID，可选
     * @param requestId 幂等键，可选
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> createOrder(Integer userId, Integer courseId, String plan,
                                           Integer couponClaimId, Integer groupId, String requestId) {
        LocalDateTime now = LocalDateTime.now(clock);

        // 幂等快速路径
        if (requestId != null && !requestId.isBlank()) {
            Order exist = orderMapper.selectByRequestId(userId, requestId);
            if (exist != null) {
                log.info("命中幂等订单 orderNo={}", exist.getOrderNo());
                return buildOrderResult(exist);
            }
        }

        Course course = courseMapper.selectById(courseId);
        if (course == null || course.getStatus() == null || course.getStatus() != 1) {
            throw new BizException(ErrorCode.NOT_FOUND, "课程不存在或已下架");
        }
        // 重复报名拦截
        Long paidCount = orderMapper.selectCount(new LambdaQueryWrapper<Order>()
                .eq(Order::getUserId, userId)
                .eq(Order::getCourseId, courseId)
                .in(Order::getStatus, "paid", "part_paid"));
        if (paidCount != null && paidCount > 0) {
            throw new BizException(ErrorCode.COURSE_ALREADY_PURCHASED);
        }
        // 已有待支付订单直接复用，避免重复下单反复占用库存
        Order pending = orderMapper.selectOne(new LambdaQueryWrapper<Order>()
                .eq(Order::getUserId, userId)
                .eq(Order::getCourseId, courseId)
                .eq(Order::getStatus, "unpaid")
                .last("LIMIT 1"));
        if (pending != null) {
            log.info("复用待支付订单 orderNo={}", pending.getOrderNo());
            return buildOrderResult(pending);
        }

        int amount = course.getPrice() == null ? 0 : course.getPrice();
        if (groupId != null) {
            // 拼团价覆盖原价
            Integer groupPrice = resolveGroupPrice(groupId, courseId);
            amount = groupPrice;
        }
        if (couponClaimId != null) {
            amount = amount - resolveCouponDiscount(couponClaimId, userId, amount);
        }
        if (amount < 0) {
            amount = 0;
        }

        Order order = new Order();
        order.setOrderNo(generateOrderNo(now));
        order.setUserId(userId);
        order.setCourseId(courseId);
        order.setBid(course.getBid());
        order.setPlan("installment".equals(plan) ? "installment" : "full");
        order.setAmount(amount);
        order.setPaid(0);
        order.setCouponClaimId(couponClaimId);
        order.setGroupId(groupId);
        order.setStatus("unpaid");
        order.setCreatedAt(now);
        order.setVersion(0);
        order.setRequestId(requestId);

        try {
            orderMapper.insert(order);
        } catch (org.springframework.dao.DuplicateKeyException e) {
            // 唯一索引拦截了并发重复提交
            Order exist = orderMapper.selectByRequestId(userId, requestId);
            if (exist != null) {
                return buildOrderResult(exist);
            }
            throw e;
        }
        // 下单即在事务内原子扣减库存并累加销量：
        // UPDATE ... WHERE stock >= 1 是条件更新，数据库行锁保证不会超卖；
        // 订单插入或后续步骤失败时随事务一起回滚，不会留下幽灵库存。
        if (courseMapper.deductStock(courseId, 1) == 0) {
            throw new BizException(ErrorCode.STOCK_NOT_ENOUGH);
        }
        log.info("订单创建 orderNo={} userId={} amount={} plan={} 库存已扣减", order.getOrderNo(), userId, amount, order.getPlan());
        return buildOrderResult(order);
    }

    /**
     * 计算本次应付金额。
     *
     * <p><b>这里修复了分期首付 30% 失效的缺陷。</b>
     * 规则清晰无歧义：</p>
     * <ul>
     *   <li>一次付清：应付 = amount</li>
     *   <li>分期首付：应付 = ceil(amount * 30%)，向上取整避免少收分</li>
     *   <li>分期尾款：应付 = amount - 已付</li>
     * </ul>
     *
     * @param order 订单
     * @return 本次应付金额（单位分）
     */
    public int calculatePayAmount(Order order) {
        int amount = order.getAmount() == null ? 0 : order.getAmount();
        int paid = order.getPaid() == null ? 0 : order.getPaid();
        if (!"installment".equals(order.getPlan())) {
            return amount;
        }
        if (paid <= 0) {
            // 首付：向上取整
            return (int) Math.ceil(amount * INSTALLMENT_FIRST_RATIO / 100.0);
        }
        // 尾款
        return Math.max(0, amount - paid);
    }

    /**
     * 演示支付。
     *
     * @param payAmount 本次支付金额；不传则按 {@link #calculatePayAmount} 计算
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> pay(String orderNo, Integer payAmount, String channel) {
        LocalDateTime now = LocalDateTime.now(clock);
        Order order = orderMapper.selectOne(new LambdaQueryWrapper<Order>()
                .eq(Order::getOrderNo, orderNo));
        if (order == null) {
            throw new BizException(ErrorCode.ORDER_NOT_FOUND);
        }
        if (!"unpaid".equals(order.getStatus()) && !"part_paid".equals(order.getStatus())) {
            throw new BizException(ErrorCode.ORDER_STATUS_CONFLICT, "订单状态为 " + order.getStatus() + "，不可支付");
        }

        int expect = calculatePayAmount(order);
        int actual = payAmount == null ? expect : payAmount;
        if (actual != expect) {
            throw new BizException(ErrorCode.PAY_AMOUNT_MISMATCH,
                    "应付 " + expect + " 分，实际支付 " + actual + " 分");
        }

        // 支付流水
        Payment payment = new Payment();
        payment.setOrderId(order.getId());
        payment.setPayNo(generatePayNo(now));
        payment.setChannel(channel == null ? "demo" : channel);
        payment.setAmount(actual);
        payment.setStatus("success");
        payment.setTransactionId("TX" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        payment.setCreatedAt(now);
        payment.setPaidAt(now);
        paymentMapper.insert(payment);

        // 状态机推进：用条件更新保证幂等
        int affected;
        if ("part_paid".equals(order.getStatus())) {
            affected = orderMapper.markFinalPaid(order.getOrderNo(), now);
        } else if ("installment".equals(order.getPlan())) {
            affected = orderMapper.markPartPaid(order.getOrderNo(), actual, now);
        } else {
            affected = orderMapper.markPaid(order.getOrderNo(), now);
        }
        if (affected == 0) {
            throw new BizException(ErrorCode.ORDER_STATUS_CONFLICT, "订单状态已变更，支付失败");
        }

        // 关键修复：重新查库拿到"已支付"的最新订单再结算佣金
        // 原版传的是 UPDATE 前的旧对象，paid 仍是 0，佣金算成了 0
        Order paidOrder = orderMapper.selectOne(new LambdaQueryWrapper<Order>()
                .eq(Order::getOrderNo, order.getOrderNo()));
        referralService.settleAfterPayment(paidOrder);

        // 支付成功 -> 自动生成电子收据（标书"电子收据：缴费成功后自动生成"）
        Receipt receipt = new Receipt();
        receipt.setReceiptNo(generateReceiptNo(now));
        receipt.setOrderNo(paidOrder.getOrderNo());
        receipt.setUserId(paidOrder.getUserId());
        receipt.setCourseId(paidOrder.getCourseId());
        receipt.setBid(paidOrder.getBid());
        receipt.setAmount(actual);
        receipt.setChannel(payment.getChannel());
        receipt.setPayNo(payment.getPayNo());
        receipt.setPaidAt(now);
        receipt.setCreatedAt(now);
        receiptMapper.insert(receipt);

        Map<String, Object> result = new HashMap<>(6);
        result.put("orderNo", order.getOrderNo());
        result.put("payNo", payment.getPayNo());
        result.put("amount", actual);
        result.put("status", paidOrder.getStatus());
        result.put("paid", paidOrder.getPaid());
        result.put("channel", payment.getChannel());
        result.put("receiptNo", receipt.getReceiptNo());
        return result;
    }

    /**
     * 查询我的订单。
     */
    public List<Order> listMyOrders(Integer userId, String status) {
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<Order>()
                .eq(Order::getUserId, userId)
                .orderByDesc(Order::getId);
        if (status != null && !status.isBlank()) {
            wrapper.eq(Order::getStatus, status);
        }
        return orderMapper.selectList(wrapper);
    }

    public Order getByOrderNo(String orderNo) {
        return orderMapper.selectOne(new LambdaQueryWrapper<Order>().eq(Order::getOrderNo, orderNo));
    }

    private int resolveGroupPrice(Integer groupId, Integer courseId) {
        // 简化：拼团价格取团内 price 字段
        com.ynzx.server.entity.GroupInfo group = groupInfoMapperSafe(groupId);
        if (group == null) {
            throw new BizException(ErrorCode.GROUP_NOT_EXISTS);
        }
        if (!group.getCourseId().equals(courseId)) {
            throw new BizException(ErrorCode.GROUP_SIZE_MISMATCH);
        }
        return group.getPrice() == null ? 0 : group.getPrice();
    }

    private int resolveCouponDiscount(Integer couponClaimId, Integer userId, int amount) {
        com.ynzx.server.entity.CouponClaim claim = couponClaimSafe(couponClaimId);
        if (claim == null || !claim.getUserId().equals(userId)) {
            throw new BizException(ErrorCode.COUPON_NOT_FOUND);
        }
        if (!"unused".equals(claim.getStatus())) {
            throw new BizException(ErrorCode.CONFLICT, "该券已使用");
        }
        com.ynzx.server.entity.Coupon coupon = couponSafe(claim.getCouponId());
        if (coupon == null) {
            throw new BizException(ErrorCode.COUPON_NOT_FOUND);
        }
        if (coupon.getMinSpend() != null && amount < coupon.getMinSpend()) {
            throw new BizException(ErrorCode.COUPON_THRESHOLD_NOT_MET);
        }
        return coupon.getAmount() == null ? 0 : coupon.getAmount();
    }

    private com.ynzx.server.entity.GroupInfo groupInfoMapperSafe(Integer id) {
        return groupInfoMapper.selectById(id);
    }

    private com.ynzx.server.entity.CouponClaim couponClaimSafe(Integer id) {
        return couponClaimMapper.selectById(id);
    }

    private com.ynzx.server.entity.Coupon couponSafe(Integer id) {
        return couponMapper.selectById(id);
    }

    private Map<String, Object> buildOrderResult(Order order) {
        Map<String, Object> result = new HashMap<>(8);
        result.put("orderId", order.getId());
        result.put("orderNo", order.getOrderNo());
        result.put("userId", order.getUserId());
        result.put("courseId", order.getCourseId());
        result.put("plan", order.getPlan());
        result.put("amount", order.getAmount());
        result.put("paid", order.getPaid());
        result.put("status", order.getStatus());
        result.put("payAmount", calculatePayAmount(order));
        return result;
    }

    /** 订单号：时间戳 + 随机串，保证唯一且可读 */
    private String generateOrderNo(LocalDateTime now) {
        return "O" + now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private String generatePayNo(LocalDateTime now) {
        return "P" + now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    /** 收据号：RCP + 日期 + 随机串 */
    private String generateReceiptNo(LocalDateTime now) {
        return "RCP" + now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"))
                + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }
}
