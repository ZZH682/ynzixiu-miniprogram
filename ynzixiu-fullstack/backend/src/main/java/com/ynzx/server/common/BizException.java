package com.ynzx.server.common;

import lombok.Getter;

/**
 * 业务异常。
 *
 * <p>只用于"可预期的业务失败"（余额不足、库存不足、参数不合法）。
 * 不可预期的系统异常一律抛 RuntimeException，由 GlobalExceptionHandler 兜底记 error 日志。</p>
 *
 * <p>为什么不直接用 IllegalArgumentException / IllegalStateException？
 * 因为那样前端拿不到错误码，只能靠匹配中文提示，很脆弱。</p>
 */
@Getter
public class BizException extends RuntimeException {

    private final ErrorCode errorCode;

    public BizException(ErrorCode errorCode) {
        super(errorCode.getMsg());
        this.errorCode = errorCode;
    }

    public BizException(ErrorCode errorCode, String customMsg) {
        super(customMsg);
        this.errorCode = errorCode;
    }

    public int getCode() {
        return errorCode.getCode();
    }

    /** 业务异常不需要堆栈，构造时关闭 fillInStackTrace 降低开销 */
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
}
