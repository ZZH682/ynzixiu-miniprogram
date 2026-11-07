package com.ynzx.server.controller;

import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.common.R;
import com.ynzx.server.lock.DistributedLock;
import com.ynzx.server.entity.Course;
import com.ynzx.server.entity.GroupInfo;
import com.ynzx.server.service.CourseService;
import com.ynzx.server.service.GroupService;
import com.ynzx.server.security.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 课程与拼团接口。
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final GroupService groupService;
    private final DistributedLock distributedLock;

    /** 课程列表 */
    @GetMapping("/courses")
    public R<List<Course>> list(@RequestParam(required = false) Integer bid) {
        return R.ok(courseService.listCourses(bid));
    }

    /** 课程详情 */
    @GetMapping("/courses/{id}")
    public R<Course> detail(@PathVariable Integer id) {
        return R.ok(courseService.getCourse(id));
    }

    /** 章节列表（含播放权限） */
    @GetMapping("/courses/{id}/chapters")
    public R<Map<String, Object>> chapters(@PathVariable Integer id) {
        return R.ok(courseService.getChapters(id, UserContext.userId()));
    }

    /** 开团 */
    @PostMapping("/groups")
    public R<Map<String, Object>> createGroup(@RequestParam Integer courseId,
                                              @RequestParam Integer ruleId) {
        var user = com.ynzx.server.security.AuthInterceptor.requireLogin();
        return R.ok(groupService.createGroup(user.getUserId(), courseId, ruleId));
    }

    /** 参团 */
    @PostMapping("/groups/{groupId}/join")
    public R<Map<String, Object>> joinGroup(@PathVariable Integer groupId) {
        var user = com.ynzx.server.security.AuthInterceptor.requireLogin();
        // 锁在事务外，与数据库条件更新（joined < size）形成双保险
        try {
            return R.ok(distributedLock.executeWithLock("group:" + groupId,
                    () -> groupService.joinGroup(user.getUserId(), groupId)));
        } catch (IllegalStateException e) {
            return R.fail(ErrorCode.CONFLICT, "参团请求正在处理中，请稍后重试");
        }
    }

    /** 可参团列表 */
    @GetMapping("/groups")
    public R<List<GroupInfo>> listGroups(@RequestParam Integer courseId) {
        return R.ok(groupService.listActive(courseId));
    }

    /** 我的团 */
    @GetMapping("/groups/mine")
    public R<List<GroupInfo>> myGroups() {
        var user = com.ynzx.server.security.AuthInterceptor.requireLogin();
        return R.ok(groupService.listMine(user.getUserId()));
    }
}
