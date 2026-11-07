package com.ynzx.server.task;

import com.ynzx.server.mapper.GroupInfoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;

/**
 * 拼团定时任务：关闭过期未成团的团。
 *
 * <p><b>为什么用定时任务而不是懒加载（读时判断）？</b>
 * 懒加载能保证"读到的状态一定正确"，但会产生大量无效 UPDATE，
 * 且没有团被访问时就永远不清理。定时任务把清理集中到低峰期批量做，
 * 代价是过期后到下次调度之间（约 1 分钟）状态可能短暂不一致——
 * 所以业务层的 join/update 语句里也都带了 {@code expires_at > now} 条件做兜底。</p>
 *
 * <p><b>@Scheduled 的坑</b>：默认单线程执行，一个任务卡住会阻塞后续所有任务。
 * 生产应配置 {@code spring.task.scheduling.pool.size} 或用独立调度器。
 * 这里用固定延迟（fixedDelay）而非固定频率（fixedRate）：
 * fixedRate 若任务执行时间超过间隔会排队堆积，fixedDelay 是"上次结束后再等 N 秒"。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GroupExpireTask {

    private final GroupInfoMapper groupInfoMapper;
    private final Clock clock;

    /** 每分钟执行一次，关闭过期未成团的团 */
    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    @Transactional(rollbackFor = Exception.class)
    public void expireGroups() {
        try {
            int expired = groupInfoMapper.expireGroups(LocalDateTime.now(clock));
            if (expired > 0) {
                log.info("已关闭 {} 个过期拼团", expired);
            }
        } catch (Exception e) {
            // 定时任务里必须自己兜住异常，否则异常会终止后续调度
            log.error("关闭过期拼团任务失败", e);
        }
    }
}
