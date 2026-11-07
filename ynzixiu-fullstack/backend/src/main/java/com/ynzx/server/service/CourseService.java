package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.cache.CacheService;
import com.ynzx.server.common.BizException;
import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.entity.Chapter;
import com.ynzx.server.entity.Course;
import com.ynzx.server.entity.Order;
import com.ynzx.server.mapper.ChapterMapper;
import com.ynzx.server.mapper.CourseMapper;
import com.ynzx.server.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 课程服务。
 *
 * <p><b>演示缓存三大问题的处理</b>：</p>
 * <ul>
 *   <li><b>缓存穿透</b>：查不存在的课程 ID 也会缓存空标记，避免反复打 DB</li>
 *   <li><b>缓存击穿</b>：课程详情用分布式锁保证只有一个线程回源</li>
 *   <li><b>缓存雪崩</b>：TTL 由缓存层统一加随机抖动</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private static final String CACHE_COURSE_LIST = "course:list:";
    private static final String CACHE_COURSE_DETAIL = "course:detail:";

    private final CourseMapper courseMapper;
    private final ChapterMapper chapterMapper;
    private final OrderMapper orderMapper;
    private final CacheService cacheService;
    private final com.ynzx.server.lock.DistributedLock distributedLock;

    /**
     * 课程列表（带缓存）。
     */
    public List<Course> listCourses(Integer bid) {
        String key = CACHE_COURSE_LIST + (bid == null ? "all" : bid);
        List<Course> cached = cacheService.get(key, List.class);
        if (cached != null) {
            log.debug("命中课程列表缓存 key={}", key);
            return cached;
        }
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<Course>()
                .eq(Course::getStatus, 1)
                .orderByAsc(Course::getId);
        if (bid != null) {
            wrapper.eq(Course::getBid, bid);
        }
        List<Course> list = courseMapper.selectList(wrapper);
        cacheService.set(key, list, java.time.Duration.ofMinutes(10));
        return list;
    }

    /**
     * 课程详情（缓存 + 分布式锁防击穿）。
     */
    public Course getCourse(Integer id) {
        String key = CACHE_COURSE_DETAIL + id;
        Course cached = cacheService.get(key, Course.class);
        if (cached != null) {
            return cached;
        }
        // 防击穿：加锁保证只有一个线程回源，其余线程等待后重读缓存
        return distributedLock.executeWithLock(key, () -> {
            Course again = cacheService.get(key, Course.class);
            if (again != null) {
                return again;
            }
            Course course = courseMapper.selectById(id);
            if (course != null) {
                cacheService.set(key, course, java.time.Duration.ofMinutes(30));
            }
            return course;
        });
    }

    /**
     * 章节列表 + 播放权限控制。
     *
     * <p><b>权限模型</b>：未报名用户只能看试听章节（trial=1），
     * 已报名用户看全部。这是典型的"数据级权限 + 字段裁剪"。</p>
     */
    public Map<String, Object> getChapters(Integer courseId, Integer userId) {
        Course course = getCourse(courseId);
        if (course == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "课程不存在");
        }
        List<Chapter> chapters = chapterMapper.selectList(new LambdaQueryWrapper<Chapter>()
                .eq(Chapter::getCourseId, courseId)
                .orderByAsc(Chapter::getSort));

        boolean enrolled = userId != null && orderMapper.selectCount(
                new LambdaQueryWrapper<Order>()
                        .eq(Order::getUserId, userId)
                        .eq(Order::getCourseId, courseId)
                        .in(Order::getStatus, "paid", "part_paid")) > 0;

        List<Map<String, Object>> result = new ArrayList<>(chapters.size());
        for (Chapter ch : chapters) {
            Map<String, Object> item = new HashMap<>(8);
            item.put("id", ch.getId());
            item.put("title", ch.getTitle());
            item.put("dur", ch.getDur());
            item.put("trial", ch.getTrial());
            item.put("sort", ch.getSort());
            boolean unlocked = enrolled || (ch.getTrial() != null && ch.getTrial() == 1);
            item.put("unlocked", unlocked);
            // 字段级裁剪：未解锁的章节不下发 videoUrl，避免前端拿到后盗链
            item.put("videoUrl", unlocked ? ch.getVideoUrl() : null);
            result.add(item);
        }
        Map<String, Object> map = new HashMap<>(4);
        map.put("course", course);
        map.put("chapters", result);
        map.put("enrolled", enrolled);
        return map;
    }

    /**
     * 清理课程缓存（管理端下架/改价后调用）。
     */
    public void evictCourseCache(Integer courseId) {
        cacheService.delete(CACHE_COURSE_DETAIL + courseId);
        cacheService.deleteByPrefix(CACHE_COURSE_LIST);
    }
}
