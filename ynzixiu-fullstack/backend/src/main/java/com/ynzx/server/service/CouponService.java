package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.common.BizException;
import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.entity.Coupon;
import com.ynzx.server.entity.CouponClaim;
import com.ynzx.server.mapper.CouponClaimMapper;
import com.ynzx.server.mapper.CouponMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 优惠券服务。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponMapper couponMapper;
    private final CouponClaimMapper couponClaimMapper;
    private final Clock clock;

    /**
     * 领券。
     *
     * <p><b>防超发</b>：{@code UPDATE coupons SET claimed = claimed + 1 WHERE claimed < stock}，
     * affected=0 表示领完。配合唯一索引（用户+券）防重复领取。</p>
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> claim(Integer userId, Integer couponId) {
        LocalDateTime now = LocalDateTime.now(clock);

        Coupon coupon = couponMapper.selectById(couponId);
        if (coupon == null || coupon.getStatus() == null || coupon.getStatus() != 1) {
            throw new BizException(ErrorCode.COUPON_NOT_FOUND);
        }
        // 重复领取拦截
        Long exist = couponClaimMapper.selectCount(new LambdaQueryWrapper<CouponClaim>()
                .eq(CouponClaim::getUserId, userId)
                .eq(CouponClaim::getCouponId, couponId));
        if (exist != null && exist > 0) {
            throw new BizException(ErrorCode.COUPON_ALREADY_CLAIMED);
        }

        int affected = couponMapper.claimCoupon(couponId);
        if (affected == 0) {
            throw new BizException(ErrorCode.COUPON_SOLD_OUT);
        }

        CouponClaim claim = new CouponClaim();
        claim.setUserId(userId);
        claim.setCouponId(couponId);
        claim.setStatus("unused");
        claim.setClaimedAt(now);
        couponClaimMapper.insert(claim);

        Map<String, Object> result = new HashMap<>(4);
        result.put("claimId", claim.getId());
        result.put("couponId", couponId);
        result.put("amount", coupon.getAmount());
        result.put("minSpend", coupon.getMinSpend());
        return result;
    }

    /**
     * 我的券。
     */
    public List<CouponClaim> myCoupons(Integer userId) {
        return couponClaimMapper.selectList(new LambdaQueryWrapper<CouponClaim>()
                .eq(CouponClaim::getUserId, userId)
                .orderByDesc(CouponClaim::getId));
    }

    /**
     * 可用券列表。
     */
    public List<Coupon> listUsable(Integer bid) {
        LambdaQueryWrapper<Coupon> wrapper = new LambdaQueryWrapper<Coupon>()
                .eq(Coupon::getStatus, 1)
                .orderByAsc(Coupon::getId);
        if (bid != null) {
            wrapper.eq(Coupon::getBid, bid);
        }
        return couponMapper.selectList(wrapper);
    }
}
