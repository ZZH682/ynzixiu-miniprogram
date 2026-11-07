package com.ynzx.server.controller;

import com.ynzx.server.common.R;
import com.ynzx.server.security.AuthInterceptor;
import com.ynzx.server.security.UserContext;
import com.ynzx.server.service.PortalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 门户聚合接口：全站内容一次拉取 + 学员数据同步 + 营销/服务动作。
 *
 * <p>路径约定：{@code /content/**} 与 {@code /service/**} 在 WebMvcConfig 中已放行，
 * 无需登录；{@code /portal/**} 一律要求用户 token（显式 requireLogin 断言）。</p>
 */
@RestController
@RequiredArgsConstructor
public class PortalController {

    private final PortalService portalService;

    /** 全站展示内容（六大板块 / 课程 / 题库 / 资讯 / 师资 / 营销规则 …） */
    @GetMapping("/api/v1/content/catalog")
    public R<Map<String, Object>> catalog() {
        return R.ok(portalService.catalog());
    }

    /** 学校基础设置（校名、热线、备案号等） */
    @GetMapping("/api/v1/content/settings")
    public R<Map<String, String>> settings() {
        return R.ok(portalService.settings());
    }

    /** 登录后同步学员全链路数据 */
    @GetMapping("/api/v1/portal/me")
    public R<Map<String, Object>> me() {
        return R.ok(portalService.me(AuthInterceptor.requireLogin().getUserId()));
    }

    /** 标记章节学习进度 */
    @PostMapping("/api/v1/portal/study")
    public R<Map<String, Object>> study(@RequestBody Map<String, Object> body) {
        Integer uid = AuthInterceptor.requireLogin().getUserId();
        return R.ok(portalService.markStudy(uid, intVal(body.get("courseId")), intVal(body.get("chapterNo"))));
    }

    /** 领取优惠券 */
    @PostMapping("/api/v1/portal/coupons/{couponId}/claim")
    public R<Map<String, Object>> claimCoupon(@PathVariable Integer couponId) {
        return R.ok(portalService.claimCoupon(AuthInterceptor.requireLogin().getUserId(), couponId));
    }

    /** 申请佣金提现（金额为分） */
    @PostMapping("/api/v1/portal/withdraw")
    public R<Map<String, Object>> withdraw(@RequestBody Map<String, Object> body) {
        Integer uid = AuthInterceptor.requireLogin().getUserId();
        return R.ok(portalService.withdraw(uid, intVal(body.get("amount")), str(body.get("account"))));
    }

    /** 电子收据 */
    @GetMapping("/api/v1/portal/receipt/{orderNo}")
    public R<Map<String, Object>> receipt(@PathVariable String orderNo) {
        return R.ok(portalService.receipt(orderNo, AuthInterceptor.requireLogin().getUserId()));
    }

    /** 在线客服留言（未登录也可提交） */
    @PostMapping("/api/v1/service/message")
    public R<Integer> message(@RequestBody Map<String, Object> body) {
        return R.ok(portalService.postMessage(UserContext.userId(), str(body.get("phone")), str(body.get("content"))));
    }

    private static Integer intVal(Object v) {
        if (v == null) {
            return null;
        }
        if (v instanceof Number n) {
            return n.intValue();
        }
        try {
            return Integer.valueOf(String.valueOf(v).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String str(Object v) {
        return v == null ? "" : String.valueOf(v);
    }
}
