package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.Withdraw;
import org.apache.ibatis.annotations.Mapper;

/** 提现申请。 */
@Mapper
public interface WithdrawMapper extends BaseMapper<Withdraw> {
}
