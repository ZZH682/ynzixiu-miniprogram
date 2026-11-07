package com.ynzx.server;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 端到端冒烟：真实启动 Spring Boot（RANDOM_PORT + H2 dev），
 * 覆盖「静态站点 → 内容 → 登录 → 留资 → 刷题 → 下单支付 → 电子收据 → 管理端导出」全链路。
 *
 * <p>按顺序执行，后面用例依赖前面用例产生的 token / 订单号。</p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SmokeIntegrationTest {

    @Autowired
    private TestRestTemplate rest;

    private static String userToken;
    private static String adminToken;
    private static String orderNo;

    private static HttpHeaders json() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    private static HttpHeaders json(String token) {
        HttpHeaders h = json();
        if (token != null) {
            h.setBearerAuth(token);
        }
        return h;
    }

    private static void assertOk(ResponseEntity<Map> resp) {
        assertEquals(HttpStatus.OK, resp.getStatusCode(), "HTTP 应为 200");
        assertNotNull(resp.getBody(), "响应体不应为空");
        assertEquals(0, ((Number) resp.getBody().get("code")).intValue(),
                "业务码应为 0，实际响应：" + resp.getBody());
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> data(ResponseEntity<Map> resp) {
        assertOk(resp);
        return (Map<String, Object>) resp.getBody().get("data");
    }

    @Test
    @Order(1)
    void healthAndStaticSiteAreServedFromSamePort() {
        ResponseEntity<Map> health = rest.getForEntity("/api/v1/health", Map.class);
        Map<String, Object> h = data(health);
        assertEquals("ok", h.get("status"));

        ResponseEntity<String> page = rest.getForEntity("/", String.class);
        assertEquals(HttpStatus.OK, page.getStatusCode());
        assertTrue(page.getBody() != null && page.getBody().contains("云南自修学校"),
                "根路径应返回前端 index.html（前后端同源单端口）");
    }

    @Test
    @Order(2)
    void catalogContainsAllSeedData() {
        Map<String, Object> c = data(rest.getForEntity("/api/v1/content/catalog", Map.class));
        assertTrue(((List<?>) c.get("businesses")).size() >= 6, "六大业务板块");
        assertTrue(((List<?>) c.get("courses")).size() >= 3, "课程");
        assertTrue(((List<?>) c.get("subjects")).size() >= 12, "12 个科目");
        assertTrue(((List<?>) c.get("questions")).size() >= 30, "题库覆盖 12 个科目");
        assertTrue(((List<?>) c.get("banners")).size() >= 3, "轮播图种子");
        assertTrue(((List<?>) c.get("chapters")).size() >= 7, "课程章节");
        // catalog 里的 settings 是 [{k,v}] 行数组；/content/settings 才是 {k:v} 键值映射
        assertTrue(((List<?>) c.get("settings")).size() >= 6, "站点基础配置应有 6 项");

        ResponseEntity<Map> settingResp = rest.getForEntity("/api/v1/content/settings", Map.class);
        Map<String, Object> settings = data(settingResp);
        assertEquals("云南自修学校", settings.get("site_name"), "站点名称应来自 settings 种子数据");
    }

    @Test
    @Order(3)
    void smsLoginAndPortalMe() {
        String phone = "13800138000";
        Map<String, Object> sms = data(rest.postForEntity("/api/v1/auth/sms",
                new HttpEntity<>("{\"phone\":\"" + phone + "\"}", json()), Map.class));
        String code = String.valueOf(sms.get("devCode"));

        Map<String, Object> login = data(rest.postForEntity("/api/v1/auth/login",
                new HttpEntity<>("{\"phone\":\"" + phone + "\",\"code\":\"" + code + "\"}", json()), Map.class));
        userToken = String.valueOf(login.get("token"));
        assertNotNull(userToken);
        assertFalse(userToken.isBlank());

        // 未登录访问个人数据应返回业务码 1002（HTTP 仍为 200，协议约定）
        ResponseEntity<Map> anonymous = rest.getForEntity("/api/v1/portal/me", Map.class);
        assertNotNull(anonymous.getBody());
        assertTrue(((Number) anonymous.getBody().get("code")).intValue() != 0, "未登录应被拒绝");

        Map<String, Object> me = data(rest.exchange("/api/v1/portal/me", HttpMethod.GET,
                new HttpEntity<>(json(userToken)), Map.class));
        assertNotNull(me.get("orders"));
        assertNotNull(me.get("errorBook"));
        assertNotNull(me.get("studyProgress"));
        assertFalse(((Map<?, ?>) me.get("user")).containsKey("passwordHash"), "不得下发密码哈希");
    }

    @Test
    @Order(4)
    void signupLeadIsPersisted() {
        ResponseEntity<Map> resp = rest.postForEntity("/api/v1/signups",
                new HttpEntity<>("{\"name\":\"冒烟测试\",\"phone\":\"13800138000\",\"bid\":1,\"note\":\"集成测试\",\"source\":\"h5\"}", json()),
                Map.class);
        assertOk(resp);
        assertTrue(((Number) resp.getBody().get("data")).intValue() > 0, "留资应返回自增 ID");
    }

    @Test
    @Order(5)
    @SuppressWarnings("unchecked")
    void quizQuestionsAndAnswerJudging() {
        // /quiz/questions 的 data 是数组，不是对象
        ResponseEntity<Map> resp = rest.getForEntity("/api/v1/quiz/questions?sid=1&page=1&size=5", Map.class);
        assertOk(resp);
        List<Map<String, Object>> list = (List<Map<String, Object>>) resp.getBody().get("data");
        assertFalse(list == null || list.isEmpty(), "科目 1 应有题目");
        Object qid = list.get(0).get("id");
        assertNotNull(qid, "题目 id 不应为空");

        Map<String, Object> judged = data(rest.postForEntity("/api/v1/quiz/submit",
                new HttpEntity<>("{\"questionId\":" + qid + ",\"chosen\":\"A\"}", json(userToken)), Map.class));
        assertTrue(judged.containsKey("correct"), "应返回判卷结果");
    }

    @Test
    @Order(6)
    void createOrderPayAndReceipt() {
        Map<String, Object> order = data(rest.postForEntity("/api/v1/orders",
                new HttpEntity<>("{\"courseId\":1,\"plan\":\"full\",\"requestId\":\"SMOKE-ORDER-1\"}", json(userToken)),
                Map.class));
        orderNo = String.valueOf(order.get("orderNo"));
        assertNotNull(orderNo);

        Map<String, Object> pay = data(rest.exchange("/api/v1/orders/" + orderNo + "/pay", HttpMethod.POST,
                new HttpEntity<>("", json(userToken)), Map.class));
        assertEquals("paid", pay.get("status"));
        assertNotNull(pay.get("receiptNo"), "支付成功应自动生成电子收据");

        Map<String, Object> detail = data(rest.exchange("/api/v1/orders/" + orderNo, HttpMethod.GET,
                new HttpEntity<>(json(userToken)), Map.class));
        assertTrue(((Number) detail.get("paid")).intValue() > 0, "订单实付金额应大于 0");
    }

    @Test
    @Order(7)
    @SuppressWarnings("unchecked")
    void stockAndSalesAreUpdatedAfterOrder() {
        // 种子数据课程 1 初始 sales=328，下单后 deductStock 同时 +1
        ResponseEntity<Map> resp = rest.exchange("/api/v1/courses", HttpMethod.GET,
                new HttpEntity<>(json()), Map.class);
        assertOk(resp);
        List<Map<String, Object>> courses = (List<Map<String, Object>>) resp.getBody().get("data");
        assertTrue(courses != null && !courses.isEmpty());
        assertTrue(((Number) courses.get(0).get("sales")).intValue() >= 329,
                "下单应通过 deductStock 累加销量（防超卖闭环）");
    }

    @Test
    @Order(8)
    void serviceMessageIsPublic() {
        ResponseEntity<Map> resp = rest.postForEntity("/api/v1/service/message",
                new HttpEntity<>("{\"phone\":\"13800138000\",\"content\":\"想咨询成考报名\"}", json()), Map.class);
        assertOk(resp);
        assertTrue(((Number) resp.getBody().get("data")).intValue() > 0, "客服留言应落库");
    }

    @Test
    @Order(10)
    void unknownStaticPathReturnsReal404() {
        // Spring Boot 3.2 下缺失的静态资源抛 NoResourceFoundException，
        // 必须归一为 HTTP 404 + 1004，不能被兜底异常处理器误报成 200 + 5000。
        ResponseEntity<Map> resp = rest.getForEntity("/legacy/app.html", Map.class);
        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode(),
                "归档的旧版前端不应被托管，且应返回真正的 404");
        assertNotNull(resp.getBody());
        assertEquals(1004, ((Number) resp.getBody().get("code")).intValue(),
                "业务码应为 1004（资源不存在），实际响应：" + resp.getBody());

        ResponseEntity<Map> randomPath = rest.getForEntity("/this/path/does/not/exist", Map.class);
        assertEquals(HttpStatus.NOT_FOUND, randomPath.getStatusCode());
    }

    @Test
    @Order(9)
    void adminLoginStatsAndCsvExport() {
        Map<String, Object> login = data(rest.postForEntity("/api/v1/auth/admin/login",
                new HttpEntity<>("{\"phone\":\"13900000000\",\"password\":\"123456\"}", json()), Map.class));
        adminToken = String.valueOf(login.get("token"));
        assertFalse(adminToken.isBlank());

        Map<String, Object> stats = data(rest.exchange("/api/v1/admin/stats", HttpMethod.GET,
                new HttpEntity<>(json(adminToken)), Map.class));
        assertNotNull(stats);

        ResponseEntity<String> csv = rest.exchange("/api/v1/admin/orders/export", HttpMethod.GET,
                new HttpEntity<>(json(adminToken)), String.class);
        assertEquals(HttpStatus.OK, csv.getStatusCode());
        assertTrue(csv.getBody() != null && csv.getBody().contains("订单号"),
                "CSV 台账应包含表头，实际内容：" + csv.getBody());
    }
}
