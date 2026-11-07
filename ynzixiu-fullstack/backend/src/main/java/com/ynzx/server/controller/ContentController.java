package com.ynzx.server.controller;

import com.ynzx.server.common.R;
import com.ynzx.server.security.UserContext;
import com.ynzx.server.service.ContentService;
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
 * 内容/品牌展示接口（公开）。
 *
 * <p>对应标书"内容与品牌展示"与"六大业务板块"章节：
 * 办学资质、校区环境、上岸喜报、名师团队、政策资讯、学员评价、资料下载。</p>
 */
@RestController
@RequestMapping("/api/v1/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    /** 六大业务板块 */
    @GetMapping("/businesses")
    public R<List<?>> businesses() {
        return R.ok(contentService.listBusinesses());
    }

    /** 政策资讯 / 新闻 */
    @GetMapping("/news")
    public R<List<?>> news(@RequestParam(required = false) Integer bid,
                           @RequestParam(required = false) String category,
                           @RequestParam(required = false) Integer top) {
        return R.ok(contentService.listNews(bid, category, top));
    }

    /** 名师团队 */
    @GetMapping("/teachers")
    public R<List<?>> teachers(@RequestParam(required = false) Integer bid) {
        return R.ok(contentService.listTeachers(bid));
    }

    /** 上岸喜报 */
    @GetMapping("/stories")
    public R<List<?>> stories() {
        return R.ok(contentService.listStories());
    }

    /** 校区环境 */
    @GetMapping("/campuses")
    public R<List<?>> campuses() {
        return R.ok(contentService.listCampuses());
    }

    /** 学员评价 */
    @GetMapping("/reviews")
    public R<List<?>> reviews(@RequestParam(required = false) Integer bid) {
        return R.ok(contentService.listReviews(bid));
    }

    /** 备考资料列表 */
    @GetMapping("/materials")
    public R<List<?>> materials(@RequestParam(required = false) Integer bid) {
        return R.ok(contentService.listMaterials(bid));
    }

    /** 资料下载（会员资料需报名校验） */
    @PostMapping("/materials/{id}/download")
    public R<Map<String, String>> download(@PathVariable Integer id) {
        String url = contentService.downloadMaterial(id, UserContext.userId());
        return R.ok(Map.of("fileUrl", url == null ? "" : url));
    }
}
