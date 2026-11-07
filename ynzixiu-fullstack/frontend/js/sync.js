// 前后端数据同步层：把后端「真实数据」灌进 window.MOCK 与 Store，页面渲染逻辑保持不变。
// - 后端在线：内容一次拉取（/content/catalog），登录后同步学员全链路数据（/portal/me）
// - 后端不可达：完整保留本地静态数据 + localStorage，页面仍可离线演示
// - 金额统一：数据库以「分」存储，本层换算成「元」再交给页面
(function () {
  const M = window.MOCK;
  const App = window.App;
  const S = App && App.Store;
  const API = window.API;

  const YzSync = { online: false, catalogReady: false, meReady: false };
  window.YzSync = YzSync;

  // ===== 通用工具 =====
  const yuan = (fen) => Math.round((Number(fen) || 0) / 100);
  const fen = (y) => Math.round((Number(y) || 0) * 100);
  const pipe = (v) => {
    if (Array.isArray(v)) return v;
    if (v == null || v === '') return null;
    const out = String(v).split('|').map((s) => s.trim()).filter(Boolean);
    return out.length ? out : null;
  };
  const opts = (v) => {
    if (Array.isArray(v)) return v;
    if (!v) return [];
    return String(v).split('|')
      .map((s) => s.trim().replace(/^[A-Da-d][.．、:：]\s*/, ''))
      .filter(Boolean);
  };
  const ts = (v) => {
    if (!v) return Date.now();
    if (typeof v === 'number') return v;
    const t = new Date(String(v).replace('T', ' ').replace(/-/g, '/')).getTime();
    return isNaN(t) ? Date.now() : t;
  };
  const compact = (o) => {
    Object.keys(o).forEach((k) => {
      if (o[k] === null || o[k] === undefined || o[k] === '') delete o[k];
    });
    return o;
  };
  // 按 id 合并：后端字段覆盖静态数据，静态数据补齐后端没给的展示字段；后端新增记录追加
  function mergeById(mockList, rows, mapFn) {
    if (!Array.isArray(rows) || !rows.length) return mockList;
    const mapped = rows.map(mapFn).map(compact);
    const idx = {};
    mapped.forEach((r) => { idx[String(r.id)] = r; });
    const seen = {};
    const out = (mockList || []).map((m) => {
      seen[String(m.id)] = 1;
      const b = idx[String(m.id)];
      return b ? Object.assign({}, m, b) : m;
    });
    mapped.forEach((r) => { if (!seen[String(r.id)]) out.push(Object.assign({}, r)); });
    return out;
  }
  const courseById = (id) => (M.courses || []).find((c) => c.id === Number(id)) || null;
  const bname = (bid) => {
    const b = (M.businesses || []).find((x) => x.id === Number(bid));
    return b ? b.name : '待确定';
  };

  // ===== 内容映射 =====
  function chaptersByCourse(rows) {
    const map = {};
    (rows || []).forEach((ch) => {
      const key = String(ch.courseId);
      (map[key] = map[key] || []).push({
        id: ch.id, backendId: ch.id,
        title: ch.title || ('第 ' + (map[key].length + 1) + ' 节'),
        dur: ch.dur || '00:00',
        trial: !!Number(ch.trial || 0),
        videoUrl: ch.videoUrl || ''
      });
    });
    Object.keys(map).forEach((k) => map[k].sort((a, b) => (a.backendId || 0) - (b.backendId || 0)));
    return map;
  }

  function applyCatalog(c) {
    const chMap = chaptersByCourse(c.chapters);
    const c2 = (v) => {
      if (v == null) return v;
      if (typeof v === 'string') return v;
      // H2 的 CLOB 在部分驱动下会返回对象，做一次兜底
      return String(v);
    };

    M.businesses = mergeById(M.businesses, c.businesses, (b) => compact({
      id: b.id, code: b.code, name: b.name,
      char: b.char || b._char || null,
      color: b.color, tint: b.tint, summary: b.summary,
      tags: pipe(b.tags), audience: c2(b.audience), intro: c2(b.intro), offers: pipe(b.offers)
    }));

    M.courses = mergeById(M.courses, c.courses, (x) => compact({
      id: x.id, bid: x.bid, title: x.title,
      short: x.short || x._short || null,
      type: x.type,
      price: x.price == null ? null : yuan(x.price),
      orig: x.origPrice == null ? null : yuan(x.origPrice),
      teacher: x.teacher, teacherNote: x.teacherNote, sales: x.sales,
      intro: c2(x.intro), highlights: pipe(x.highlights),
      chapters: chMap[String(x.id)] && chMap[String(x.id)].length ? chMap[String(x.id)] : null
    }));

    M.news = mergeById(M.news, c.news, (n) => compact({
      id: n.id, bid: n.bid, category: n.category,
      top: n.top == null ? null : !!Number(n.top),
      date: n.date, views: n.views, title: n.title, summary: n.summary,
      content: n.content ? [c2(n.content)] : null
    }));
    M.teachers = mergeById(M.teachers, c.teachers, (t) => compact({
      id: t.id, bid: t.bid, name: t.name, title: t.title,
      years: t.years, students: t.students, tags: pipe(t.tags), intro: c2(t.intro)
    }));
    M.reviews = mergeById(M.reviews, c.reviews, (r) => compact({
      id: r.id, bid: r.bid, name: r.name, tag: r.tag, course: r.course,
      rating: r.rating, date: r.date, content: c2(r.content)
    }));
    M.campus = mergeById(M.campus, c.campus, (x) => compact({
      id: x.id, name: x.name, addr: x.addr, phone: x.phone,
      areas: pipe(x.areas), lat: x.lat, lng: x.lng
    }));
    M.materials = mergeById(M.materials, c.materials, (m) => compact({
      id: m.id, bid: m.bid, name: m.name, cat: m.cat, format: m.format,
      size: m.size, member: m.member == null ? null : !!Number(m.member),
      fileUrl: m.fileUrl, downloads: m.downloads
    }));
    M.stories = mergeById(M.stories, c.stories, (s) => compact({
      id: s.id, name: s.name, bid: s.bid, tag: s.tag, result: s.result, quote: s.quote
    }));

    // 科目 / 题库 / 轮播 / 优惠券 / 拼团规则以数据库为唯一来源
    if (Array.isArray(c.subjects) && c.subjects.length) {
      M.subjects = c.subjects.map((s) => ({ id: s.id, bid: s.bid, name: s.name }));
    }
    if (Array.isArray(c.questions) && c.questions.length) {
      M.questions = c.questions.map((q) => ({
        id: q.id, sid: q.sid, stem: q.stem, opts: opts(q.opts),
        answer: q.answer, analysis: q.analysis
      }));
    }
    if (Array.isArray(c.banners) && c.banners.length) {
      M.banners = c.banners.map((b) => {
        // 种子数据里 to_url 可能存的是占位图路径，只有 # 开头才是可跳转的站内路由
        const raw = b.toUrl || b.to || '';
        return {
          id: b.id, kicker: b.kicker, title: b.title, action: b.action,
          to: raw.charAt(0) === '#' ? raw : '#/home', theme: b.theme || 'ink'
        };
      });
    }
    if (Array.isArray(c.coupons) && c.coupons.length) {
      M.coupons = c.coupons.map((q) => ({
        id: 'Q' + q.id, backendId: q.id, bid: q.bid, name: q.name,
        amount: yuan(q.amount), min: yuan(q.minSpend), days: q.days, stock: q.stock
      }));
    }
    if (Array.isArray(c.groupRules) && c.groupRules.length) {
      const rules = c.groupRules.map((r) => ({
        courseId: r.courseId, size: r.size, price: yuan(r.price),
        hours: r.hours, ruleId: r.id
      }));
      const idx = {};
      rules.forEach((r) => { idx[String(r.courseId)] = r; });
      const seen = {};
      M.groupBuys = (M.groupBuys || []).map((g) => {
        seen[String(g.courseId)] = 1;
        return idx[String(g.courseId)] ? Object.assign({}, g, idx[String(g.courseId)]) : g;
      });
      rules.forEach((r) => { if (!seen[String(r.courseId)]) M.groupBuys.push(Object.assign({}, r)); });
    }
    if (Array.isArray(c.openGroups) && c.openGroups.length) {
      M.openGroups = c.openGroups.map((g) => ({
        id: g.groupNo || ('G' + g.id), backendId: g.id,
        courseId: g.courseId, leader: '同学', joined: g.joined || 1,
        leftMin: g.expiresAt ? Math.max(1, Math.round((ts(g.expiresAt) - Date.now()) / 60000)) : 720
      }));
    }
    YzSync.settings = {};
    (c.settings || []).forEach((row) => {
      const k = row.K || row.k;
      const v = row.V || row.v;
      if (k) YzSync.settings[String(k)] = v == null ? '' : String(v);
    });
  }

  // ===== 学员数据映射 =====
  function orderStatus(status, groupId) {
    if (status === 'paid') return 'paid';
    if (status === 'part_paid') return 'balance';
    if (status === 'unpaid' && groupId) return 'group';
    if (status === 'unpaid') return 'unpaid';
    return status || 'unpaid';
  }
  const signupStatusCn = {
    new: '待回访', contacted: '已联系', followed: '跟进中',
    converted: '已报名', closed: '已关闭'
  };

  function applyMe(m) {
    if (!S) return;
    const user = S.user() || {};
    const receipts = {};
    (m.receipts || []).forEach((r) => { receipts[r.orderNo] = r.receiptNo; });

    S.replace('orders', (m.orders || []).map((o) => {
      const c = courseById(o.courseId);
      const amount = yuan(o.amount);
      const listPrice = c ? (c.orig || c.price || amount) : amount;
      return {
        id: o.orderNo, courseId: o.courseId,
        title: c ? c.title : ('课程 ' + o.courseId),
        phone: user.phone || '', listPrice,
        discount: Math.max(0, listPrice - amount),
        amount, paid: yuan(o.paid),
        status: orderStatus(o.status, o.groupId),
        plan: o.plan === 'installment' ? 'split' : 'full',
        pay: 'wechat', couponId: '',
        receiptNo: receipts[o.orderNo] || ('R' + o.orderNo),
        createdAt: ts(o.createdAt),
        group: o.groupId ? {
          size: 3, members: [String(user.phone || '我').slice(-1)],
          createdAt: ts(o.createdAt), hours: 24
        } : null
      };
    }));

    S.replace('signups', (m.signups || []).map((s) => ({
      id: 'S' + s.id, type: '预约', bid: s.bid, bname: bname(s.bid),
      name: s.name, phone: s.phone, edu: '', time: '', note: s.note,
      status: signupStatusCn[s.status] || s.status || '待回访',
      createdAt: ts(s.createdAt)
    })));

    const records = [];
    (m.quizRecords || []).forEach((r) => records.push({
      at: ts(r.createdAt), mode: '分科练习', title: '在线练习',
      right: Number(r.correct) === 1 ? 1 : 0, total: 1
    }));
    (m.examRecords || []).forEach((r) => records.push({
      at: ts(r.createdAt), mode: '综合模考', title: '模考',
      right: r.right || 0, total: r.total || 0
    }));
    records.sort((a, b) => b.at - a.at);
    S.replace('records', records.slice(0, 50));

    const wrong = {};
    (m.errorBook || []).forEach((b) => {
      if (b.questionId != null) wrong[b.questionId] = { chosen: b.lastChosen || '', at: Date.now() };
    });
    S.replace('wrong', wrong);

    const study = {};
    (m.studyProgress || []).forEach((p) => {
      const c = courseById(p.courseId);
      if (!c) return;
      const idx = (c.chapters || []).findIndex((ch) => ch.backendId === p.chapterId);
      if (idx < 0) return;
      const list = study[p.courseId] || [];
      if (list.indexOf(idx) === -1) list.push(idx);
      study[p.courseId] = list;
    });
    S.replace('study', study);

    const downloads = {};
    (m.downloads || []).forEach((d) => { downloads[d.materialId] = ts(d.createdAt); });
    S.replace('downloads', downloads);

    S.replace('coupons', (m.couponClaims || []).map((c) => ({
      tid: 'Q' + c.couponId, claimId: c.id,
      claimedAt: ts(c.claimedAt), orderId: c.orderId || ''
    })));

    S.replace('referrals', (m.referrals || []).map((r) => ({
      id: 'R' + r.id,
      name: r.refereePhone ? String(r.refereePhone).replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') : '好友',
      course: '课程推荐', paid: yuan(r.amount), level: r.level || 1,
      status: r.status === 'settled' ? 'paid' : 'lead',
      date: new Date(ts(r.createdAt)).toISOString().slice(0, 10)
    })));

    S.replace('withdrawn', (m.withdraws || []).reduce((a, w) => a + yuan(w.amount), 0));
    if (m.referralStats) {
      S.replace('promo', {
        shares: m.referralStats.total || 0,
        visits: (m.referralStats.total || 0) * 3,
        leads: m.referralStats.settled || 0
      });
    }
    if (m.user) {
      S.replaceUser({
        userId: m.user.id, nickname: m.user.nickname, role: m.user.role,
        balance: m.user.balance, inviteCode: m.user.inviteCode
      });
    }
  }

  // ===== 对外方法 =====
  YzSync.hydrateCatalog = async function () {
    if (!API) return false;
    try {
      const c = await API.catalog();
      if (!c) return false;
      applyCatalog(c);
      YzSync.online = true;
      YzSync.catalogReady = true;
      if (App) App.render();
      return true;
    } catch (e) {
      YzSync.online = false;
      console.info('[sync] 后端不可达，保留本地演示数据：' + (e && e.message));
      return false;
    }
  };

  YzSync.hydrateMe = async function (opt) {
    if (!API || !S || !S.user()) return false;
    try {
      const m = await API.me();
      applyMe(m || {});
      YzSync.meReady = true;
      if (!opt || opt.render !== false) App.render();
      return true;
    } catch (e) {
      console.info('[sync] 学员数据同步失败：' + (e && e.message));
      return false;
    }
  };

  // 写操作统一入口：后端失败时执行本地降级，页面始终有响应
  YzSync.write = async function (apiCall, fallback, okMsg) {
    try {
      const r = await apiCall();
      YzSync.online = true;
      if (okMsg) App.toast(okMsg);
      await YzSync.hydrateMe({ render: false });
      return { ok: true, data: r };
    } catch (e) {
      if (fallback) fallback(e);
      else App.toast((e && e.message) || '操作失败，请稍后重试');
      return { ok: false, error: e };
    }
  };

  YzSync.fen = fen;
  YzSync.yuan = yuan;

  function boot() {
    YzSync.hydrateCatalog().then((ok) => {
      if (ok && S && S.user()) YzSync.hydrateMe();
      document.dispatchEvent(new CustomEvent('yz:sync-ready', { detail: { online: ok } }));
    });
    document.addEventListener('yz:login', () => { YzSync.hydrateMe(); });
    document.addEventListener('yz:logout', () => { YzSync.meReady = false; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
