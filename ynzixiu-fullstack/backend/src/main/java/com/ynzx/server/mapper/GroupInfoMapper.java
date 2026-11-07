package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.GroupInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 拼团 Mapper。
 */
@Mapper
public interface GroupInfoMapper extends BaseMapper<GroupInfo> {

    /**
     * 参团占位：joined + 1，且只有未满员时才能成功。
     *
     * <p><b>防超卖的核心</b>：{@code WHERE joined < size} 条件写在 UPDATE 里，
     * 数据库保证这条语句的原子性，并发下只有一个线程能把 joined 从 size-1 改成 size。</p>
     */
    @Update("UPDATE groups SET joined = joined + 1, version = version + 1 "
            + "WHERE id = #{id} AND status = 'forming' AND joined < size AND expires_at > #{now}")
    int joinGroup(@Param("id") Integer id, @Param("now") LocalDateTime now);

    /**
     * 成团：满员后把状态从 forming 改为 success。
     */
    @Update("UPDATE groups SET status = 'success' WHERE id = #{id} AND status = 'forming' AND joined >= size")
    int markSuccess(@Param("id") Integer id);

    /**
     * 关闭过期未成团的团（定时任务调用）。
     */
    @Update("UPDATE groups SET status = 'expired' "
            + "WHERE status = 'forming' AND expires_at < #{now}")
    int expireGroups(@Param("now") LocalDateTime now);

    @Select("SELECT * FROM groups WHERE status = 'forming' AND expires_at > #{now} AND course_id = #{courseId}")
    List<GroupInfo> selectActiveByCourse(@Param("courseId") Integer courseId,
                                         @Param("now") LocalDateTime now);
}
