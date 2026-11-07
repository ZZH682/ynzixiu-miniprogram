package com.ynzx.server.dto;

import lombok.Data;

import java.util.Map;

/**
 * 模考交卷请求。
 */
@Data
public class ExamSubmitRequest {
    /** 科目 id */
    private Integer sid;
    /** 考试用时（秒） */
    private Integer duration;
    /** 答案：题目 id -> 用户选择 */
    private Map<String, String> answers;
}
