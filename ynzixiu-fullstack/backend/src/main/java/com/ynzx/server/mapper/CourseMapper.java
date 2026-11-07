package com.ynzx.server.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ynzx.server.entity.Course;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 课程 Mapper。
 *
 * <p>演示<b>条件更新（CAS）</b>与<b>行级锁</b>两种并发控制手段。</p>
 */
@Mapper
public interface CourseMapper extends BaseMapper<Course> {

    /**
     * 乐观扣库存：只有当库存足够时才更新成功。
     *
     * <p><b>这是防超卖的核心 SQL</b>。返回受影响行数：</p>
     * <ul>
     *   <li>= 1 → 扣减成功</li>
     *   <li>= 0 → 库存不足（已被别人抢完），业务侧抛 STOCK_NOT_ENOUGH</li>
     * </ul>
     *
     * <p><b>为什么不用"先 select 库存，再 update 库存=库存-1"？</b>
     * 那是典型的 check-then-act 竞态：两个线程同时读到 stock=1，
     * 都通过检查，最后都执行 update，导致卖出 2 份。
     * 把判断和更新合并成一条带 where 条件的原子 SQL，由数据库的行锁保证互斥。</p>
     */
    @Update("UPDATE courses SET stock = stock - #{qty}, sales = sales + #{qty} "
            + "WHERE id = #{id} AND stock >= #{qty}")
    int deductStock(@Param("id") Integer id, @Param("qty") Integer qty);

    /**
     * 悲观锁版本：SELECT ... FOR UPDATE。
     *
     * <p>用于"必须先读后算"的场景（如分账需要读取当前余额再累加）。
     * 相比乐观锁，它会阻塞其他事务，吞吐更低但语义更强。</p>
     */
    @Select("SELECT * FROM courses WHERE id = #{id} FOR UPDATE")
    Course selectForUpdate(@Param("id") Integer id);

    @Select("SELECT * FROM courses WHERE status = 1 ORDER BY sort, id")
    List<Course> selectEnabled();
}
