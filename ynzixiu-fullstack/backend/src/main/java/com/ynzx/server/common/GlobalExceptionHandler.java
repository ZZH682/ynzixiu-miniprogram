package com.ynzx.server.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import java.util.stream.Collectors;

/**
 * 全局异常处理。
 *
 * <p>核心约定：<b>业务失败 HTTP 200 + code != 0</b>；
 * 只有框架级错误（404 路径不存在、500 未捕获）才给对应 HTTP 状态码。
 * 前端只需一个拦截器：HTTP 正常就查 code，异常就弹提示。</p>
 *
 * <p>日志分级：业务异常 warn（正常业务流，不污染 error 指标），
 * 系统异常 error + 打印堆栈（真正需要告警的）。</p>
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 可预期的业务异常：HTTP 200 + 业务码 */
    @ExceptionHandler(BizException.class)
    public R<Void> handleBiz(BizException e, HttpServletRequest request) {
        log.warn("业务异常 uri={} code={} msg={}", request.getRequestURI(), e.getCode(), e.getMessage());
        return R.fail(e.getErrorCode(), e.getMessage());
    }

    /** @Valid 校验失败（RequestBody） */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("；"));
        log.warn("参数校验失败: {}", msg);
        return R.fail(ErrorCode.PARAM_ERROR, msg);
    }

    /** @Valid 校验失败（表单绑定） */
    @ExceptionHandler(BindException.class)
    public R<Void> handleBind(BindException e) {
        String msg = e.getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("；"));
        return R.fail(ErrorCode.PARAM_ERROR, msg);
    }

    /** @Validated 校验失败（方法参数级） */
    @ExceptionHandler(ConstraintViolationException.class)
    public R<Void> handleConstraint(ConstraintViolationException e) {
        String msg = e.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining("；"));
        return R.fail(ErrorCode.PARAM_ERROR, msg);
    }

    /** 缺少必填请求参数 */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public R<Void> handleMissingParam(MissingServletRequestParameterException e) {
        return R.fail(ErrorCode.PARAM_ERROR, "缺少必填参数: " + e.getParameterName());
    }

    /** 唯一索引冲突：例如手机号重复注册、重复领取优惠券 */
    @ExceptionHandler(DuplicateKeyException.class)
    public R<Void> handleDuplicate(DuplicateKeyException e) {
        log.warn("唯一约束冲突: {}", e.getMessage());
        return R.fail(ErrorCode.CONFLICT);
    }

    /** 404：路径不存在（真正的 HTTP 404） */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public R<Void> handleNotFound(NoHandlerFoundException e) {
        return R.fail(ErrorCode.NOT_FOUND);
    }

    /**
     * 404：静态资源路径不存在。
     *
     * <p>Spring Framework 6.1 / Boot 3.2 起，开启 {@code static-path-pattern: /**} 后，
     * 找不到的静态资源会抛 {@link NoResourceFoundException} 而非 {@link NoHandlerFoundException}。
     * 若不单独处理，它会落到下面的兜底分支，被误报为 HTTP 200 + code=5000 的「系统异常」，
     * 还会打印 ERROR 堆栈污染告警。这里显式归一为 HTTP 404 + 业务码 1004，且不记 error 日志。</p>
     */
    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public R<Void> handleNoResource(NoResourceFoundException e) {
        log.debug("静态资源不存在: {}", e.getMessage());
        return R.fail(ErrorCode.NOT_FOUND);
    }

    /** 兜底：任何没被捕获的异常 */
    @ExceptionHandler(Exception.class)
    public R<Void> handleUnexpected(Exception e, HttpServletRequest request) {
        log.error("系统异常 uri={}", request.getRequestURI(), e);
        return R.fail(ErrorCode.SERVER_ERROR);
    }
}
