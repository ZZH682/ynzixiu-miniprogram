package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.common.BizException;
import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.entity.GroupInfo;
import com.ynzx.server.entity.GroupMember;
import com.ynzx.server.mapper.GroupInfoMapper;
import com.ynzx.server.mapper.GroupMemberMapper;
import com.ynzx.server.mapper.GroupRuleMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 拼团服务。
 *
 * <p><b>并发控制是本类的核心</b>：</p>
 * <ul>
 *   <li>参团占位用<b>条件更新</b> {@code UPDATE ... WHERE joined < size}，
 *       数据库行锁保证原子性，不会超员。</li>
 *   <li>同一用户重复参团用<b>唯一索引 + 条件查询</b>双重拦截。</li>
 *   <li>成团后由条件更新把状态从 forming 推到 success。</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupInfoMapper groupInfoMapper;
    private final GroupMemberMapper groupMemberMapper;
    private final GroupRuleMapper groupRuleMapper;
    private final Clock clock;

    /**
     * 开团。
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> createGroup(Integer userId, Integer courseId, Integer ruleId) {
        LocalDateTime now = LocalDateTime.now(clock);
        com.ynzx.server.entity.GroupRule rule = groupRuleMapper.selectById(ruleId);
        if (rule == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "拼团规则不存在");
        }
        if (!rule.getCourseId().equals(courseId)) {
            throw new BizException(ErrorCode.GROUP_SIZE_MISMATCH);
        }

        GroupInfo group = new GroupInfo();
        group.setGroupNo("G" + now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        group.setCourseId(courseId);
        group.setLeaderId(userId);
        group.setSize(rule.getSize());
        group.setPrice(rule.getPrice());
        group.setJoined(1);
        group.setStatus("forming");
        group.setExpiresAt(now.plusHours(rule.getHours() == null ? 24 : rule.getHours()));
        group.setCreatedAt(now);
        group.setVersion(0);
        groupInfoMapper.insert(group);

        GroupMember member = new GroupMember();
        member.setGroupId(group.getId());
        member.setUserId(userId);
        member.setCreatedAt(now);
        groupMemberMapper.insert(member);

        Map<String, Object> result = new HashMap<>(6);
        result.put("groupId", group.getId());
        result.put("groupNo", group.getGroupNo());
        result.put("size", group.getSize());
        result.put("joined", group.getJoined());
        result.put("price", group.getPrice());
        result.put("expiresAt", group.getExpiresAt());
        return result;
    }

    /**
     * 参团。
     *
     * <p><b>关键：{@code joinGroup} 返回 0 表示团已满或已过期。</b>
     * 这一步是超员保护的核心，靠数据库条件更新而非应用层判断。</p>
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> joinGroup(Integer userId, Integer groupId) {
        LocalDateTime now = LocalDateTime.now(clock);
        GroupInfo group = groupInfoMapper.selectById(groupId);
        if (group == null) {
            throw new BizException(ErrorCode.GROUP_NOT_EXISTS);
        }
        if (!"forming".equals(group.getStatus())) {
            throw new BizException(ErrorCode.GROUP_EXPIRED, "该团状态为 " + group.getStatus());
        }
        if (group.getExpiresAt() != null && now.isAfter(group.getExpiresAt())) {
            throw new BizException(ErrorCode.GROUP_EXPIRED);
        }
        // 重复参团拦截
        Long joined = groupMemberMapper.selectCount(new LambdaQueryWrapper<GroupMember>()
                .eq(GroupMember::getGroupId, groupId)
                .eq(GroupMember::getUserId, userId));
        if (joined != null && joined > 0) {
            throw new BizException(ErrorCode.GROUP_ALREADY_JOINED);
        }

        // 核心并发控制：条件更新，joined < size 才生效
        int affected = groupInfoMapper.joinGroup(groupId, now);
        if (affected == 0) {
            throw new BizException(ErrorCode.STOCK_NOT_ENOUGH, "名额已满");
        }

        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserId(userId);
        member.setCreatedAt(now);
        groupMemberMapper.insert(member);

        // 满员则成团
        groupInfoMapper.markSuccess(groupId);
        GroupInfo latest = groupInfoMapper.selectById(groupId);

        Map<String, Object> result = new HashMap<>(5);
        result.put("groupId", groupId);
        result.put("joined", latest.getJoined());
        result.put("size", latest.getSize());
        result.put("status", latest.getStatus());
        result.put("price", latest.getPrice());
        return result;
    }

    /**
     * 可参团列表。
     */
    public List<GroupInfo> listActive(Integer courseId) {
        return groupInfoMapper.selectActiveByCourse(courseId, LocalDateTime.now(clock));
    }

    /**
     * 我的团。
     */
    public List<GroupInfo> listMine(Integer userId) {
        List<GroupMember> members = groupMemberMapper.selectList(
                new LambdaQueryWrapper<GroupMember>().eq(GroupMember::getUserId, userId));
        if (members.isEmpty()) {
            return List.of();
        }
        List<Integer> groupIds = members.stream().map(GroupMember::getGroupId).toList();
        return groupInfoMapper.selectBatchIds(groupIds);
    }
}
