package com.ynzx.server;

import com.ynzx.server.entity.Order;
import com.ynzx.server.service.OrderService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** 支付金额计算的纯单元测试：不启动 Spring 容器，验证三种支付场景。 */
class OrderServiceUnitTest {

    private final OrderService service = Mockito.mock(OrderService.class, Mockito.CALLS_REAL_METHODS);

    private Order order(String plan, int amount, int paid) {
        Order o = new Order();
        o.setPlan(plan);
        o.setAmount(amount);
        o.setPaid(paid);
        return o;
    }

    @Test
    void fullPlanPaysWholeAmount() {
        assertEquals(98000, service.calculatePayAmount(order("full", 98000, 0)));
    }

    @Test
    void installmentFirstPaymentIsThirtyPercentRoundedUp() {
        // ceil(100001 * 0.3) = 30001，向上取整避免少收
        assertEquals(30001, service.calculatePayAmount(order("installment", 100001, 0)));
    }

    @Test
    void installmentFinalPaymentIsRemainder() {
        assertEquals(70000, service.calculatePayAmount(order("installment", 100000, 30000)));
    }

    @Test
    void nullAmountsAreSafe() {
        Order o = new Order();
        o.setPlan("full");
        assertEquals(0, service.calculatePayAmount(o));
    }
}
