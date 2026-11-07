package com.ynzx.server.controller;

import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.common.R;
import com.ynzx.server.security.JwtUtil;
import com.ynzx.server.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
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
 * 管理端接口。
 *
 * <p><b>整模块受管理员鉴权保护</b>：用管理端专用密钥域签发的 token 才能访问。
 * 这里手动解析而非用拦截器，是为了让"用户 token 访问管理端"返回明确的 403 而不是 401。</p>
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final JwtUtil jwtUtil;

    /** 仪表盘统计 */
    @GetMapping("/stats")
    public R<Map<String, Object>> stats(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return R.fail(ErrorCode.FORBIDDEN);
        }
        return R.ok(adminService.stats());
    }

    /** 订单管理 */
    @GetMapping("/orders")
    public R<List<com.ynzx.server.entity.Order>> orders(HttpServletRequest request,
                                                          @RequestParam(required = false) String status,
                                                          @RequestParam(defaultValue = "1") int page,
                                                          @RequestParam(defaultValue = "20") int size) {
        if (!isAdmin(request)) {
            return R.fail(ErrorCode.FORBIDDEN);
        }
        return R.ok(adminService.listOrders(status, page, size));
    }

    /** 预约跟进 */
    @PostMapping("/signups/{id}/status")
    public R<Boolean> updateSignup(HttpServletRequest request,
                                    @PathVariable Integer id,
                                    @RequestBody Map<String, String> body) {
        if (!isAdmin(request)) {
            return R.fail(ErrorCode.FORBIDDEN);
        }
        return R.ok(adminService.updateSignupStatus(id, body.get("status")));
    }

    /** 线索列表（按来源/业务/状态筛选） */
    @GetMapping("/signups")
    public R<?> signups(HttpServletRequest request,
                        @RequestParam(required = false) Integer bid,
                        @RequestParam(required = false) String source,
                        @RequestParam(required = false) String status) {
        if (!isAdmin(request)) {
            return R.fail(ErrorCode.FORBIDDEN);
        }
        return R.ok(adminService.listSignups(bid, source, status));
    }

    /** 线索导出 CSV */
    @GetMapping("/signups/export")
    public void exportSignups(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response,
                              @RequestParam(required = false) Integer bid,
                              @RequestParam(required = false) String source,
                              @RequestParam(required = false) String status) throws java.io.IOException {
        if (!isAdmin(request)) {
            response.sendError(403, "无权限");
            return;
        }
        writeCsv(response, "signups.csv", adminService.exportSignupsCsv(bid, source, status));
    }

    /** 订单台账导出 CSV */
    @GetMapping("/orders/export")
    public void exportOrders(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        if (!isAdmin(request)) {
            response.sendError(403, "无权限");
            return;
        }
        writeCsv(response, "orders.csv", adminService.exportOrdersCsv());
    }

    /** 分板块营收统计 */
    @GetMapping("/stats/business")
    public R<?> statsByBusiness(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return R.fail(ErrorCode.FORBIDDEN);
        }
        return R.ok(adminService.statsByBusiness());
    }

    /** 写入 CSV 响应 */
    private void writeCsv(jakarta.servlet.http.HttpServletResponse response, String filename, String csv) throws java.io.IOException {
        response.setContentType("text/csv;charset=utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        try (java.io.OutputStream os = response.getOutputStream()) {
            os.write(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    /**
     * 管理员校验：必须用管理端密钥域签发的 token。
     */
    private boolean isAdmin(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return false;
        }
        var loginUser = jwtUtil.parseAdminToken(header.substring(7).trim());
        return loginUser != null && "admin".equals(loginUser.getRole());
    }
}
