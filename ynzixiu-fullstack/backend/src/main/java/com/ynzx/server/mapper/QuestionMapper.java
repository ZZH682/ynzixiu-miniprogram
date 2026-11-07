package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.Question;
import org.apache.ibatis.annotations.Mapper;

/**
 * {@code Question} Mapper。
 */
@Mapper
public interface QuestionMapper extends BaseMapper<Question> {
}
