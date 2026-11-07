package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.Setting;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 系统设置。settings 表主键是非 id 的 k 列，
 * 这里用注解查询避开 BaseMapper 对默认主键 id 的假设。
 *
 * <p>返回实体而非 {@code List<Map>}：H2 的 {@code v} 是 CLOB，Map 方式会拿到
 * {@code JdbcClob} 对象，{@code String.valueOf()} 得到 "clob0: U&'...'" 之类错误内容，
 * Jackson 序列化还会产出畸形 JSON。走实体的 {@code String} 属性由 MyBatis 用
 * {@code ResultSet#getString} 转换，H2 / MySQL 行为一致。</p>
 */
@Mapper
public interface SettingMapper extends BaseMapper<Setting> {

    @Select("SELECT k, v FROM settings")
    List<Setting> selectAll();
}
