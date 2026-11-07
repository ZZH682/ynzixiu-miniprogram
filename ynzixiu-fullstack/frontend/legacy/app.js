// 五站合一前端 SPA：真连后端（js/api.js），后端不可达时回退演示数据
// 视觉对齐「云南自修学校」微信小程序（设计令牌 / 卡片 / 字标 / 底部 Tab）
(function () {
  const API = window.API;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const app = $('#app');

  // ============ 本地状态 ============
  // 隐私模式 / file:// 下 localStorage 可能抛错，统一兜底
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 忽略 */ } }
  };
  const S = {
    token: store.get('yz_token') || null,
    user: JSON.parse(store.get('yz_user') || 'null'),
    role: store.get('yz_role') || null
  };
  function saveAuth(token, user, role) {
    S.token = token; S.user = user; S.role = role;
    store.set('yz_token', token || '');
    store.set('yz_user', user ? JSON.stringify(user) : '');
    store.set('yz_role', role || '');
    renderUser();
  }
  function renderUser() {
    const box = $('#userBox');
    if (S.user) box.innerHTML = '<span class="avatar-sm">' + esc((S.user.phone || '学')[0]) + '</span>';
    else box.textContent = '未登录';
  }

  // ============ 工具 ============
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 1800);
  }
  function guard(fn, fallback) {
    try { return fn(); } catch (e) { /* sync guard */ return fallback ? fallback() : null; }
  }
  function fmtYuan(fen) { return ((fen || 0) / 100).toFixed(0); }
  function go(h) { location.hash = h; }

  // ============ 业务/科目展示增强 ============
  const BIZ_CHAR = { 1: '成', 2: '自', 3: '专', 4: '公', 5: '考', 6: '留' };
  let BIZ_MAP = {};
  function bizOf(id) { return BIZ_MAP[id] || { color: '#2350D8', tint: '#EAF0FF', name: '课程', summary: '' }; }
  function enrichBiz(b) {
    return Object.assign({}, b, {
      char: BIZ_CHAR[b.id] || (b.name || '·')[0],
      color: b.color || '#2350D8',
      tint: b.tint || '#EAF0FF'
    });
  }
  function enrichCourse(c) {
    const b = bizOf(c.bid);
    return Object.assign({}, c, {
      tint: b.tint, color: b.color,
      char: BIZ_CHAR[c.bid] || '课',
      short: (c.title || '').slice(0, 6),
      typeText: (b.name || '课程').slice(0, 2),
      priceText: fmtYuan(c.price),
      origText: c.origPrice ? fmtYuan(c.origPrice) : ''
    });
  }
  function enrichSubject(s) {
    const b = bizOf(s.bid);
    return Object.assign({}, s, { char: (s.name || '科')[0], color: b.color, tint: b.tint });
  }

  // 硬编码科目（与后端种子 subjects 对齐）
  const SUBJECTS = [
    { sid: 1, name: '政治', bid: 1 }, { sid: 2, name: '英语', bid: 1 },
    { sid: 3, name: '行政管理学', bid: 2 }, { sid: 4, name: '法学概论', bid: 2 },
    { sid: 5, name: '大学英语', bid: 3 }, { sid: 6, name: '高等数学', bid: 3 },
    { sid: 7, name: '行测', bid: 4 }, { sid: 8, name: '申论', bid: 4 },
    { sid: 9, name: '考研政治', bid: 5 }, { sid: 10, name: '考研英语一', bid: 5 },
    { sid: 11, name: '雅思', bid: 6 }, { sid: 12, name: '托福', bid: 6 }
  ];

  const BANNERS = [
    { kicker: '限时报名', title: '2026 成人高考报名进行中', action: '立即咨询', theme: 'banner-brand' },
    { kicker: '免费规划', title: '一对一学历与升学诊断', action: '预约老师', theme: 'banner-ink' },
    { kicker: '直播课堂', title: '公考名师真题精讲开课', action: '进入直播', theme: 'banner-teal' }
  ];
  const MARKET = [
    { name: '领券中心', char: '券', tint: '#EAF0FF', color: '#2350D8' },
    { name: '拼团', char: '拼', tint: '#E6F5EC', color: '#1F8A55' },
    { name: '邀请有礼', char: '邀', tint: '#FDF1E4', color: '#B4570F' },
    { name: '分享海报', char: '海', tint: '#EAF0FF', color: '#17359A' }
  ];

  // ============ 路由 ============
  function router() {
    const hash = location.hash.replace(/^#/, '') || '/';
    // tab 高亮 + 图标切换
    document.querySelectorAll('#tabs a').forEach(a => {
      const r = a.dataset.route;
      const active = (r === '/' && hash === '/') || (r !== '/' && hash.startsWith(r));
      a.classList.toggle('active', active);
      const img = a.querySelector('img');
      if (img) img.src = active ? img.dataset.on : img.dataset.off;
    });

    if (hash.startsWith('/business/')) return viewBizCourses(+hash.split('/')[2]);
    if (hash.startsWith('/course/')) return viewCourse(+hash.split('/')[2]);
    if (hash.startsWith('/quiz/practice')) return viewPractice();
    if (hash === '/quiz/error') return viewErrorBook();
    if (hash === '/quiz') return viewQuiz();
    if (hash === '/exam') return viewExamPicker();
    if (hash === '/me') return viewMe();
    if (hash === '/signup') return viewSignup();
    if (hash === '/admin') return viewAdmin();
    if (hash.startsWith('/business')) return viewBusiness();
    return viewHome();
  }
  window.addEventListener('hashchange', router);

  function courseRow(c) {
    c = enrichCourse(c);
    return `<div class="course-row" data-id="${c.id}">
      <div class="cover" style="background:${c.tint};color:${c.color}">
        <span class="cover-char">${esc(c.char)}</span>
        <span class="cover-type">${esc(c.typeText)}</span>
        <span class="cover-name">${esc(c.short)}</span>
      </div>
      <div class="course-row-main">
        <div class="course-row-title clamp2">${esc(c.title)}</div>
        <div class="course-row-meta">${esc(c.teacher || '')} · ${c.sales || 0} 人已报名</div>
        <div class="course-row-foot">
          <span class="price"><span class="price-unit">¥</span>${c.priceText}</span>
          ${c.origText ? `<span class="price-orig">¥${c.origText}</span>` : ''}
          ${c.owned ? `<span class="tag tag-good">已购买</span>` : ''}
        </div>
      </div>
    </div>`;
  }

  // ============ 首页 ============
  async function viewHome() {
    app.innerHTML = '<div class="card">加载中…</div>';
    let biz = [], news = [], courses = [], stories = [];
    try { biz = await API.businesses() || []; } catch (e) { biz = DEMO.biz; toast('后端未连接，演示数据'); }
    try { news = await API.news() || []; } catch (e) { news = DEMO.news; }
    try { courses = await API.courses() || []; } catch (e) { courses = DEMO.courses; }
    try { stories = await API.stories() || []; } catch (e) { stories = DEMO.stories; }
    biz.forEach(b => BIZ_MAP[b.id] = b);

    const banners = BANNERS.map(b => `<div class="banner ${b.theme}">
      <span class="banner-kicker">${b.kicker}</span>
      <span class="banner-title">${b.title}</span>
      <span class="banner-action">${b.action} →</span></div>`).join('');

    const markets = MARKET.map(m => `<div class="market" data-m="${esc(m.name)}">
      <div class="mark mark-sm" style="background:${m.tint};color:${m.color}">${m.char}</div>
      <span class="market-name">${m.name}</span></div>`).join('');

    app.innerHTML =
      `<div class="top">
        <div class="brand-row"><div class="logo">自修</div><span class="brand-name">云南自修学校</span></div>
        <div class="hero">
          <span class="hero-title">从学历提升到上岸，一路有老师带着走</span>
          <span class="hero-sub">成人学历 · 自考 · 专升本 · 公考 · 考研 · 留学</span>
        </div>
        <div class="search"><span class="search-icon"></span>搜索课程，比如“专升本”</div>
      </div>
      <div class="banners">${banners}</div>
      <div class="section">
        <div class="section-head"><span class="section-title">六大业务</span></div>
        <div class="biz-grid">
          ${biz.map(b => { b = enrichBiz(b); return `<div class="biz" data-id="${b.id}">
            <div class="mark" style="background:${b.tint};color:${b.color}">${esc(b.char)}</div>
            <span class="biz-name">${esc(b.name)}</span></div>`; }).join('')}
        </div>
      </div>
      <div class="section">
        <div class="section-head"><span class="section-title">政策头条</span><span class="section-more" data-g="#/business">全部 ›</span></div>
        <div class="card">
          ${news.slice(0, 4).map(n => `<div class="news-row"><div class="news-main">
            <div class="news-title ellipsis">${esc(n.title)}</div>
            <div class="news-meta"><span class="tag tag-brand">${esc(n.category || '资讯')}</span>${esc(n.date || '')}</div>
          </div><span class="row-arrow">›</span></div>`).join('') || '<div class="empty">暂无资讯</div>'}
        </div>
      </div>
      <div class="section">
        <div class="section-head"><span class="section-title">热门课程</span><span class="section-more" data-g="#/business">全部课程 ›</span></div>
        <div class="card">
          ${courses.slice(0, 4).map(c => courseRow(c)).join('') || '<div class="empty">暂无课程</div>'}
        </div>
      </div>
      <div class="section">
        <div class="section-head"><span class="section-title">营销活动</span></div>
        <div class="market-grid">${markets}</div>
      </div>
      <div class="section">
        <div class="section-head"><span class="section-title">上岸喜报</span><span class="section-more">示例</span></div>
      </div>
      <div class="stories">
        ${stories.map(s => `<div class="story">
          <div class="story-result" style="color:${esc(s.color || 'var(--good)')}">${esc(s.result || '成功上岸')}</div>
          <div class="story-quote">“${esc(s.quote || '')}”</div>
          <div class="story-who">${esc(s.name || '')} · ${esc(s.tag || '')}</div>
        </div>`).join('')}<div style="display:inline-block;width:6px"></div>
      </div>
      <div class="footer">
        <div class="footer-name">云南自修学校</div>
        <div class="footer-line">咨询热线 400-888-0000</div>
        <div class="footer-link">关于我们 · 办学资质 ›</div>
      </div>`;

    app.querySelectorAll('.biz').forEach(el => el.onclick = () => go('#/business/' + el.dataset.id));
    app.querySelectorAll('[data-g]').forEach(el => el.onclick = () => go(el.dataset.g));
    app.querySelectorAll('.market').forEach(el => el.onclick = () => toast('演示功能：' + el.dataset.m));
    app.querySelectorAll('.course-row').forEach(el => el.onclick = () => go('#/course/' + el.dataset.id));
  }

  // ============ 业务列表（tab）============
  async function viewBusiness() {
    app.innerHTML = '<div class="card">加载中…</div>';
    let biz = [];
    try { biz = await API.businesses() || []; } catch (e) { biz = DEMO.biz; }
    biz.forEach(b => BIZ_MAP[b.id] = b);
    app.innerHTML =
      `<div class="intro">
        <span class="intro-title">不确定走哪条路？</span>
        <span class="intro-sub">先看看每个方向适合谁，再约老师一对一聊。</span>
      </div>
      <div class="list">
        ${biz.map(b => { b = enrichBiz(b); return `<div class="item" data-id="${b.id}">
          <div class="item-head">
            <div class="mark" style="background:${b.tint};color:${b.color}">${esc(b.char)}</div>
            <div class="item-main">
              <div class="item-name">${esc(b.name)}</div>
              <div class="item-summary">${esc(b.summary || '')}</div>
            </div>
            <span class="row-arrow">›</span>
          </div>
          <div class="item-foot">
            <span class="tag tag-brand">${esc((b.name || '').slice(0, 2))}</span>
            <span class="item-count">查看课程 ›</span>
          </div>
        </div>`; }).join('')}
      </div>
      <div class="help">
        <div class="help-text">
          <div class="help-title">免费学历与升学规划</div>
          <div class="help-sub">留下联系方式，老师 1 个工作日内回电</div>
        </div>
        <div class="btn btn-primary btn-sm" id="helpSignup">预约</div>
      </div>
      <div class="demo-note">演示版本 · 内容为示例</div>`;
    app.querySelectorAll('.item').forEach(el => el.onclick = () => go('#/business/' + el.dataset.id));
    $('#helpSignup').onclick = () => go('#/signup');
  }

  // ============ 板块课程 ============
  async function viewBizCourses(bid) {
    app.innerHTML = '<div class="card">加载中…</div>';
    let biz = []; try { biz = await API.businesses() || []; } catch (e) { biz = DEMO.biz; }
    biz.forEach(b => BIZ_MAP[b.id] = b);
    let courses = [], materials = [];
    try { courses = await API.courses(bid) || []; } catch (e) { courses = DEMO.courses.filter(c => c.bid === bid); }
    try { materials = await API.materials(bid) || []; } catch (e) { materials = []; }
    const b = biz.find(x => x.id === bid) || { name: '板块' };

    app.innerHTML =
      `<div class="intro">
        <span class="intro-title">${esc(b.name)}</span>
        <span class="intro-sub">${esc(b.summary || '精选课程与备考资料')}</span>
      </div>
      <div class="section" style="margin-bottom:12px">
        <div class="section-head"><span class="section-title">课程</span></div>
        <div class="card">
          ${courses.length ? courses.map(c => courseRow(c)).join('') : '<div class="empty">该板块暂无课程</div>'}
        </div>
      </div>
      ${materials.length ? `<div class="section" style="margin-bottom:12px">
        <div class="section-head"><span class="section-title">备考资料</span></div>
        <div class="card">
          ${materials.map(m => `<div class="row">
            <div class="row-main">
              <div style="font-weight:600">${esc(m.name)}</div>
              <div class="news-meta">${esc(m.format || '')}${m.member ? ' · 会员专享' : ''} · ${m.downloads || 0} 次下载</div>
            </div>
            <button class="btn btn-ghost btn-sm" data-dl="${m.id}">下载</button>
          </div>`).join('')}
        </div>
      </div>` : ''}
      <div class="help">
        <div class="help-text"><div class="help-title">想了解适合你的方案？</div><div class="help-sub">预约老师，获取一对一规划</div></div>
        <div class="btn btn-primary btn-sm" id="bizSignup">预约</div>
      </div>`;
    app.querySelectorAll('.course-row').forEach(el => el.onclick = () => go('#/course/' + el.dataset.id));
    app.querySelectorAll('[data-dl]').forEach(btn => btn.onclick = async () => {
      try { const r = await API.downloadMaterial(+btn.dataset.dl); toast('开始下载：' + (r.fileUrl || '')); }
      catch (e) { toast(e.message || '下载失败'); }
    });
    const bs = $('#bizSignup'); if (bs) bs.onclick = () => go('#/signup');
  }

  // ============ 课程详情 + 报名支付 ============
  async function viewCourse(id) {
    app.innerHTML = '<div class="card">加载中…</div>';
    let course, chap = { chapters: [] };
    try { course = await API.course(id); } catch (e) { course = DEMO.courses.find(c => c.id === id); }
    try { chap = await API.chapters(id) || {}; } catch (e) { chap = { chapters: [] }; }
    if (course) BIZ_MAP[course.bid] = BIZ_MAP[course.bid] || {};
    const c = enrichCourse(course || {});
    app.innerHTML =
      `<div class="section" style="margin-bottom:12px">
        <div class="card">
          <div class="cover" style="width:100%;height:120px;margin-bottom:12px;background:${c.tint};color:${c.color}">
            <span class="cover-char">${esc(c.char)}</span>
            <span class="cover-type">${esc(c.typeText)}</span>
            <span class="cover-name" style="font-size:18px">${esc(c.title)}</span>
          </div>
          <div style="font-weight:700;font-size:18px">${esc(c.title)}</div>
          <div class="price" style="margin:6px 0"><span class="price-unit">¥</span>${c.priceText} ${c.origText ? `<span class="price-orig">¥${c.origText}</span>` : ''}</div>
          <div class="news-meta">${esc(c.teacher || '')} · 已学 ${c.sales || 0} 人</div>
        </div>
      </div>
      <div class="section" style="margin-bottom:12px">
        <div class="section-head"><span class="section-title">课程章节</span></div>
        <div class="card">
          ${(chap.chapters || []).map(ch => `<div class="row">
            <div class="row-main"><div style="font-weight:600">${esc(ch.title)}</div><div class="news-meta">${esc(ch.dur || '')}${ch.trial ? ' · 试听' : ''}</div></div>
            ${ch.unlocked ? '<span class="tag tag-good">可看</span>' : '<span class="tag tag-bad">需报名</span>'}
          </div>`).join('') || '<div class="empty">暂无章节</div>'}
        </div>
      </div>
      <button class="btn btn-primary block" id="enrollBtn" style="margin:0 16px 24px;width:calc(100% - 32px)">立即报名 ¥${c.priceText}</button>`;
    const eb = $('#enrollBtn'); if (eb) eb.onclick = () => enroll(course);
  }

  async function enroll(course) {
    if (!S.token) { return openLogin(() => enroll(course)); }
    try {
      const order = await API.createOrder({ courseId: course.id, plan: 'full', requestId: 'r' + Date.now() });
      const pay = await API.pay(order.orderNo);
      toast('报名成功！收据号 ' + (pay.receiptNo || ''));
      go('#/me');
    } catch (e) { toast(e.message || '报名失败'); }
  }

  // ============ 刷题 tab ============
  async function viewQuiz() {
    app.innerHTML = '<div class="card">加载中…</div>';
    let wrong = 0, done = 0, rate = 0;
    if (S.token) {
      try {
        const list = await API.errorBook() || []; wrong = list.length;
        const recs = await API.examRecords() || []; done = recs.reduce((a, r) => a + (r.total || 0), 0);
      } catch (e) { }
    }
    let biz = []; try { biz = await API.businesses() || []; } catch (e) { biz = DEMO.biz; }
    biz.forEach(b => BIZ_MAP[b.id] = b);

    app.innerHTML =
      `<div class="stats">
        <div class="stat"><span class="stat-num num">${done}</span><span class="stat-k">累计做题</span></div>
        <div class="stat"><span class="stat-num num">${rate}<span class="stat-unit">%</span></span><span class="stat-k">正确率</span></div>
        <div class="stat"><span class="stat-num num">${wrong}</span><span class="stat-k">错题</span></div>
      </div>
      <div class="entries">
        <div class="entry entry-mock" data-g="#/exam"><span class="entry-title">综合模考</span><span class="entry-sub">20 题 · 限时模拟</span><span class="entry-go">开始 →</span></div>
        <div class="entry entry-err" data-g="#/quiz/error"><span class="entry-title">错题本</span><span class="entry-sub">${wrong ? wrong + ' 道待复习' : '答错的题自动收进来'}</span><span class="entry-go">查看 →</span></div>
      </div>
      <div class="section">
        <div class="section-head"><span class="section-title">分科练习</span></div>
        <div class="card" style="padding-top:0;padding-bottom:0">
          ${SUBJECTS.map(s => { s = enrichSubject(s); return `<div class="row" data-sid="${s.sid}">
            <div class="mark mark-sm" style="background:${s.tint};color:${s.color}">${esc(s.char)}</div>
            <div class="row-main sub-main"><div class="sub-name">${esc(s.name)}</div><div class="sub-meta">${esc(bizOf(s.bid).name || '')}</div></div>
            <span class="row-arrow">›</span></div>`; }).join('')}
        </div>
      </div>
      <div class="demo-note">演示题库 · 正式版支持后台批量导入题目</div>`;
    app.querySelectorAll('[data-g]').forEach(el => el.onclick = () => go(el.dataset.g));
    app.querySelectorAll('[data-sid]').forEach(el => el.onclick = () => go('#/quiz/practice?sid=' + el.dataset.sid));
  }

  async function viewPractice() {
    const sid = +new URLSearchParams(location.hash.split('?')[1] || '').get('sid') || 1;
    app.innerHTML = '<div class="card">加载中…</div>';
    let list = [];
    try { list = await API.questions(sid, 1, 50) || []; } catch (e) { toast('后端未连接'); list = []; }
    if (!list.length) { app.innerHTML = '<div class="empty"><div class="empty-title">暂无题目</div>该科目还没有题目</div>'; return; }
    let idx = 0, rightCnt = 0, wrongCnt = 0;
    function render() {
      const q = list[idx];
      const opts = String(q.opts || '').split('|').map(o => o.trim()).filter(Boolean);
      app.innerHTML =
        `<div class="news-meta" style="padding:12px 16px 0">第 ${idx + 1}/${list.length} 题 · 正确 ${rightCnt} / 错 ${wrongCnt}</div>
        <div class="card">
          <div style="font-weight:600;margin-bottom:8px">${esc(q.stem)}</div>
          ${opts.map(o => `<div class="opt" data-opt="${esc(o[0])}"><span class="opt-key">${esc(o[0])}</span>${esc(o.replace(/^[A-Za-z][.、．:：]?\s*/, ''))}</div>`).join('')}
          <div id="fb"></div>
          <button class="btn btn-primary block" id="nextBtn" disabled style="margin-top:10px">下一题</button>
        </div>`;
      const sel = new Set();
      app.querySelectorAll('.opt').forEach(el => el.onclick = () => {
        if ($('#fb').dataset.done) return;
        const ch = el.dataset.opt;
        if (sel.has(ch)) { sel.delete(ch); el.classList.remove('sel'); }
        else { sel.add(ch); el.classList.add('sel'); }
        $('#nextBtn').disabled = sel.size === 0;
        $('#nextBtn').onclick = () => submit(q, [...sel].sort().join(''));
      });
    }
    async function submit(q, chosen) {
      const fb = $('#fb'); fb.dataset.done = '1';
      try {
        const r = await API.submitAnswer(q.id, chosen);
        rightCnt += r.correct ? 1 : 0; wrongCnt += r.correct ? 0 : 1;
        app.querySelectorAll('.opt').forEach(el => {
          const ok = (r.answer || '').includes(el.dataset.opt);
          const pick = (chosen || '').includes(el.dataset.opt);
          if (ok) el.classList.add('ok'); else if (pick) el.classList.add('bad');
        });
        fb.innerHTML = `<div class="news-meta" style="margin-top:8px">${r.correct ? '✅ 回答正确' : '❌ 正确答案：' + esc(r.answer)}<br>${esc(r.analysis || '')}</div>`;
        const nb = $('#nextBtn'); nb.textContent = idx + 1 < list.length ? '下一题' : '完成';
        nb.disabled = false; nb.onclick = () => { idx++; idx < list.length ? render() : go('#/quiz'); };
      } catch (e) { toast(e.message || '提交失败'); }
    }
    render();
  }

  // ============ 模考 ============
  function viewExamPicker() {
    app.innerHTML =
      `<div class="intro"><span class="intro-title">选择模考科目</span><span class="intro-sub">综合 20 题，交卷后出分并自动收录错题。</span></div>
      <div class="section" style="margin-bottom:12px"><div class="chips" style="padding:0 16px">
        ${SUBJECTS.map(s => `<span class="chip" data-sid="${s.sid}">${esc(s.name)}</span>`).join('')}
      </div></div>
      <div class="demo-note">点击下方科目开始模考</div>`;
    app.querySelectorAll('.chip').forEach(el => el.onclick = () => startExam(+el.dataset.sid));
  }
  async function startExam(sid) {
    app.innerHTML = '<div class="card">加载中…</div>';
    let exam;
    try { exam = await API.startExam(sid, 20) || {}; } catch (e) { toast('后端未连接'); return; }
    const qs = exam.questions || [];
    if (!qs.length) { app.innerHTML = '<div class="empty"><div class="empty-title">暂无题目</div>该科目还没有题目</div>'; return; }
    const answers = {};
    function render(i) {
      const q = qs[i];
      const opts = String(q.opts || '').split('|').map(o => o.trim()).filter(Boolean);
      app.innerHTML = `<div class="news-meta" style="padding:12px 16px 0">模考 ${i + 1}/${qs.length}</div>
        <div class="card"><div style="font-weight:600;margin-bottom:8px">${esc(q.stem)}</div>
        ${opts.map(o => `<div class="opt" data-opt="${esc(o[0])}"><span class="opt-key">${esc(o[0])}</span>${esc(o.replace(/^[A-Za-z][.、．:：]?\s*/, ''))}</div>`).join('')}</div>`;
      app.querySelectorAll('.opt').forEach(el => el.onclick = () => {
        const ch = el.dataset.opt; answers[q.id] = ch;
        app.querySelectorAll('.opt').forEach(x => x.classList.remove('sel'));
        el.classList.add('sel');
        const nx = document.createElement('button'); nx.className = 'btn btn-primary block'; nx.textContent = i + 1 < qs.length ? '下一题' : '交卷';
        nx.style.margin = '10px 16px 24px'; nx.style.width = 'calc(100% - 32px)';
        nx.onclick = () => { i + 1 < qs.length ? render(i + 1) : submit(); };
        const old = $('#submitWrap'); if (old) old.remove();
        nx.id = 'submitWrap'; app.appendChild(nx);
      });
    }
    async function submit() {
      try {
        const r = await API.submitExam({ sid, duration: 0, answers });
        app.innerHTML = `<div class="card" style="text-align:center;margin-top:24px">
          <div style="font-size:40px;font-weight:800;color:var(--brand)">${r.score}分</div>
          <div class="news-meta">正确 ${r.right} / 共 ${r.total} · 错题 ${r.wrong}</div>
          <button class="btn btn-primary block" id="toMe" style="margin-top:14px">查看记录</button></div>`;
        $('#toMe').onclick = () => go('#/me');
      } catch (e) { toast(e.message || '交卷失败'); }
    }
    render(0);
  }

  async function viewErrorBook() {
    app.innerHTML = '<div class="card">加载中…</div>';
    if (!S.token) return openLogin(viewErrorBook);
    let list = [];
    try { list = await API.errorBook() || []; } catch (e) { toast(e.message || '加载失败'); }
    app.innerHTML = `<div class="section" style="margin-bottom:12px"><div class="section-head"><span class="section-title">我的错题本（${list.length}）</span></div>
      <div class="card">
        ${list.length ? list.map(e => `<div style="padding:10px 0;border-bottom:1px solid var(--line)">
          <div style="font-weight:600">${esc(e.stem)}</div>
          <div class="news-meta">你选：${esc(e.lastChosen || '-')} · 答错 ${e.wrongCount || 1} 次 · 正确：${esc(e.answer || '')}</div>
        </div>`).join('') : '<div class="empty">暂无错题，继续保持！</div>'}
      </div></div>
      <div class="demo-note"><span style="color:var(--brand)" onclick="location.hash='#/quiz'">返回刷题</span></div>`;
  }

  // ============ 我的 ============
  async function viewMe() {
    if (!S.token) return openLogin(viewMe);
    let orders = [], exams = [], signups = [];
    try { orders = await API.myOrders() || []; } catch (e) { orders = []; }
    try { exams = await API.examRecords() || []; } catch (e) { exams = []; }
    try { signups = await API.mySignups() || []; } catch (e) { signups = []; }
    let wrong = 0; try { wrong = (await API.errorBook() || []).length; } catch (e) { }

    app.innerHTML =
      `<div class="m-head" id="meHead">
        <div class="m-avatar">${esc((S.user.phone || '学')[0])}</div>
        <div class="m-main"><div class="m-name">学员 ${esc(S.user.phone || '')}</div><div class="m-sub">欢迎回来</div></div>
        <span class="m-arrow">›</span>
      </div>
      <div class="counts">
        <div class="count" data-g="#/me"><span class="count-num num">${orders.length}</span><span class="count-k">我的订单</span></div>
        <div class="count"><span class="count-num num">${signups.length}</span><span class="count-k">我的预约</span></div>
        <div class="count" data-g="#/quiz/error"><span class="count-num num">${wrong}</span><span class="count-k">错题</span></div>
      </div>
      <div class="card menu">
        <div class="row" data-g="#/me"><span class="row-main">我的订单</span><span class="row-arrow">›</span></div>
        <div class="row" data-g="#/signup"><span class="row-main">我的预约</span><span class="row-arrow">›</span></div>
        <div class="row" data-g="#/quiz/error"><span class="row-main">错题本</span><span class="row-arrow">›</span></div>
      </div>
      <div class="section" style="margin-bottom:12px"><div class="section-head"><span class="section-title">我的订单</span></div>
        <div class="card">
          ${orders.length ? orders.map(o => `<div class="row"><div class="row-main"><div style="font-weight:600">订单 ${esc(o.orderNo)}</div><div class="news-meta">${esc(o.status)} · ¥${fmtYuan(o.amount)}</div></div><span class="tag tag-brand">${esc(o.receiptNo || '-')}</span></div>`).join('') : '<div class="empty">还没有订单，去首页报名吧</div>'}
        </div>
      </div>
      <div class="section" style="margin-bottom:12px"><div class="section-head"><span class="section-title">模考记录</span></div>
        <div class="card">
          ${exams.length ? exams.map(e => `<div class="row"><div class="row-main">模考 #${e.id}</div><div class="news-meta">得分 ${e.right}/${e.total}</div></div>`).join('') : '<div class="empty">暂无模考记录</div>'}
        </div>
      </div>
      ${S.role === 'admin' ? `<div class="card menu"><div class="row" data-g="#/admin"><span class="row-main">管理端</span><span class="row-arrow">›</span></div></div>` : ''}
      <div class="demo-note">演示版本 · 数据仅保存在本机</div>`;
    app.querySelectorAll('[data-g]').forEach(el => el.onclick = () => go(el.dataset.g));
    const mh = $('#meHead'); if (mh) mh.onclick = () => openLogin(viewMe);
  }

  // ============ 预约留资 ============
  function viewSignup() {
    const map = {}; (DEMO.biz).forEach(b => map[b.id] = b.name);
    app.innerHTML =
      `<div class="intro"><span class="intro-title">预约咨询 / 留资</span><span class="intro-sub">留下信息，老师会尽快联系你。</span></div>
      <div class="section" style="margin-bottom:12px"><div class="card">
        <div class="field"><div class="field-label">你的称呼<span class="req">*</span></div><input class="input" id="s_name" placeholder="如：张先生"></div>
        <div class="field"><div class="field-label">手机号<span class="req">*</span></div><input class="input" id="s_phone" placeholder="11 位手机号"></div>
        <div class="field"><div class="field-label">意向板块</div>
          <select class="input" id="s_bid">${Object.keys(map).map(id => `<option value="${id}">${esc(map[id])}</option>`).join('')}</select></div>
        <div class="field"><div class="field-label">想咨询的内容</div><textarea class="input" id="s_note" placeholder="如：想了解成考报名条件"></textarea></div>
        <button class="btn btn-primary block" id="s_btn" style="margin-top:8px">提交预约</button>
      </div></div>`;
    $('#s_btn').onclick = async () => {
      const payload = { name: $('#s_name').value, phone: $('#s_phone').value, bid: +$('#s_bid').value, source: 'h5', note: $('#s_note').value };
      try { await API.submitSignup(payload); toast('提交成功，顾问会尽快联系你'); go('#/me'); }
      catch (e) { toast(e.message || '提交失败'); }
    };
  }

  // ============ 管理端 ============
  async function viewAdmin() {
    if (!S.token || S.role !== 'admin') return openAdminLogin();
    app.innerHTML = '<div class="card">加载中…</div>';
    let stats = [], signups = [];
    try { stats = await API.adminStatsBusiness() || []; } catch (e) { stats = []; }
    try { signups = await API.adminSignups({}) || []; } catch (e) { signups = []; }
    app.innerHTML =
      `<div class="intro"><span class="intro-title">管理端</span><span class="intro-sub">分板块营收与招生线索。</span></div>
      <div class="section" style="margin-bottom:12px"><div class="section-head"><span class="section-title">分板块营收</span></div>
        <div class="card">
          ${stats.map(s => `<div class="row"><div class="row-main"><b>${esc(s.name)}</b></div><div class="news-meta">¥${fmtYuan(s.revenue)} · 订单${s.orders} · 退费率${s.refundRate || 0}%</div></div>`).join('') || '<div class="empty">暂无数据</div>'}
        </div>
      </div>
      <div class="section" style="margin-bottom:12px"><div class="section-head"><span class="section-title">招生线索</span></div>
        <div class="card">
          ${signups.length ? signups.map(s => `<div class="row" style="padding:8px 0"><div class="row-main"><div>${esc(s.name)} · ${esc(s.phone)}</div><div class="news-meta">${esc(s.source)} · ${esc(s.status)}</div></div><select class="input" data-id="${s.id}" style="width:auto">${['new', 'contacted', 'enrolled', 'invalid'].map(st => `<option ${s.status === st ? 'selected' : ''}>${st}</option>`).join('')}</select></div>`).join('') : '<div class="empty">暂无线索</div>'}
        </div>
      </div>
      <div class="row-btn" style="padding:0 16px">
        <button class="btn btn-primary" id="expOrders">导出订单CSV</button>
        <button class="btn btn-ghost" id="expSignups">导出线索CSV</button>
      </div>
      <div class="demo-note"><span style="color:var(--brand)" onclick="location.hash='#/me'">返回</span></div>`;
    app.querySelectorAll('select[data-id]').forEach(sel => sel.onchange = async () => {
      try { await API.adminUpdateSignup(+sel.dataset.id, sel.value); toast('已更新'); } catch (e) { toast(e.message || '失败'); }
    });
    $('#expOrders').onclick = () => downloadCsv(API.exportOrdersCsv(), 'orders.csv');
    $('#expSignups').onclick = () => downloadCsv(API.exportSignupsCsv({}), 'signups.csv');
  }
  async function downloadCsv(promise, name) {
    try { const csv = await promise; const bom = /^﻿/.test(csv) ? '' : '﻿'; const blob = new Blob([bom + csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); toast('已导出 ' + name); }
    catch (e) { toast('导出失败'); }
  }
  function openAdminLogin() {
    app.innerHTML = '<div class="card"><h3 style="margin-top:0">管理端登录</h3>' +
      '<div class="field"><div class="field-label">管理员手机号</div><input class="input" id="a_phone" value="13900000000"></div>' +
      '<div class="field"><div class="field-label">密码</div><input class="input" id="a_pwd" value="123456"></div>' +
      '<button class="btn btn-primary block" id="a_btn" style="margin-top:8px">登录</button>' +
      '<div class="demo-note"><span style="color:var(--brand)" onclick="location.hash=\'#/me\'">返回</span></div></div>';
    $('#a_btn').onclick = async () => {
      try {
        const r = await API.adminLogin($('#a_phone').value, $('#a_pwd').value);
        saveAuth(r.token, { phone: $('#a_phone').value }, 'admin');
        go('#/admin');
      } catch (e) { toast(e.message || '登录失败'); }
    };
  }

  // ============ 登录弹窗（学员）============
  function openLogin(after) {
    const mask = document.createElement('div'); mask.className = 'modal-mask';
    mask.innerHTML = '<div class="modal"><h3>登录 / 注册</h3>' +
      '<div class="field"><div class="field-label">手机号</div><input class="input" id="l_phone" placeholder="11 位手机号"></div>' +
      '<button class="btn btn-primary block" id="l_code" style="margin:8px 0">获取验证码</button>' +
      '<div class="field"><div class="field-label">验证码（演示：123456）</div><input class="input" id="l_vcode" placeholder="6 位验证码"></div>' +
      '<button class="btn btn-primary block" id="l_ok">登录</button></div>';
    document.body.appendChild(mask);
    $('#l_code').onclick = async () => {
      try { const r = await API.sendSms($('#l_phone').value); toast('验证码已发送' + (r.devCode ? '：' + r.devCode : '')); }
      catch (e) { toast(e.message || '发送失败'); }
    };
    $('#l_ok').onclick = async () => {
      try {
        const r = await API.login($('#l_phone').value, $('#l_vcode').value);
        saveAuth(r.token, { phone: $('#l_phone').value, nickname: r.nickname, balance: r.balance }, r.role || 'user');
        mask.remove(); toast('登录成功'); (after || router)();
      } catch (e) { toast(e.message || '登录失败'); }
    };
  }

  // ============ 演示数据兜底 ============
  const DEMO = {
    biz: [
      { id: 1, name: '成人学历教育', color: '#2350D8', tint: '#EAF0FF', summary: '成考/国开/远程' },
      { id: 2, name: '自考助学', color: '#16C2A3', tint: '#E6F5EC', summary: '大小自考辅导' },
      { id: 3, name: '统招专升本', color: '#7C5CFF', tint: '#F1ECFF', summary: '专升本集训' },
      { id: 4, name: '公考/事业单位', color: '#E5522A', tint: '#FDEEE6', summary: '省考国考' },
      { id: 5, name: '考研培训', color: '#F0971C', tint: '#FDF1E4', summary: '考研规划' },
      { id: 6, name: '出国留学', color: '#0AA1DD', tint: '#E6F5FB', summary: '多国联申' }
    ],
    news: [{ title: '2026年成人高考报名公告发布', date: '2026-03-01', category: '政策' }],
    stories: [{ name: '刘同学', result: '已被昆明理工大学录取', quote: '政治一次过线！', tag: '成考学员', color: '#1F8A55' }],
    courses: [
      { id: 1, bid: 1, title: '2026春季成人高考专科精讲班', price: 680000, origPrice: 980000, teacher: '王老师', sales: 328 },
      { id: 2, bid: 2, title: '自考本科行政管理VIP班', price: 1280000, origPrice: 1580000, teacher: '李老师', sales: 156 },
      { id: 4, bid: 4, title: '教师资格证笔试冲刺班', price: 380000, origPrice: 580000, teacher: '张老师', sales: 89 }
    ]
  };

  // 悬浮咨询
  const fab = $('#fab'); if (fab) fab.onclick = () => go('#/signup');

  renderUser();
  router();
})();
