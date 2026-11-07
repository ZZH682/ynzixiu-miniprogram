package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.PushLog;
import org.apache.ibatis.annotations.Mapper;

/** 站内消息 / 推送日志。 */
@Mapper
public interface PushLogMapper extends BaseMapper<PushLog> {
}
