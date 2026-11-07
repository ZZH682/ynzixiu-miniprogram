package com.ynzx.server.common;

import lombok.Getter;

/**
 * 业务错误码。
 *
 * <p>设计要点：把"失败原因"从异常 message 里抽出来变成稳定契约，
 * 前端只需 code 分支处理，msg 给人看。这样改文案不会破坏前端。</p>
 */
@Getter
public enum ErrorCode {

    SUCCESS(0, "成功"),
    PARAM_ERROR(1001, "参数不合法"),
    UNAUTHORIZED(1002, "未登录或登录已过期"),
    FORBIDDEN(1003, "无权限访问"),
    NOT_FOUND(1004, "资源不存在"),
    CONFLICT(1005, "状态冲突，请勿重复操作"),
    TOO_MANY_REQUESTS(1006, "请求过于频繁，请稍后再试"),
    SERVER_ERROR(5000, "服务器内部错误"),

    // ===== 业务域错误码（1xxx / 2xxx 段位划分）=====
    SMS_CODE_INVALID(1101, "验证码错误或已过期"),
    SMS_CODE_EXPIRED(1102, "验证码已过期"),
    SMS_SEND_TOO_FREQUENT(1103, "验证码发送过于频繁"),
    LOGIN_FAILED(1104, "手机号或密码错误"),
    DUPLICATE_REGISTER(1105, "该手机号已注册"),

    COURSE_NOT_PURCHASED(1201, "请先报名课程"),
    COURSE_ALREADY_PURCHASED(1202, "您已报名该课程"),
    CHAPTER_LOCKED(1203, "该章节需报名后解锁"),

    STOCK_NOT_ENOUGH(1301, "名额已满，请稍后再试"),
    GROUP_NOT_EXISTS(1302, "拼团不存在"),
    GROUP_EXPIRED(1303, "拼团已结束"),
    GROUP_ALREADY_JOINED(1304, "您已参与该团"),
    GROUP_SIZE_MISMATCH(1305, "所选课程与该团不匹配"),

    COUPON_NOT_FOUND(1401, "优惠券不存在"),
    COUPON_SOLD_OUT(1402, "优惠券已被领完"),
    COUPON_ALREADY_CLAIMED(1403, "您已领取过该券"),
    COUPON_THRESHOLD_NOT_MET(1404, "未达到该券的使用门槛"),

    ORDER_NOT_FOUND(1501, "订单不存在"),
    ORDER_STATUS_CONFLICT(1502, "订单状态不允许该操作"),
    PAY_FAILED(1503, "支付失败"),
    PAY_AMOUNT_MISMATCH(1504, "支付金额与订单不一致"),

    BALANCE_INSUFFICIENT(1601, "余额不足"),
    WITHDRAW_AMOUNT_INVALID(1602, "提现金额不合法");

    private final int code;
    private final String msg;

    ErrorCode(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }
}
