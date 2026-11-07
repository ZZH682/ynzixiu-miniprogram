// 云南自修学校 · H5 页面视图（内容展示类：首页/业务/课程/资讯/师资/评价/校区/资料/关于）
(function () {
  const A = window.App;
  const M = A.M;
  const esc = A.esc;

  const courseRow = (c, showBuy) => {
    const card = A.courseCard(c);
    const owned = A.Store.ownedIds().indexOf(c.id) > -1;
    return (
      '<div class="course-row">' +
      '<a class="cover cover-sm" style="background:linear-gradient(150deg,' + card.color + ',' + card.color + 'CC)" href="#/course/' + c.id + '">' +
      '<span class="cover-char">' + card.char + '</span>' +
      '<span class="cover-type">' + card.typeText + '</span>' +
      '<span class="cover-name">' + esc(c.short) + '</span>' +
      '</a>' +
      '<div class="course-main">' +
      '<a class="course-title ellipsis" href="#/course/' + c.id + '">' + esc(c.title) + '</a>' +
      '<div class="course-meta">' + esc(c.teacherNote) + ' · ' + esc(c.bname) + ' · 已报名 ' + c.sales + '</div>' +
      '</div>' +
      '<div class="course-buy">' +
      '<div><span class="price course-price"><span class="price-unit">¥</span>' + card.priceText + '</span><span class="price-orig">¥' + card.origText + '</span></div>' +
      (showBuy ? '<button class="btn ' + (owned ? 'btn-line' : 'btn-primary') + ' course-btn" onclick="P.buy(' + c.id + ')">' + (owned ? '继续学习' : '立即报名') + '</button>' : '') +
      '</div>' +
      '</div>'
    );
  };

  // ============ 首页 ============
  A.route('home', {
    title: () => '首页',
    render() {
      const g = A.groupCard(A.M.groupBuys[0].courseId);
      const topNews = M.news.filter((n) => n.top).slice(0, 3);
      const hot = M.courses.slice().sort((a, b) => b.sales - a.sales).slice(0, 4);
      const stories = M.stories.map((s) => Object.assign({}, s, { color: M.businessById(s.bid).color }));
      const couponMax = Math.max.apply(null, M.coupons.map((c) => c.amount));
      return (
        '<section class="hero">' +
        '<div class="hero-in">' +
        '<div class="hero-main">' +
        '<div class="hero-kicker">YUNNIAN ZIXIU SCHOOL</div>' +
        '<h1 class="hero-title">从学历提升到上岸\n一路有老师带着走</h1>' +
        '<p class="hero-sub">成人学历 · 自考 · 专升本 · 公考 · 考研 · 留学</p>' +
        '<div class="hero-actions">' +
        '<a class="hero-btn hero-btn-w" href="#/signup">免费预约规划</a>' +
        '<a class="hero-btn hero-btn-o" href="#/course">查看课程</a>' +
        '</div>' +
        '</div>' +
        '<div class="hero-side">' +
        '<div class="hero-card">' +
        '<div class="hero-card-t">五大终端 · 数据互通</div>' +
        '<div class="hero-card-l"><span>PC 官网</span><span>手机站</span></div>' +
        '<div class="hero-card-l"><span>微信公众号</span><span>小程序</span></div>' +
        '<div class="hero-card-l"><span>安卓 APP</span><span>一套后台</span></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</section>' +

        '<div class="section"><div class="biz-grid">' +
        M.businesses.map((b) =>
          '<a class="biz" href="#/business/' + b.id + '">' +
          '<span class="mark" style="background:' + b.tint + ';color:' + b.color + '">' + b.char + '</span>' +
          '<span class="biz-name">' + esc(b.name) + '</span>' +
          '</a>'
        ).join('') +
        '</div></div>' +

        '<div class="section">' +
        '<div class="section-head"><span class="section-title">福利活动</span><a class="section-more" href="#/coupon">领券中心 ›</a></div>' +
        '<div class="promo-grid">' +
        '<a class="promo promo-big" href="#/course/' + g.courseId + '">' +
        '<span class="promo-kicker">' + g.size + ' 人拼团</span>' +
        '<span class="promo-title">' + esc(M.courseById(g.courseId).short) + '\n每人省 ¥' + g.saveText + '</span>' +
        '<span class="promo-go">去开团 →</span>' +
        '</a>' +
        '<a class="promo promo-sm" href="#/coupon"><span class="promo-title-sm">领券中心</span><span class="promo-sub">分业务发券，最高减 ¥' + A.fmt.price(couponMax) + '</span></a>' +
        '<a class="promo promo-sm" href="#/invite"><span class="promo-title-sm">邀请有礼</span><span class="promo-sub">好友报名，你得实付 5%</span></a>' +
        '</div>' +
        '</div>' +

        '<div class="section"><div class="home-cols">' +
        '<div>' +
        '<div class="section-head"><span class="section-title">政策头条</span><a class="section-more" href="#/news">全部 ›</a></div>' +
        '<div class="card">' +
        topNews.map((n) =>
          '<a class="news-row" href="#/news/' + n.id + '">' +
          '<div class="news-main"><div class="news-title ellipsis">' + esc(n.title) + '</div>' +
          '<div class="news-meta"><span class="tag tag-brand">' + esc(n.category) + '</span>' + n.date + '</div></div>' +
          '<span class="row-arrow">›</span></a>'
        ).join('') +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div class="section-head"><span class="section-title">热门课程</span><a class="section-more" href="#/course">全部课程 ›</a></div>' +
        '<div class="card course-card">' + hot.map((c) => courseRow(c, true)).join('') + '</div>' +
        '</div>' +
        '</div></div>' +

        '<div class="section">' +
        '<div class="section-head"><span class="section-title">上岸喜报</span><span class="section-more">示例</span></div>' +
        '<div class="stories-scroll">' +
        stories.map((s) =>
          '<div class="story" style="border-left-color:' + s.color + '">' +
          '<div class="story-result" style="color:' + s.color + '">' + esc(s.result) + '</div>' +
          '<div class="story-quote">“' + esc(s.quote) + '”</div>' +
          '<div class="story-who">' + esc(s.name) + ' · ' + esc(s.tag) + '</div>' +
          '</div>'
        ).join('') +
        '</div>' +
        '</div>' +

        '<div class="demo-note">演示版本 · 页面内容均为示例 · 五站合一：PC / 手机站 / 公众号 / 小程序 / APP 数据互通</div>'
      );
    },
    after() {
      // 首次访问弹出「免费领资料」留资弹窗（对应方案 3.5）
      setTimeout(() => {
        if (A.Store.leadPopupDone()) return;
        if (location.hash !== '#/home' && location.hash !== '') return;
        const mask = document.createElement('div');
        mask.className = 'mask';
        mask.innerHTML =
          '<div class="lead-dialog" onclick="event.stopPropagation()">' +
          '<span class="lead-close" id="leadClose">×</span>' +
          '<div class="lead-kicker">免费领取</div>' +
          '<div class="lead-title">备考资料包</div>' +
          '<div class="lead-sub">历年真题 · 政策文件 · 高频讲义\n留下手机号，老师整理好发给你</div>' +
          '<div class="lead-tags"><span class="tag tag-good">历年真题</span><span class="tag tag-good">政策文件</span><span class="tag tag-good">高频讲义</span></div>' +
          '<input class="lead-input" id="leadPhone" type="number" maxlength="11" placeholder="输入手机号" />' +
          '<button class="btn btn-primary lead-btn" id="leadSubmit">免费领取</button>' +
          '<div class="lead-note">演示版：仅在本机记录留资线索</div>' +
          '</div>';
        mask.addEventListener('click', () => { mask.remove(); A.Store.setLeadPopupDone(); });
        document.body.appendChild(mask);
        mask.querySelector('#leadClose').addEventListener('click', () => { mask.remove(); A.Store.setLeadPopupDone(); });
        mask.querySelector('#leadSubmit').addEventListener('click', () => {
          const phone = mask.querySelector('#leadPhone').value.trim();
          if (!/^1\d{10}$/.test(phone)) { A.toast('请填写正确的手机号'); return; }
          A.Store.addSignup({ type: '资料领取', bname: '资料领取', name: '官网访客', phone, edu: '', time: '', note: '首页弹窗领取备考资料' });
          A.Store.setLeadPopupDone();
          mask.remove();
          A.toast('已记录，资料将发到你的手机');
        });
      }, 1500);
    }
  });

  // ============ 业务 ============
  A.route('business', {
    title: () => '业务板块',
    render() {
      return (
        '<div class="page-head"><div class="page-title">六大业务板块</div><div class="page-sub">每个板块独立建站，按各自业务逻辑展示内容</div></div>' +
        '<div class="section"><div class="biz-list">' +
        M.businesses.map((b) =>
          '<a class="biz-item" href="#/business/' + b.id + '">' +
          '<span class="mark" style="background:' + b.tint + ';color:' + b.color + '">' + b.char + '</span>' +
          '<div class="biz-item-main">' +
          '<div class="biz-item-name">' + esc(b.name) + '</div>' +
          '<div class="biz-item-sum">' + esc(b.summary) + '</div>' +
          '<div class="biz-item-tags">' + b.tags.map((t) => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' +
          '</div>' +
          '<span class="row-arrow">›</span>' +
          '</a>'
        ).join('') +
        '</div></div>'
      );
    }
  });

  A.route('business/:id', {
    title: (c) => M.businessById(c.id).name,
    render(c) {
      const b = M.businessById(c.id);
      const courses = M.courses.filter((x) => x.bid === b.id);
      const news = M.news.filter((n) => n.bid === b.id);
      const story = M.stories.find((s) => s.bid === b.id);
      return (
        '<div class="detail-head">' +
        '<div class="page-title">' + esc(b.name) + '</div>' +
        '<div class="detail-meta">' + esc(b.summary) + '</div>' +
        '<div style="margin-top:10px">' + b.tags.map((t) => '<span class="tag tag-brand">' + esc(t) + '</span>').join('') + '</div>' +
        '</div>' +
        '<div class="section"><div class="card">' +
        '<div class="block-label">适合谁</div><div class="block-text">' + esc(b.audience) + '</div>' +
        '<div class="block-label gap">我们怎么帮你</div><div class="block-text">' + esc(b.intro) + '</div>' +
        '<div class="block-label gap">服务内容</div>' +
        '<div class="offers">' + b.offers.map((o) => '<div class="offer"><span class="offer-dot" style="background:' + b.color + '"></span>' + esc(o) + '</div>').join('') + '</div>' +
        '</div></div>' +

        (courses.length
          ? '<div class="section"><div class="section-head"><span class="section-title">相关课程</span><a class="section-more" href="#/course">全部课程 ›</a></div>' +
          '<div class="card course-card">' + courses.map((x) => courseRow(x, true)).join('') + '</div></div>'
          : '') +

        (news.length
          ? '<div class="section"><div class="section-head"><span class="section-title">政策资讯</span></div><div class="card">' +
          news.map((n) =>
            '<a class="news-row" href="#/news/' + n.id + '">' +
            '<div class="news-main"><div class="news-title ellipsis">' + esc(n.title) + '</div>' +
            '<div class="news-meta">' + n.date + ' · ' + n.views + ' 阅读</div></div>' +
            '<span class="row-arrow">›</span></a>'
          ).join('') + '</div></div>'
          : '') +

        (story
          ? '<div class="section"><div class="section-head"><span class="section-title">上岸故事</span><span class="section-more">示例</span></div>' +
          '<div class="card" style="border-left:4px solid ' + b.color + '">' +
          '<div class="story-result" style="color:' + b.color + '">' + esc(story.result) + '</div>' +
          '<div class="story-quote">“' + esc(story.quote) + '”</div>' +
          '<div class="story-who">' + esc(story.name) + ' · ' + esc(story.tag) + '</div>' +
          '</div></div>'
          : '') +

        '<div class="bottom-space"></div>' +
        '<div class="bottom-bar"><div class="bottom-bar-in">' +
        '<a class="btn btn-line" style="flex:1" href="tel:19908883061">电话咨询</a>' +
        '<a class="btn btn-primary" style="flex:2" href="#/signup?bid=' + b.id + '">预约一对一规划</a>' +
        '</div></div>'
      );
    }
  });

  // ============ 课程 ============
  A.route('course', {
    title: () => '全部课程',
    render(c) {
      return (
        '<div class="page-head"><div class="page-title">全部课程</div>' +
        '<div class="page-sub">录播随报随学，直播按课表进行；报名后解锁全部章节</div></div>' +
        '<div class="section">' +
        '<div class="chips" id="courseChips">' +
        '<span class="chip on" data-bid="0">全部</span>' +
        M.businesses.map((b) => '<span class="chip" data-bid="' + b.id + '">' + esc(b.name) + '</span>').join('') +
        '</div>' +
        '<input class="input" id="courseSearch" placeholder="搜索课程，比如“专升本”" style="background:#fff;border-radius:12px;padding:0 16px;margin-bottom:14px;border:1px solid var(--line)" />' +
        '<div class="card course-card" id="courseList"></div>' +
        '</div>'
      );
    },
    after(c) {
      const listEl = document.getElementById('courseList');
      let bid = 0;
      let kw = '';
      const draw = () => {
        let list = M.courses.filter((x) => (!bid || x.bid === bid) && (!kw || x.title.indexOf(kw) > -1 || x.teacher.indexOf(kw) > -1));
        listEl.innerHTML = list.length
          ? list.map((x) => courseRow(x, true)).join('')
          : '<div class="empty"><div class="empty-title">没有找到相关课程</div>换个关键词试试</div>';
      };
      document.getElementById('courseChips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#courseChips .chip').forEach((x) => x.classList.remove('on'));
        chip.classList.add('on');
        bid = Number(chip.dataset.bid);
        draw();
      });
      document.getElementById('courseSearch').addEventListener('input', (e) => { kw = e.target.value.trim(); draw(); });
      if (c.focus) setTimeout(() => document.getElementById('courseSearch').focus(), 100);
      draw();
    }
  });

  // ============ 资讯 ============
  A.route('news', {
    title: () => '政策资讯',
    render() {
      return (
        '<div class="page-head"><div class="page-title">政策资讯</div><div class="page-sub">六大业务相关政策与考试动态（示例）</div></div>' +
        '<div class="section">' +
        '<div class="chips" id="newsChips"><span class="chip on" data-cat="">全部</span>' +
        ['成考', '自考', '专升本', '公考', '考研', '留学'].map((x) => '<span class="chip" data-cat="' + x + '">' + x + '</span>').join('') +
        '</div>' +
        '<div id="newsList"></div>' +
        '</div>'
      );
    },
    after() {
      const el = document.getElementById('newsList');
      let cat = '';
      const draw = () => {
        const list = M.news.filter((n) => !cat || n.category === cat);
        el.innerHTML = list.map((n) =>
          '<a class="card" style="display:block;margin-bottom:12px" href="#/news/' + n.id + '">' +
          '<div style="display:flex;gap:12px;align-items:flex-start">' +
          '<div style="flex:1;min-width:0">' +
          '<div class="news-title" style="font-size:16px;font-weight:600">' + esc(n.title) + '</div>' +
          '<div class="news-meta" style="margin-top:6px"><span class="tag tag-brand">' + esc(n.category) + '</span>' + n.date + ' · ' + n.views + ' 阅读</div>' +
          '<div class="clamp2" style="font-size:13px;color:var(--text-3);margin-top:8px">' + esc(n.summary) + '</div>' +
          '</div>' +
          '<span class="row-arrow">›</span>' +
          '</div></a>'
        ).join('');
      };
      document.getElementById('newsChips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#newsChips .chip').forEach((x) => x.classList.remove('on'));
        chip.classList.add('on');
        cat = chip.dataset.cat;
        draw();
      });
      draw();
    }
  });

  A.route('news/:id', {
    title: (c) => M.news.find((n) => n.id === Number(c.id)).title,
    render(c) {
      const n = M.news.find((x) => x.id === Number(c.id));
      return (
        '<div class="page-head">' +
        '<div class="detail-meta"><span class="tag tag-brand">' + esc(n.category) + '</span>' + n.date + ' · ' + n.views + ' 阅读</div>' +
        '<h1 class="detail-title" style="margin-top:10px">' + esc(n.title) + '</h1>' +
        '</div>' +
        '<div class="section"><div class="card">' +
        n.content.map((p) => '<p style="font-size:15px;line-height:1.9;margin-bottom:14px;color:var(--text-2)">' + esc(p) + '</p>').join('') +
        '</div>' +
        '<div class="card" style="margin-top:14px;display:flex;align-items:center;gap:14px">' +
        '<div style="flex:1;font-size:14px;color:var(--text-2)">对该政策有疑问？可预约老师免费解读</div>' +
        '<a class="btn btn-primary btn-sm" href="#/signup?bid=' + n.bid + '">预约解读</a>' +
        '</div></div>'
      );
    }
  });

  // ============ 师资 ============
  A.route('teachers', {
    title: () => '名师团队',
    render() {
      return (
        '<div class="page-head"><div class="page-title">名师团队</div><div class="page-sub">各业务主讲老师与授课方向（示例，正式版由学校提供）</div></div>' +
        '<div class="section">' +
        '<div class="chips" id="tChips"><span class="chip on" data-bid="0">全部</span>' +
        M.businesses.map((b) => '<span class="chip" data-bid="' + b.id + '">' + esc(b.name) + '</span>').join('') +
        '</div>' +
        '<div class="teacher-grid" id="tList"></div>' +
        '</div>' +
        '<div class="demo-note">师资信息为示例，正式版由学校提供真实师资介绍</div>'
      );
    },
    after() {
      const el = document.getElementById('tList');
      let bid = 0;
      const draw = () => {
        const list = M.teachers.filter((t) => !bid || t.bid === bid).map((t) => {
          const b = M.businessById(t.bid);
          return Object.assign({}, t, { bname: b.name, color: b.color, tint: b.tint });
        });
        el.innerHTML = list.map((t) =>
          '<div class="teacher" onclick="P.teacherDetail(' + t.id + ')">' +
          '<span class="t-avatar" style="background:' + t.tint + ';color:' + t.color + '">' + esc(t.name.slice(0, 1)) + '</span>' +
          '<div class="t-main">' +
          '<div class="t-head"><span class="t-name">' + esc(t.name) + '</span><span class="t-title">' + esc(t.title) + '</span></div>' +
          '<div class="t-meta num">' + t.years + ' 年教龄 · 累计学员 ' + t.students + '</div>' +
          '<div class="t-tags">' + t.tags.map((x) => '<span class="tag">' + esc(x) + '</span>').join('') + '</div>' +
          '<div style="margin-top:8px;font-size:12px;color:var(--text-3)">' + esc(t.bname) + ' · 查看详情 ›</div>' +
          '</div></div>'
        ).join('');
      };
      document.getElementById('tChips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#tChips .chip').forEach((x) => x.classList.remove('on'));
        chip.classList.add('on');
        bid = Number(chip.dataset.bid);
        draw();
      });
      draw();
    }
  });

  // ============ 学员评价 ============
  A.route('reviews', {
    title: () => '学员评价',
    render() {
      return (
        '<div class="page-head"><div class="page-title">学员评价</div><div class="page-sub">真实学员的学习反馈（示例，正式版经学员同意后展示）</div></div>' +
        '<div class="section">' +
        '<div class="chips" id="rChips"><span class="chip on" data-bid="0">全部</span>' +
        M.businesses.map((b) => '<span class="chip" data-bid="' + b.id + '">' + esc(b.name) + '</span>').join('') +
        '</div>' +
        '<div class="summary-card" id="rSummary"></div>' +
        '<div class="review-grid" id="rList" style="margin-top:14px"></div>' +
        '</div>' +
        '<div class="demo-note">评价为示例，正式版由后台审核后展示</div>'
      );
    },
    after() {
      const listEl = document.getElementById('rList');
      const sumEl = document.getElementById('rSummary');
      let bid = 0;
      const draw = () => {
        const all = M.reviews.filter((r) => !bid || r.bid === bid);
        const avg = all.length ? (all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1) : '0.0';
        const good = all.filter((r) => r.rating >= 4).length;
        sumEl.innerHTML =
          '<div class="summary-item"><span class="summary-num num">' + avg + '</span><span class="summary-k">平均评分</span></div>' +
          '<div class="summary-item"><span class="summary-num num">' + all.length + '</span><span class="summary-k">评价总数</span></div>' +
          '<div class="summary-item"><span class="summary-num num">' + (all.length ? Math.round((good / all.length) * 100) : 0) + '%</span><span class="summary-k">好评率</span></div>';
        listEl.innerHTML = all.map((r) => {
          const b = M.businessById(r.bid);
          return (
            '<div class="review">' +
            '<div class="r-head">' +
            '<span class="r-avatar" style="background:' + b.tint + ';color:' + b.color + '">' + esc(r.name.slice(0, 1)) + '</span>' +
            '<div class="r-main"><div class="r-name">' + esc(r.name) + '</div><div class="r-tag">' + esc(r.tag) + '</div></div>' +
            '<span class="stars">' + [1, 2, 3, 4, 5].map((i) => '<span class="' + (i <= r.rating ? 'on' : '') + '">★</span>').join('') + '</span>' +
            '</div>' +
            '<div class="r-course">' + esc(r.course) + '<span class="r-date num"> · ' + r.date + '</span></div>' +
            '<div class="r-content">' + esc(r.content) + '</div>' +
            '<div class="r-biz" style="color:' + b.color + '">' + esc(b.name) + '</div>' +
            '</div>'
          );
        }).join('');
      };
      document.getElementById('rChips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#rChips .chip').forEach((x) => x.classList.remove('on'));
        chip.classList.add('on');
        bid = Number(chip.dataset.bid);
        draw();
      });
      draw();
    }
  });

  // ============ 校区环境 ============
  A.route('campus', {
    title: () => '校区环境',
    render() {
      return (
        '<div class="page-head"><div class="page-title">校区环境</div><div class="page-sub">校区地址与功能区域（占位示意，正式版替换实景图片 / 视频）</div></div>' +
        '<div class="section">' +
        '<div class="chips" id="cChips">' +
        M.campus.map((x, i) => '<span class="chip' + (i === 0 ? ' on' : '') + '" data-i="' + i + '">' + esc(x.name) + '</span>').join('') +
        '</div>' +
        '<div id="cInfo"></div>' +
        '</div>'
      );
    },
    after() {
      const el = document.getElementById('cInfo');
      let idx = 0;
      const draw = () => {
        const c = M.campus[idx];
        el.innerHTML =
          '<div class="card">' +
          '<div class="biz-item-name" style="font-size:18px">' + esc(c.name) + '</div>' +
          '<div class="row"><span class="row-main"><span style="color:var(--text-3);font-size:13px">地址</span><br>' + esc(c.addr) + '</span></div>' +
          '<div class="row"><span class="row-main"><span style="color:var(--text-3);font-size:13px">电话</span><br><span class="num">' + c.phone + '</span></span></div>' +
          '<div style="display:flex;gap:12px;margin-top:14px">' +
          '<button class="btn btn-line" style="flex:1" onclick="A.toast(\'演示版：正式版打开地图导航\')">地图导航</button>' +
          '<a class="btn btn-primary" style="flex:1" href="tel:19908883061">电话咨询</a>' +
          '</div></div>' +
          '<div class="section-head" style="margin-top:20px"><span class="section-title">功能区域</span></div>' +
          '<div class="campus-areas">' +
          c.areas.map((a) =>
            '<div class="area-box" onclick="A.toast(\'演示版：正式版展示' + a + '实景\')">' +
            '<span class="area-ph">实景图待学校提供</span><span class="area-name">' + esc(a) + '</span></div>'
          ).join('') +
          '</div>';
      };
      document.getElementById('cChips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#cChips .chip').forEach((x) => x.classList.remove('on'));
        chip.classList.add('on');
        idx = Number(chip.dataset.i);
        draw();
      });
      draw();
    }
  });

  // ============ 备考资料 ============
  A.route('materials', {
    title: () => '备考资料',
    render() {
      return (
        '<div class="page-head"><div class="page-title">备考资料</div><div class="page-sub">历年真题 · 政策文件 · 讲义，五端同步更新</div></div>' +
        '<div class="section">' +
        '<div class="chips" id="mChips">' +
        ['全部', '历年真题', '政策文件', '讲义'].map((x, i) => '<span class="chip' + (i === 0 ? ' on' : '') + '" data-cat="' + x + '">' + x + '</span>').join('') +
        '</div>' +
        '<div class="card" id="mList"></div>' +
        '</div>' +
        '<div class="demo-note">演示版不产生真实文件；正式版由后台上传 PDF，按会员权限下载，五端同步</div>'
      );
    },
    after() {
      const el = document.getElementById('mList');
      let cat = '全部';
      const draw = () => {
        const dl = A.Store.downloads();
        const list = M.materials.filter((m) => cat === '全部' || m.cat === cat).map((m) => {
          const b = M.businessById(m.bid);
          return Object.assign({}, m, { bname: b.name, char: b.char, color: b.color, tint: b.tint, got: !!dl[m.id] });
        });
        el.innerHTML = list.map((m) =>
          '<div class="mat-row">' +
          '<span class="mark mark-sm" style="background:' + m.tint + ';color:' + m.color + '">' + m.char + '</span>' +
          '<div class="mat-main">' +
          '<div class="mat-name">' + esc(m.name) + '</div>' +
          '<div class="mat-meta"><span class="tag">' + esc(m.cat) + '</span>' + (m.member ? '<span class="tag tag-warm">学员专享</span>' : '') + '<span class="mat-size num">' + m.format + ' · ' + m.size + '</span></div>' +
          '</div>' +
          '<button class="mat-btn ' + (m.got ? 'got' : m.member ? 'lock' : '') + '" data-mid="' + m.id + '">' + (m.got ? '已下载' : m.member ? '登录下载' : '下载') + '</button>' +
          '</div>'
        ).join('');
      };
      document.getElementById('mChips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#mChips .chip').forEach((x) => x.classList.remove('on'));
        chip.classList.add('on');
        cat = chip.dataset.cat;
        draw();
      });
      // 下载按钮：优先走真实后端解锁资料，失败/离线回退本地记录（事件委托绑在容器上，重绘不失效）
      el.addEventListener('click', async (e) => {
        const btn = e.target.closest('.mat-btn');
        if (!btn) return;
        const id = Number(btn.dataset.mid);
        const m = M.materials.find((x) => x.id === id);
        if (!m) return;
        if (m.member && !A.Store.user()) {
          A.confirmDialog({ title: '学员专享资料', content: '这份资料仅对报名学员开放，登录后即可下载', confirmText: '去登录' }).then((ok) => {
            if (ok) location.hash = '#/login';
          });
          return;
        }
        try {
          if (window.YzSync && window.YzSync.online && window.API && window.API.downloadMaterial) {
            const r = await window.API.downloadMaterial(id);
            A.Store.addDownload(id);
            const url = r && r.fileUrl;
            A.toast(url ? ('资料已解锁：' + url) : '资料已解锁');
          } else {
            A.Store.addDownload(id);
            A.toast('离线演示：已记录下载 ' + m.name);
          }
        } catch (err) {
          A.Store.addDownload(id);
          A.toast('后端未连接，使用离线演示下载 ' + m.name);
        }
        draw();
      });
      draw();
    }
  });

  // ============ 关于我们 ============
  A.route('about', {
    title: () => '关于我们',
    render() {
      return (
        '<div class="page-head"><div class="page-title">关于我们</div>' +
        '<div class="page-sub">云南自修学校 · 成人学历提升 · 职业发展培训</div></div>' +
        '<div class="section"><div class="card">' +
        '<p style="font-size:15px;line-height:1.9;text-align:justify">云南自修学校立足云南，专注成人学历提升与职业发展培训，覆盖成人学历教育、自考助学、统招专升本、公考/事业单位、考研培训、出国留学六大业务，为在职人员、应往届毕业生和社会考生提供从学历提升到公职就业、考研深造的完整路径。办学多年，拥有丰富的教学资源和师资力量，累计帮助数千名学员成功上岸。</p>' +
        '</div></div>' +

        '<div class="section"><div class="section-head"><span class="section-title">六大业务</span></div>' +
        '<div class="card">' +
        M.businesses.map((b) =>
          '<a class="row" href="#/business/' + b.id + '">' +
          '<span class="mark mark-sm" style="background:' + b.tint + ';color:' + b.color + '">' + b.char + '</span>' +
          '<span class="row-main" style="margin-left:14px"><span class="biz-item-name">' + esc(b.name) + '</span><br><span class="biz-item-sum">' + esc(b.summary) + '</span></span>' +
          '<span class="row-arrow">›</span></a>'
        ).join('') +
        '</div></div>' +

        '<div class="section"><div class="section-head"><span class="section-title">了解更多</span></div>' +
        '<div class="card">' +
        '<a class="row" href="#/teachers"><span class="row-main">名师团队</span><span class="row-arrow">›</span></a>' +
        '<a class="row" href="#/reviews"><span class="row-main">学员评价</span><span class="row-arrow">›</span></a>' +
        '<a class="row" href="#/campus"><span class="row-main">校区环境</span><span class="row-arrow">›</span></a>' +
        '<a class="row" href="#/materials"><span class="row-main">备考资料</span><span class="row-arrow">›</span></a>' +
        '</div></div>' +

        '<div class="section"><div class="section-head"><span class="section-title">办学资质</span></div>' +
        '<div class="campus-areas">' +
        ['办学许可证', '营业执照', '合作院校授权书'].map((x) =>
          '<div class="area-box" style="height:110px;border-style:dashed" onclick="A.toast(\'正式版由学校提供资质文件\')">' +
          '<span class="area-ph">待学校提供</span><span class="area-name">' + esc(x) + '</span></div>'
        ).join('') +
        '</div></div>' +

        '<div class="section"><div class="card">' +
        '<div class="row"><span class="row-main"><span style="color:var(--text-3);font-size:13px">咨询热线</span><br><span class="num" style="font-size:20px;font-weight:700">199-0888-3061</span></span>' +
        '<a class="btn btn-primary btn-sm" href="tel:19908883061">拨打</a></div>' +
        '<div class="row"><span class="row-main"><span style="color:var(--text-3);font-size:13px">地址</span><br>昆明市五华区示例路 88 号 · 示例大厦 3-5 层</span></div>' +
        '</div></div>' +

        '<div class="demo-note">本页面为演示版本，资质、喜报、师资正式上线前须由学校提供真实材料</div>'
      );
    }
  });
})();
