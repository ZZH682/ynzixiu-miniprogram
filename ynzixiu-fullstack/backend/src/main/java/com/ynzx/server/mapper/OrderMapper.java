package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/**
 * 订单 Mapper。
 */
@Mapper
public interface OrderMapper extends BaseMapper<Order> {

    /**
     * 幂等查询：同一 requestId 已存在订单则直接返回。
     *
     * <p>配合 {@code idx_orders_request_id} 唯一索引使用：
     * 先查是快速路径，真正防重的是数据库唯一约束（并发下两个请求
     * 可能都查不到，随后插入时一个成功一个抛 DuplicateKeyException）。</p>
     */
    @Select("SELECT * FROM orders WHERE user_id = #{userId} AND request_id = #{requestId}")
    Order selectByRequestId(@Param("userId") Integer userId, @Param("requestId") String requestId);

    /**
     * 支付成功：把订单从 unpaid 推进到 paid。
     *
     * <p><b>状态机用 WHERE 条件保证</b>：只有 status='unpaid' 才能改成 paid。
     * 支付回调可能被重复通知（微信会重试），带上原状态做条件，
     * 第二次回调 affected=0，业务层据此判断"重复通知"而不重复发货。</p>
     */
    @Update("UPDATE orders SET status = 'paid', paid = amount, paid_at = #{paidAt} "
            + "WHERE order_no = #{orderNo} AND status = 'unpaid'")
    int markPaid(@Param("orderNo") String orderNo, @Param("paidAt") java.time.LocalDateTime paidAt);

    /**
     * 分期首付：状态 unpaid → part_paid。
     */
    @Update("UPDATE orders SET status = 'part_paid', paid = #{payAmount}, paid_at = #{paidAt} "
            + "WHERE order_no = #{orderNo} AND status = 'unpaid'")
    int markPartPaid(@Param("orderNo") String orderNo,
                     @Param("payAmount") Integer payAmount,
                     @Param("paidAt") java.time.LocalDateTime paidAt);

    /**
     * 尾款支付：part_paid → paid。
     */
    @Update("UPDATE orders SET status = 'paid', paid = amount, final_paid_at = #{paidAt} "
            + "WHERE order_no = #{orderNo} AND status = 'part_paid'")
    int markFinalPaid(@Param("orderNo") String orderNo,
                      @Param("paidAt") java.time.LocalDateTime paidAt);

    /**
     * 已报名课程集合（用于"章节权限"判定）。
     */
    @Select("SELECT DISTINCT course_id FROM orders WHERE user_id = #{userId} AND status IN ('paid','part_paid')")
    java.util.List<Integer> selectPaidCourseIds(@Param("userId") Integer userId);

    /**
     * 营收合计：已支付订单的金额总和（单位分）。
     *
     * <p>注意统计口径只算 {@code status='paid'}（全额支付），
     * 分期未付尾款的订单不算收入，避免虚增。</p>
     */
    @Select("SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'paid'")
    Long sumPaidAmount();
}
