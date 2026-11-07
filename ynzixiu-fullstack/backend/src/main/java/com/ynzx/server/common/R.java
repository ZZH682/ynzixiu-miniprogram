package com.ynzx.server.common;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应体。
 *
 * <p>与原 Node 版协议保持一致：{@code {code, data, msg}}，code=0 表示成功。
 * 这样前端的请求拦截器可以只判断 code，不受 HTTP 状态码影响。</p>
 *
 * @param <T> 业务数据类型
 */
@Data
public class R<T> implements Serializable {

    private int code;
    private String msg;
    private T data;

    private R(int code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    public static <T> R<T> ok(T data) {
        return new R<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMsg(), data);
    }

    public static <T> R<T> ok() {
        return new R<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMsg(), null);
    }

    public static <T> R<T> fail(ErrorCode errorCode) {
        return new R<>(errorCode.getCode(), errorCode.getMsg(), null);
    }

    public static <T> R<T> fail(ErrorCode errorCode, String msg) {
        return new R<>(errorCode.getCode(), msg, null);
    }

    public static <T> R<T> fail(int code, String msg) {
        return new R<>(code, msg, null);
    }
}
