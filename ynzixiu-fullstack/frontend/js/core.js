// 云南自修学校 · H5 核心：路由 / 本地状态 / 响应式外壳
// 与小程序演示版同源：演示数据在本机 localStorage，正式版把 Store 换成接口请求
(function () {
  const M = window.MOCK;
  const LS = {
    get(k, d) {
      try {
        const v = localStorage.getItem('yz_' + k);
        return v === null ? d : JSON.parse(v);
      } catch (e) { return d; }
    },
    set(k, v) { try { localStorage.setItem('yz_' + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem('yz_' + k); } catch (e) {} }
  };

  // —— 本地状态（代替后端）——
  const Store = {
    user: () => LS.get('user', null),
    // 兼容两种调用：login(phone) 走本地演示；login({phone, token, userId, nickname, role}) 保存真实后端用户
    login(u) {
      if (typeof u === 'string') u = { phone: u, since: Date.now() };
      LS.set('user', u);
      if (u && u.token) { try { localStorage.setItem('yz_token', u.token); } catch (e) {} }
      return u;
    },
    logout() {
      LS.del('user');
      try { localStorage.removeItem('yz_token'); } catch (e) {}
      try { document.dispatchEvent(new CustomEvent('yz:logout')); } catch (e) {}
    },
    // 供 sync.js 把后端返回的数据整批写回本地缓存（离线演示/弱网下的即时渲染层）
    replace(k, v) { LS.set(k, v); },
    replaceUser(u) { LS.set('user', Object.assign({}, Store.user() || {}, u)); },

    signups: () => LS.get('signups', []),
    addSignup(d) {
      const list = LS.get('signups', []);
      const item = Object.assign({ id: 'S' + Date.now(), createdAt: Date.now(), status: '待回访' }, d);
      list.unshift(item); LS.set('signups', list); return item;
    },

    orders: () => LS.get('orders', []),
    order: (id) => LS.get('orders', []).find((o) => o.id === id),
    addOrder(d) {
      const list = LS.get('orders', []);
      const item = Object.assign({ id: 'YZ' + Date.now(), receiptNo: 'R' + Date.now(), createdAt: Date.now() }, d);
      list.unshift(item); LS.set('orders', list); return item;
    },
    payBalance(id) {
      const list = LS.get('orders', []);
      const o = list.find((x) => x.id === id);
      if (o) { o.paid = o.amount; o.status = 'paid'; o.balancePaidAt = Date.now(); }
      LS.set('orders', list); return o;
    },
    // 只有已付清 / 分期在学的订单才算已购；unpaid / group 不能解锁课程
    ownedIds: () => LS.get('orders', [])
      .filter((o) => o.status === 'paid' || o.status === 'balance' || o.status === 'part_paid')
      .map((o) => o.courseId),
    pendingGroup: (courseId) => LS.get('orders', []).find((o) => o.courseId === courseId && o.status === 'group'),
    joinGroup(id, initial) {
      const list = LS.get('orders', []);
      const o = list.find((x) => x.id === id);
      if (o && o.status === 'group') {
        o.group.members.push(initial);
        if (o.group.members.length >= o.group.size) { o.status = 'paid'; o.group.doneAt = Date.now(); }
      }
      LS.set('orders', list); return o;
    },

    coupons: () => LS.get('coupons', []),
    claimCoupon(tid) {
      const list = LS.get('coupons', []);
      if (list.some((m) => m.tid === tid)) return false;
      list.unshift({ tid, claimedAt: Date.now(), orderId: '' });
      LS.set('coupons', list); return true;
    },
    useCoupon(tid, orderId) {
      const list = LS.get('coupons', []);
      const m = list.find((x) => x.tid === tid);
      if (m) m.orderId = orderId;
      LS.set('coupons', list);
    },

    referrals: () => LS.get('referrals', null) || M.referralSeed.slice(),
    addReferral(r) {
      const list = Store.referrals();
      list.unshift(Object.assign({ id: 'R' + Date.now(), at: Date.now() }, r));
      LS.set('referrals', list); return list;
    },
    withdrawn: () => LS.get('withdrawn', 0),
    withdraw(a) { LS.set('withdrawn', LS.get('withdrawn', 0) + a); },
    promo: () => LS.get('promo', null) || Object.assign({}, M.promoSeed),

    records: () => LS.get('records', []),
    addRecord(r) {
      const list = LS.get('records', []);
      list.unshift(Object.assign({ at: Date.now() }, r));
      LS.set('records', list.slice(0, 50));
    },
    wrong: () => LS.get('wrong', {}),
    addWrong(qid, chosen) {
      const map = LS.get('wrong', {});
      map[qid] = { chosen, at: Date.now() };
      LS.set('wrong', map);
    },
    removeWrong(qid) {
      const map = LS.get('wrong', {});
      delete map[qid];
      LS.set('wrong', map);
    },

    study: () => LS.get('study', {}),
    markChapter(courseId, idx) {
      const map = LS.get('study', {});
      const done = map[courseId] || [];
      if (done.indexOf(idx) === -1) done.push(idx);
      map[courseId] = done;
      LS.set('study', map); return done;
    },

    downloads: () => LS.get('downloads', {}),
    addDownload(mid) {
      const map = LS.get('downloads', {});
      map[mid] = Date.now();
      LS.set('downloads', map);
    },
    downloadedCount() { return Object.keys(LS.get('downloads', {})).length; },

    leadPopupDone: () => LS.get('leadPopup', false),
    setLeadPopupDone() { LS.set('leadPopup', true); },

    inviter: () => LS.get('inviter', ''),
    setInviter(code) { if (code && !LS.get('inviter', '')) LS.set('inviter', code); },

    remind: () => LS.get('remind', false),
    setRemind(v) { LS.set('remind', v); },

    resetAll() {
      ['user', 'signups', 'orders', 'records', 'wrong', 'study', 'coupons', 'referrals', 'withdrawn', 'downloads', 'leadPopup', 'inviter', 'remind', 'promo'].forEach((k) => LS.del(k));
    }
  };

  // —— 格式化 ——
  const fmt = {
    price(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); },
    time(ts) {
      const d = new Date(ts);
      const p = (n) => (n < 10 ? '0' + n : '' + n);
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    },
    maskPhone(p) { return p ? String(p).replace(/^(\d{3})\d{4}(\d{4})$/, '$1 **** $2') : ''; },
    clock(sec) { const p = (n) => (n < 10 ? '0' + n : '' + n); return p(Math.floor(sec / 60)) + ':' + p(sec % 60); }
  };

  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // 课程卡片字段加工
  function courseCard(c) {
    const b = M.businessById(c.bid);
    return Object.assign({}, c, {
      priceText: fmt.price(c.price),
      origText: fmt.price(c.orig),
      typeText: c.type === 'live' ? '直播课' : '录播课',
      bname: b.name,
      char: b.char,
      color: b.color,
      tint: b.tint
    });
  }

  // —— 营销计算（与小程序 utils/promo.js 同规则）——
  const DAY = 24 * 3600 * 1000;
  const groupFor = (courseId) => M.groupBuys.find((g) => g.courseId === Number(courseId));
  function groupCard(courseId) {
    const g = groupFor(courseId);
    if (!g) return null;
    const c = M.courseById(g.courseId);
    return Object.assign({}, g, {
      priceText: fmt.price(g.price),
      save: c.price - g.price,
      saveText: fmt.price(c.price - g.price)
    });
  }
  const couponById = (id) => M.coupons.find((q) => q.id === id);
  const fits = (q, bid) => q.bid === 0 || q.bid === Number(bid);
  function couponCard(q) {
    const b = q.bid ? M.businessById(q.bid) : null;
    return Object.assign({}, q, {
      amountText: fmt.price(q.amount),
      minText: fmt.price(q.min),
      scopeText: b ? b.name : '全场通用',
      color: b ? b.color : '#E5522A'
    });
  }
  function myCoupons() {
    const now = Date.now();
    return Store.coupons().map((m) => {
      const q = couponById(m.tid);
      if (!q) return null;
      const expireAt = m.claimedAt + q.days * DAY;
      const state = m.orderId ? 'used' : expireAt < now ? 'expired' : 'ok';
      return Object.assign(couponCard(q), { state, expireText: fmt.time(expireAt).slice(0, 10) });
    }).filter(Boolean).sort((a, b) => (a.state === 'ok' ? 0 : 1) - (b.state === 'ok' ? 0 : 1));
  }
  const usableCoupons = (bid, price) => myCoupons()
    .filter((q) => q.state === 'ok' && fits(q, bid) && price >= q.min)
    .sort((a, b) => b.amount - a.amount);
  const bestCouponFor = (bid, price) => {
    const list = M.coupons.filter((q) => fits(q, bid) && price >= q.min).sort((a, b) => b.amount - a.amount);
    return list.length ? couponCard(list[0]) : null;
  };
  const inviteCode = (phone) => 'YZ' + String(phone).slice(-6);
  const rewardOf = (paid, level) => Math.round(paid * (level === 2 ? M.referralRule.rate2 : M.referralRule.rate1));

  // —— 路由 ——
  const routes = {};
  function route(pattern, handler) { routes[pattern] = handler; }

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '') || 'home';
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const query = {};
    (qs || '').split('&').filter(Boolean).forEach((kv) => {
      const i = kv.indexOf('=');
      query[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1));
    });
    return { parts, query, path: '/' + parts.join('/') };
  }

  function matchRoute(parts) {
    const keys = Object.keys(routes);
    for (const pat of keys) {
      const pp = pat.split('/').filter(Boolean);
      if (pp.length !== parts.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < pp.length; i++) {
        if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(parts[i]);
        else if (pp[i] !== parts[i]) { ok = false; break; }
      }
      if (ok) return { handler: routes[pat], params };
    }
    return null;
  }

  // —— 布局：PC 顶栏 + 移动端底 tab ——
  const NAV = [
    { t: '首页', h: '#/home' },
    { t: '业务', h: '#/business' },
    { t: '课程', h: '#/course' },
    { t: '题库', h: '#/quiz' },
    { t: '资讯', h: '#/news' },
    { t: '师资', h: '#/teachers' },
    { t: '关于我们', h: '#/about' }
  ];
  const TABS = [
    { t: '首页', h: '#/home', icon: '⌂' },
    { t: '业务', h: '#/business', icon: '▦' },
    { t: '刷题', h: '#/quiz', icon: '✎' },
    { t: '我的', h: '#/mine', icon: '☺' }
  ];

  function shell(content, ctx) {
    const user = Store.user();
    const isPC = window.innerWidth >= 900;
    const navHtml = NAV.map((n) =>
      '<a class="nav-a' + (ctx.path === n.h.replace('#', '') ? ' on' : '') + '" href="' + n.h + '">' + n.t + '</a>'
    ).join('');
    const header =
      '<header class="pc-header">' +
      '<div class="wrap header-in">' +
      '<a class="brand" href="#/home"><span class="brand-logo">自修</span><span class="brand-name">云南自修学校</span></a>' +
      '<nav class="nav">' + navHtml + '</nav>' +
      '<div class="header-right">' +
      '<a class="header-svc" href="#/service">在线客服</a>' +
      '<a class="header-tel num" href="tel:19908883061">199-0888-3061</a>' +
      (user
        ? '<a class="header-user" href="#/mine">' + fmt.maskPhone(user.phone) + '</a>'
        : '<a class="btn btn-primary btn-sm" href="#/login">登录 / 注册</a>') +
      '</div>' +
      '</div>' +
      '</header>';

    const topbar =
      '<div class="m-top">' +
      '<a class="m-brand" href="#/home"><span class="brand-logo">自修</span><span class="brand-name">云南自修学校</span></a>' +
      '<div class="m-top-right">' +
      '<a class="m-top-btn" href="#/service">客服</a>' +
      '<a class="m-top-tel num" href="tel:19908883061">电话</a>' +
      '</div>' +
      '</div>';

    const active = (h) => (ctx.path === h.replace('#', '') ? ' on' : '');
    const tabbar =
      '<nav class="tabbar">' +
      TABS.map((t) =>
        '<a class="tab' + active(t.h) + '" href="' + t.h + '"><span class="tab-icon">' + t.icon + '</span><span class="tab-t">' + t.t + '</span></a>'
      ).join('') +
      '</nav>';

    const footer =
      '<footer class="footer">' +
      '<div class="wrap footer-in">' +
      '<div class="footer-col">' +
      '<div class="footer-brand">云南自修学校</div>' +
      '<div class="footer-line">成人学历提升 · 职业发展培训</div>' +
      '<div class="footer-line">昆明市五华区示例路 88 号</div>' +
      '</div>' +
      '<div class="footer-col">' +
      '<div class="footer-t">业务板块</div>' +
      M.businesses.map((b) => '<a class="footer-link" href="#/business/' + b.id + '">' + esc(b.name) + '</a>').join('') +
      '</div>' +
      '<div class="footer-col">' +
      '<div class="footer-t">学习与服务</div>' +
      '<a class="footer-link" href="#/course">全部课程</a>' +
      '<a class="footer-link" href="#/quiz">在线题库</a>' +
      '<a class="footer-link" href="#/materials">备考资料</a>' +
      '<a class="footer-link" href="#/teachers">名师团队</a>' +
      '</div>' +
      '<div class="footer-col">' +
      '<div class="footer-t">联系我们</div>' +
      '<a class="footer-link num" href="tel:19908883061">咨询热线 199-0888-3061</a>' +
      '<a class="footer-link" href="#/service">在线客服</a>' +
      '<a class="footer-link" href="#/about">关于我们 · 办学资质</a>' +
      '</div>' +
      '</div>' +
      '<div class="footer-bar">© 云南自修学校 · 五站合一演示版（PC / 手机站 / 公众号 / 小程序 / APP 数据互通）' +
      (window.YzSync ? (window.YzSync.online ? ' · 数据已连接后端' : ' · 离线演示模式') : '') + '</div>' +
      '</footer>';

    return header + topbar + '<main class="main' + (isPC ? '' : ' main-m') + '">' + content + '</main>' + (isPC ? footer : tabbar) +
      '<div class="toast" id="toast"></div>' +
      '<div class="fab"><a class="fab-tel" href="tel:19908883061">电话咨询</a><a class="fab-svc" href="#/service">客服</a></div>';
  }

  // —— 渲染 ——
  let afterHooks = [];
  function render() {
    const ctx = parseHash();
    const m = matchRoute(ctx.parts);
    const app = document.getElementById('app');
    afterHooks = [];
    let content;
    let pageCtx = ctx;
    if (m) {
      pageCtx = Object.assign({}, ctx, m.params);
      content = m.handler.render(pageCtx) || '';
      if (m.handler.after) afterHooks.push(m.handler.after);
    } else {
      content = '<div class="wrap empty-page"><div class="empty-title">页面不存在</div><a class="btn btn-ghost" href="#/home">回首页</a></div>';
    }
    app.innerHTML = shell(content, ctx);
    document.title = (m && m.handler.title ? m.handler.title(pageCtx) + ' · ' : '') + '云南自修学校';
    afterHooks.forEach((fn) => { try { fn(pageCtx); } catch (e) { console.error(e); } });
    window.scrollTo(0, 0);
  }

  // —— 工具 ——
  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
  }

  function confirmDialog(opt) {
    return new Promise((resolve) => {
      const mask = document.createElement('div');
      mask.className = 'mask';
      mask.innerHTML =
        '<div class="dialog" onclick="event.stopPropagation()">' +
        '<div class="dialog-title">' + esc(opt.title || '提示') + '</div>' +
        '<div class="dialog-body">' + esc(opt.content || '') + '</div>' +
        '<div class="dialog-btns">' +
        '<button class="dialog-btn" data-a="0">' + esc(opt.cancelText || '取消') + '</button>' +
        '<button class="dialog-btn primary" data-a="1">' + esc(opt.confirmText || '确定') + '</button>' +
        '</div></div>';
      mask.addEventListener('click', () => { mask.remove(); resolve(false); });
      mask.querySelectorAll('.dialog-btn').forEach((b) => {
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          mask.remove();
          resolve(b.dataset.a === '1');
        });
      });
      document.body.appendChild(mask);
    });
  }

  // 简易弹层（详情 / 表单）
  function openSheet(html) {
    const mask = document.createElement('div');
    mask.className = 'mask mask-sheet';
    mask.innerHTML = '<div class="sheet" onclick="event.stopPropagation()">' + html + '</div>';
    mask.addEventListener('click', () => mask.remove());
    document.body.appendChild(mask);
    return mask;
  }
  function closeSheet(mask) { if (mask) mask.remove(); }

  // 登录守卫
  function needLogin() {
    if (Store.user()) return true;
    location.hash = '#/login';
    return false;
  }

  window.App = {
    M, Store, fmt, esc, route, render, toast, confirmDialog, openSheet, closeSheet, needLogin,
    groupFor, groupCard, couponById, couponCard, myCoupons, usableCoupons, bestCouponFor,
    inviteCode, rewardOf, courseCard,
    isPC: () => window.innerWidth >= 900
  };

  window.addEventListener('hashchange', render);
  window.addEventListener('resize', () => {
    // 布局切换（PC 顶栏 ↔ 移动底 tab）时重渲染
    clearTimeout(window.__rz);
    window.__rz = setTimeout(render, 150);
  });
  if (!location.hash) location.hash = '#/home';
  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();
})();
