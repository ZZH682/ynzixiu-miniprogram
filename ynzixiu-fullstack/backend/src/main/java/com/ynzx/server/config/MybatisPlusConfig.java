package com.ynzx.server.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.BlockAttackInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.OptimisticLockerInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * MyBatis-Plus 配置。
 *
 * <p><b>三个拦截器的顺序不能乱</b>（这是高频踩坑点）：</p>
 * <ol>
 *   <li><b>分页插件</b>必须放在最后？—— 不，MyBatis-Plus 官方要求<b>分页插件放在最后</b>，
 *       否则多租户等插件改写的 SQL 会绕过分页。</li>
 *   <li><b>乐观锁插件</b>：{@code UPDATE ... SET version = version + 1 WHERE version = ?}，
 *       用于并发更新场景（订单状态机）。</li>
 *   <li><b>防全表更新删除</b>：{@code BlockAttackInnerInterceptor} 拦截没有 where 条件的
 *       update/delete，防止手滑清库。</li>
 * </ol>
 */
@Configuration
@EnableTransactionManagement
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor(AppProperties props) {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 1. 乐观锁（版本号）
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());

        // 2. 防全表更新/删除
        interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());

        // 3. 分页插件 —— 必须放在最后
        PaginationInnerInterceptor pagination = new PaginationInnerInterceptor(
                "mysql".equalsIgnoreCase(props.getDatasource().getType()) ? DbType.MYSQL : DbType.H2);
        // 单页最大条数限制，防止恶意传 pageSize=1000000 拖垮数据库
        pagination.setMaxLimit(100L);
        // 请求页码超过总页数时返回空列表而不是回到第一页（避免数据重复展示）
        pagination.setOverflow(false);
        interceptor.addInnerInterceptor(pagination);

        return interceptor;
    }
}
