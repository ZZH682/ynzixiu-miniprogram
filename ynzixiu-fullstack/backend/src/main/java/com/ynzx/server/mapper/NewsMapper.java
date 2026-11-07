package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.News;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NewsMapper extends BaseMapper<News> {
}
