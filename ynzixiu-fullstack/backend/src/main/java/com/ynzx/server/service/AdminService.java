package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.entity.Business;
import com.ynzx.server.entity.Order;
import com.ynzx.server.entity.Receipt;
import com.ynzx.server.entity.Signup;
import com.ynzx.server.entity.User;
import com.ynzx.server.mapper.BusinessMapper;
import com.ynzx.server.mapper.CourseMapper;
import com.ynzx.server.mapper.GroupInfoMapper;
import com.ynzx.server.mapper.OrderMapper;
import com.ynzx.server.mapper.ReceiptMapper;
import com.ynzx.server.mapper.SignupMapper;
import com.ynzx.server.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理端服务。
 *
 * <p><b>本类修复了原 Node 版"仪表盘统计恒为 0"的缺陷</b>：</p>
 * <p>原版统计函数写成 {@code (await db.get(sql))[0]}，
 * 但 {@code db.get} 返回的是<b>单个对象</b>而不是数组，
 * {@code obj[0]} 恒为 {@code undefined} → 所有计数都是 0。
 * 只有营收和趋势因为走了另一条查询路径才正常。</p>
 *
 * <p>本版用 MyBatis-Plus 的 {@code selectCount} 直接返回 Long，
 * 语义明确、不可能再出现"取错下标"这类错误。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserMapper userMapper;
    private final OrderMapper orderMapper;
    private final SignupMapper signupMapper;
    private final CourseMapper courseMapper;
    private final GroupInfoMapper groupInfoMapper;
    private final BusinessMapper businessMapper;
    private final ReceiptMapper receiptMapper;
    private final Clock clock;

    /**
     * 仪表盘统计。
     */
    public Map<String, Object> stats() {
        LocalDateTime now = LocalDateTime.now(clock);
        LocalDateTime sevenDaysAgo = now.minusDays(7);

        Long users = userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getRole, "user"));
        Long orders = orderMapper.selectCount(null);
        Long paidOrders = orderMapper.selectCount(new LambdaQueryWrapper<Order>()
                .eq(Order::getStatus, "paid"));
        Long newSignups = signupMapper.selectCount(new LambdaQueryWrapper<Signup>()
                .eq(Signup::getStatus, "new"));
        Long openGroups = groupInfoMapper.selectCount(new LambdaQueryWrapper<com.ynzx.server.entity.GroupInfo>()
                .eq(com.ynzx.server.entity.GroupInfo::getStatus, "forming"));
        Long courses = courseMapper.selectCount(null);

        // 营收：已支付订单金额合计
        Long revenue = orderMapper.sumPaidAmount();

        Map<String, Object> result = new HashMap<>(10);
        result.put("users", users == null ? 0 : users);
        result.put("orders", orders == null ? 0 : orders);
        result.put("paidOrders", paidOrders == null ? 0 : paidOrders);
        result.put("newSignups", newSignups == null ? 0 : newSignups);
        result.put("openGroups", openGroups == null ? 0 : openGroups);
        result.put("courses", courses == null ? 0 : courses);
        result.put("revenue", revenue == null ? 0 : revenue);
        result.put("trend", trend(sevenDaysAgo, now));
        return result;
    }

    /**
     * 近 7 天订单趋势。
     *
     * <p><b>方言差异</b>：原 Node 版用
     * {@code DATE_SUB(CURDATE(), INTERVAL 7 DAY)}（MySQL）
     * vs {@code date('now','-7 day')}（SQLite）两套 SQL。
     * Java 版改为<b>在 Java 侧算出时间边界</b>，用标准 SQL 一次查完再在内存里分桶——
     * 这样 SQL 与数据库方言彻底解耦，H2/MySQL 共用同一份代码。</p>
     */
    private List<Map<String, Object>> trend(LocalDateTime from, LocalDateTime to) {
        List<Order> orders = orderMapper.selectList(new LambdaQueryWrapper<Order>()
                .ge(Order::getCreatedAt, from)
                .le(Order::getCreatedAt, to));

        // 7 天分桶，key = yyyy-MM-dd
        Map<String, long[]> buckets = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            buckets.put(from.plusDays(i).toLocalDate().toString(), new long[]{0, 0});
        }
        for (Order o : orders) {
            if (o.getCreatedAt() == null) {
                continue;
            }
            String key = o.getCreatedAt().toLocalDate().toString();
            long[] arr = buckets.get(key);
            if (arr == null) {
                continue;
            }
            arr[0]++;
            if ("paid".equals(o.getStatus())) {
                arr[1] += (o.getAmount() == null ? 0 : o.getAmount());
            }
        }
        List<Map<String, Object>> list = new ArrayList<>(buckets.size());
        for (Map.Entry<String, long[]> e : buckets.entrySet()) {
            Map<String, Object> item = new HashMap<>(4);
            item.put("date", e.getKey());
            item.put("orders", e.getValue()[0]);
            item.put("revenue", e.getValue()[1]);
            list.add(item);
        }
        list.sort((a, b) -> String.valueOf(a.get("date")).compareTo(String.valueOf(b.get("date"))));
        return list;
    }

    /**
     * 订单列表（管理端）。
     */
    public List<Order> listOrders(String status, int page, int size) {
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<Order>()
                .orderByDesc(Order::getId);
        if (status != null && !status.isBlank()) {
            wrapper.eq(Order::getStatus, status);
        }
        return orderMapper.selectList(wrapper);
    }

    /**
     * 预约跟进：修改留资状态。
     */
    public boolean updateSignupStatus(Integer id, String status) {
        Signup signup = signupMapper.selectById(id);
        if (signup == null) {
            return false;
        }
        signup.setStatus(status);
        return signupMapper.updateById(signup) > 0;
    }

    /**
     * 线索列表（管理端）。按来源 / 业务板块 / 状态筛选。
     */
    public List<Signup> listSignups(Integer bid, String source, String status) {
        LambdaQueryWrapper<Signup> w = new LambdaQueryWrapper<Signup>().orderByDesc(Signup::getCreatedAt);
        if (bid != null) {
            w.eq(Signup::getBid, bid);
        }
        if (source != null && !source.isBlank()) {
            w.eq(Signup::getSource, source);
        }
        if (status != null && !status.isBlank()) {
            w.eq(Signup::getStatus, status);
        }
        return signupMapper.selectList(w);
    }

    /**
     * 分板块营收统计：销售额、订单量、退费率。
     *
     * <p>标书"线上缴费与财务系统"要求"按业务板块查看销售额、订单量、退费率"。
     * 数据量小，直接在内存按 bid 分组（避免为报表写方言相关的 GROUP BY SQL）。</p>
     */
    public List<Map<String, Object>> statsByBusiness() {
        List<Order> orders = orderMapper.selectList(new LambdaQueryWrapper<Order>()
                .in(Order::getStatus, "paid", "part_paid", "refunded"));
        Map<Integer, Business> bizMap = businessMapper.selectList(null).stream()
                .collect(java.util.stream.Collectors.toMap(Business::getId, b -> b, (a, b) -> a));
        Map<Integer, long[]> agg = new HashMap<>();
        for (Order o : orders) {
            int bid = o.getBid() == null ? 0 : o.getBid();
            agg.computeIfAbsent(bid, k -> new long[3]); // [订单数, 销售额(分), 退款订单数]
            agg.get(bid)[0]++;
            if ("refunded".equals(o.getStatus())) {
                agg.get(bid)[2]++;
            } else {
                agg.get(bid)[1] += (o.getAmount() == null ? 0 : o.getAmount());
            }
        }
        List<Map<String, Object>> list = new ArrayList<>(agg.size());
        for (Map.Entry<Integer, long[]> e : agg.entrySet()) {
            Business b = bizMap.get(e.getKey());
            long[] v = e.getValue();
            double refundRate = v[0] == 0 ? 0 : Math.round(v[2] * 1000.0 / v[0]) / 10.0;
            Map<String, Object> m = new HashMap<>(6);
            m.put("bid", e.getKey());
            m.put("name", b == null ? "未知板块" : b.getName());
            m.put("orders", v[0]);
            m.put("revenue", v[1]);
            m.put("refunded", v[2]);
            m.put("refundRate", refundRate);
            list.add(m);
        }
        list.sort((a, b) -> Long.compare(((Number) b.get("revenue")).longValue(), ((Number) a.get("revenue")).longValue()));
        return list;
    }

    /**
     * 订单台账 CSV（UTF-8 BOM，Excel 直接打开不乱码）。
     */
    public String exportOrdersCsv() {
        List<Order> orders = orderMapper.selectList(new LambdaQueryWrapper<Order>().orderByDesc(Order::getId));
        StringBuilder sb = new StringBuilder();
        sb.append("\uFEFF订单号,用户ID,板块ID,课程ID,方案,金额(分),已付(分),状态,渠道,创建时间,支付时间\n");
        for (Order o : orders) {
            sb.append(csv(o.getOrderNo())).append(',')
              .append(o.getUserId() == null ? "" : o.getUserId()).append(',')
              .append(o.getBid() == null ? "" : o.getBid()).append(',')
              .append(o.getCourseId() == null ? "" : o.getCourseId()).append(',')
              .append(csv(o.getPlan())).append(',')
              .append(o.getAmount() == null ? 0 : o.getAmount()).append(',')
              .append(o.getPaid() == null ? 0 : o.getPaid()).append(',')
              .append(csv(o.getStatus())).append(',')
              .append(csv(o.getRemark())).append(',')
              .append(o.getCreatedAt()).append(',')
              .append(o.getPaidAt()).append('\n');
        }
        return sb.toString();
    }

    /**
     * 线索台账 CSV。
     */
    public String exportSignupsCsv(Integer bid, String source, String status) {
        List<Signup> signups = listSignups(bid, source, status);
        StringBuilder sb = new StringBuilder();
        sb.append("\uFEFFID,姓名,手机号,板块ID,课程ID,来源,状态,备注,提交时间\n");
        for (Signup s : signups) {
            sb.append(s.getId() == null ? "" : s.getId()).append(',')
              .append(csv(s.getName())).append(',')
              .append(csv(s.getPhone())).append(',')
              .append(s.getBid() == null ? "" : s.getBid()).append(',')
              .append(s.getCourseId() == null ? "" : s.getCourseId()).append(',')
              .append(csv(s.getSource())).append(',')
              .append(csv(s.getStatus())).append(',')
              .append(csv(s.getNote())).append(',')
              .append(s.getCreatedAt()).append('\n');
        }
        return sb.toString();
    }

    private String csv(String s) {
        if (s == null) {
            return "";
        }
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
