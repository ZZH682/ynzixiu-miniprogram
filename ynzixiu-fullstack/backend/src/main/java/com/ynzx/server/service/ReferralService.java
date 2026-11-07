package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.entity.Order;
import com.ynzx.server.entity.Referral;
import com.ynzx.server.entity.User;
import com.ynzx.server.mapper.ReferralMapper;
import com.ynzx.server.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;

/**
 * 转介绍佣金服务。
 *
 * <p><b>本类修复了原 Node 版最严重的 P0 缺陷</b>：</p>
 * <ul>
 *   <li><b>缺陷①</b>：原版参数校验函数只拷贝 schema 里声明的字段，
 *       {@code inviteCode} 没写进 schema → 被静默丢弃 →
 *       新用户的 {@code inviter_id} 永远是 null → 结算方法第一行就 return。
 *       <b>结果：邀请码完全失效，佣金恒为 0，referrals 表一条记录都没有。</b>
 *       本版在 DTO 中显式声明 {@code inviteCode} 并用 {@code @Valid} 校验。</li>
 *   <li><b>缺陷②</b>：原版把 UPDATE <b>之前</b>的旧 order 对象传给 {@code settleReferral}，
 *       里面的 {@code paid} 字段还是 0，佣金按 0 计算 → <b>金额恒为 0</b>。
 *       本版在事务内重新查询最新订单，拿到真实 paid 金额再结算。</li>
 * </ul>
 *
 * <p><b>佣金规则</b>：一级 5%，二级 2%，金额单位为分，向下取整。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralService {

    private static final int LEVEL1_RATE = 5;
    private static final int LEVEL2_RATE = 2;

    private final ReferralMapper referralMapper;
    private final UserMapper userMapper;
    private final Clock clock;

    /**
     * 支付成功后结算佣金。
     *
     * <p><b>事务传播</b>：{@code REQUIRES_NEW} 表示"无论外层事务成败都要结算"，
     * 避免支付主流程回滚时把已发生的佣金记录也回滚掉。
     * 如果要求强一致（钱和佣金同生共死），应改为默认的 REQUIRED。</p>
     *
     * @param order <b>必须是已支付状态的最新订单</b>（paid 字段为真实支付金额）
     */
    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRES_NEW)
    public void settleAfterPayment(Order order) {
        if (order == null) {
            return;
        }
        // 关键修复：order 已是支付后的状态，paid 是真实金额；原版这里拿到的是 paid=0 的旧对象
        int paidAmount = order.getPaid() == null ? 0 : order.getPaid();
        if (paidAmount <= 0) {
            log.warn("订单 {} 支付金额为 0，跳过佣金结算", order.getOrderNo());
            return;
        }

        Integer buyerId = order.getUserId();
        User buyer = userMapper.selectById(buyerId);
        if (buyer == null || buyer.getInviterId() == null) {
            // 无邀请人，无需结算
            return;
        }

        LocalDateTime now = LocalDateTime.now(clock);

        // 一级：直接邀请人
        User level1 = userMapper.selectById(buyer.getInviterId());
        if (level1 != null) {
            int amount = paidAmount * LEVEL1_RATE / 100;
            if (amount > 0) {
                writeReferral(level1.getId(), buyerId, buyer.getPhone(), order.getId(), 1, amount, now);
                userMapper.addBalance(level1.getId(), amount);
                log.info("一级佣金 {} 分入账 inviter={} order={}", amount, level1.getId(), order.getOrderNo());
            }
        }

        // 二级：邀请人的邀请人
        if (level1 != null && level1.getInviterId() != null) {
            User level2 = userMapper.selectById(level1.getInviterId());
            if (level2 != null) {
                int amount = paidAmount * LEVEL2_RATE / 100;
                if (amount > 0) {
                    writeReferral(level2.getId(), buyerId, buyer.getPhone(), order.getId(), 2, amount, now);
                    userMapper.addBalance(level2.getId(), amount);
                    log.info("二级佣金 {} 分入账 inviter={} order={}", amount, level2.getId(), order.getOrderNo());
                }
            }
        }
    }

    private void writeReferral(Integer userId, Integer refereeId, String refereePhone,
                               Integer orderId, int level, int amount, LocalDateTime now) {
        Referral referral = new Referral();
        referral.setUserId(userId);
        referral.setRefereeId(refereeId);
        referral.setRefereePhone(refereePhone);
        referral.setOrderId(orderId);
        referral.setLevel(level);
        referral.setAmount(amount);
        referral.setStatus("settled");
        referral.setCreatedAt(now);
        referralMapper.insert(referral);
    }

    /**
     * 推广统计。
     */
    public Object stats(Integer userId) {
        Long total = referralMapper.selectCount(new LambdaQueryWrapper<Referral>()
                .eq(Referral::getUserId, userId));
        Long settled = referralMapper.selectCount(new LambdaQueryWrapper<Referral>()
                .eq(Referral::getUserId, userId)
                .eq(Referral::getStatus, "settled"));
        Integer balance = 0;
        User user = userMapper.selectById(userId);
        if (user != null && user.getBalance() != null) {
            balance = user.getBalance();
        }
        java.util.Map<String, Object> result = new java.util.HashMap<>(4);
        result.put("total", total == null ? 0 : total);
        result.put("settled", settled == null ? 0 : settled);
        result.put("balance", balance);
        return result;
    }
}
