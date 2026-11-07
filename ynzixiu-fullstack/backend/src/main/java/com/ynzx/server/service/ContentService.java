package com.ynzx.server.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ynzx.server.cache.CacheService;
import com.ynzx.server.common.BizException;
import com.ynzx.server.common.ErrorCode;
import com.ynzx.server.entity.Business;
import com.ynzx.server.entity.Campus;
import com.ynzx.server.entity.Course;
import com.ynzx.server.entity.Material;
import com.ynzx.server.entity.MaterialDownload;
import com.ynzx.server.entity.News;
import com.ynzx.server.entity.Order;
import com.ynzx.server.entity.Review;
import com.ynzx.server.entity.Story;
import com.ynzx.server.entity.Teacher;
import com.ynzx.server.mapper.BusinessMapper;
import com.ynzx.server.mapper.CampusMapper;
import com.ynzx.server.mapper.CourseMapper;
import com.ynzx.server.mapper.MaterialDownloadMapper;
import com.ynzx.server.mapper.MaterialMapper;
import com.ynzx.server.mapper.NewsMapper;
import com.ynzx.server.mapper.OrderMapper;
import com.ynzx.server.mapper.ReviewMapper;
import com.ynzx.server.mapper.StoryMapper;
import com.ynzx.server.mapper.TeacherMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 内容/品牌展示服务：六大业务板块、政策资讯、名师、喜报、校区、学员评价、资料下载。
 *
 * <p>本模块接口全部走公开端（{@code /content/**}），无需登录即可浏览，
 * 仅"会员资料下载"需要校验报名身份（数据级权限）。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentService {

    private static final String CACHE_BUSINESS = "content:business:";

    private final BusinessMapper businessMapper;
    private final NewsMapper newsMapper;
    private final TeacherMapper teacherMapper;
    private final StoryMapper storyMapper;
    private final CampusMapper campusMapper;
    private final ReviewMapper reviewMapper;
    private final MaterialMapper materialMapper;
    private final MaterialDownloadMapper materialDownloadMapper;
    private final OrderMapper orderMapper;
    private final CourseMapper courseMapper;
    private final CacheService cacheService;

    /** 六大业务板块（带缓存） */
    public List<Business> listBusinesses() {
        List<Business> cached = cacheService.get(CACHE_BUSINESS + "all", List.class);
        if (cached != null) {
            return cached;
        }
        List<Business> list = businessMapper.selectList(
                new LambdaQueryWrapper<Business>().orderByAsc(Business::getSort));
        cacheService.set(CACHE_BUSINESS + "all", list, Duration.ofMinutes(30));
        return list;
    }

    public List<News> listNews(Integer bid, String category, Integer top) {
        LambdaQueryWrapper<News> w = new LambdaQueryWrapper<News>()
                .orderByDesc(News::getTop).orderByDesc(News::getDate);
        if (bid != null) {
            w.eq(News::getBid, bid);
        }
        if (category != null) {
            w.eq(News::getCategory, category);
        }
        if (top != null && top == 1) {
            w.eq(News::getTop, 1);
        }
        List<News> list = newsMapper.selectList(w);
        // 阅读量 +1（演示用，避免并发竞态不在此处强一致）
        for (News n : list) {
            if (n.getViews() == null) {
                n.setViews(0);
            }
        }
        return list;
    }

    public List<Teacher> listTeachers(Integer bid) {
        LambdaQueryWrapper<Teacher> w = new LambdaQueryWrapper<Teacher>().orderByDesc(Teacher::getYears);
        if (bid != null) {
            w.eq(Teacher::getBid, bid);
        }
        return teacherMapper.selectList(w);
    }

    public List<Story> listStories() {
        return storyMapper.selectList(new LambdaQueryWrapper<Story>().orderByDesc(Story::getId));
    }

    public List<Campus> listCampuses() {
        return campusMapper.selectList(new LambdaQueryWrapper<Campus>().orderByAsc(Campus::getSort));
    }

    public List<Review> listReviews(Integer bid) {
        LambdaQueryWrapper<Review> w = new LambdaQueryWrapper<Review>()
                .eq(Review::getStatus, "approved").orderByDesc(Review::getId);
        if (bid != null) {
            w.eq(Review::getBid, bid);
        }
        return reviewMapper.selectList(w);
    }

    public List<Material> listMaterials(Integer bid) {
        LambdaQueryWrapper<Material> w = new LambdaQueryWrapper<Material>().orderByAsc(Material::getSort);
        if (bid != null) {
            w.eq(Material::getBid, bid);
        }
        return materialMapper.selectList(w);
    }

    /**
     * 资料下载（带会员权限校验）。
     *
     * <p><b>权限模型</b>：{@code member=1} 的资料仅限"已报名该板块课程"的学员下载，
     * 这是典型的"数据级权限 + 字段裁剪"——未报名时返回 403 而非泄露 fileUrl。</p>
     */
    public String downloadMaterial(Integer materialId, Integer userId) {
        Material m = materialMapper.selectById(materialId);
        if (m == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "资料不存在");
        }
        if (m.getMember() != null && m.getMember() == 1) {
            if (userId == null) {
                throw new BizException(ErrorCode.UNAUTHORIZED, "请先登录");
            }
            boolean enrolled = orderMapper.selectCount(new LambdaQueryWrapper<Order>()
                    .eq(Order::getUserId, userId)
                    .eq(Order::getBid, m.getBid())
                    .in(Order::getStatus, "paid", "part_paid")) > 0;
            if (!enrolled) {
                throw new BizException(ErrorCode.CHAPTER_LOCKED, "该资料仅限已报名学员下载");
            }
        }
        // 记下载流水 + 计数
        MaterialDownload dl = new MaterialDownload();
        dl.setUserId(userId);
        dl.setMaterialId(materialId);
        dl.setCreatedAt(LocalDateTime.now());
        materialDownloadMapper.insert(dl);
        m.setDownloads((m.getDownloads() == null ? 0 : m.getDownloads()) + 1);
        materialMapper.updateById(m);
        return m.getFileUrl();
    }

    /** 资料列表（已登录时标记是否已下载过） */
    public List<Material> listMaterialsWithFlag(Integer bid, Integer userId) {
        List<Material> list = listMaterials(bid);
        if (userId != null) {
            for (Material m : list) {
                long cnt = materialDownloadMapper.selectCount(new LambdaQueryWrapper<MaterialDownload>()
                        .eq(MaterialDownload::getUserId, userId)
                        .eq(MaterialDownload::getMaterialId, m.getId()));
                m.setDownloads((int) cnt);
            }
        }
        return list;
    }
}
