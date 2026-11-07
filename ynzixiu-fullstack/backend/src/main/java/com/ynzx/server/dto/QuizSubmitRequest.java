package com.ynzx.server.dto;

import lombok.Data;

/**
 * 提交单题答案请求。
 */
@Data
public class QuizSubmitRequest {
    /** 题目 id */
    private Integer questionId;
    /** 用户选择（如 "A" 或 "AB"） */
    private String chosen;
}
