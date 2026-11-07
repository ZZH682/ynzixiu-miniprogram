// 真实后端接入层
// - 默认同源：前端由 Spring Boot 单端口托管（classpath:/static/），无需跨域
// - 需要连独立后端时可加 ?api=http://localhost:8600 或设置 window.API_BASE
// - 后端不可达时由 sync.js / 各页面保留本地静态数据兜底，保证离线可演示
// - 用户端 token 存 yz_token，管理端 token 存 yz_admin_token（两把密钥互不通用）
// - request()：JSON 接口（{code,data,msg}）；requestText()：原始文本（CSV 导出）
(function () {
  function apiBase() {
    const m = location.search.match(/[?&]api=([^&]+)/);
    if (m) return decodeURIComponent(m[1]);
    return window.API_BASE || '';
  }

  let adminMode = false;
  function token() {
    try { return localStorage.getItem(adminMode ? 'yz_admin_token' : 'yz_token'); } catch (e) { return null; }
  }
  function authHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const t = token();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    return headers;
  }

  async function request(path, opt) {
    let res;
    try {
      res = await fetch(apiBase() + '/api/v1' + path,
        Object.assign({ headers: authHeaders(), credentials: 'omit' }, opt || {}));
    } catch (e) {
      throw new Error('后端未连接');
    }
    let body = {};
    try { body = await res.json(); } catch (e) { body = {}; }
    if (body && body.code !== undefined && body.code !== 0) {
      const err = new Error(body.msg || ('HTTP ' + res.status));
      err.code = body.code;
      throw err;
    }
    if (!res.ok && (!body || body.code === undefined)) {
      throw new Error('HTTP ' + res.status + (body && body.msg ? ' ' + body.msg : ''));
    }
    return body && body.data;
  }

  // 原始文本（用于 CSV 导出下载）
  async function requestText(path) {
    let res;
    try {
      res = await fetch(apiBase() + '/api/v1' + path,
        { headers: authHeaders(), credentials: 'omit' });
    } catch (e) {
      throw new Error('后端未连接');
    }
    if (!res.ok) throw new Error('导出失败：HTTP ' + res.status);
    return await res.text();
  }

  const API = {
    base: apiBase,
    isDemo() { return false; },
    setAdminMode(v) { adminMode = !!v; },
    isAdminMode() { return adminMode; },
    setAdminToken(t) {
      try {
        if (t) localStorage.setItem('yz_admin_token', t);
        else localStorage.removeItem('yz_admin_token');
      } catch (e) { /* ignore */ }
    },
    hasAdminToken() {
      try { return !!localStorage.getItem('yz_admin_token'); } catch (e) { return false; }
    },
    // —— 鉴权 ——
    sendSms(phone) { return request('/auth/sms', { method: 'POST', body: JSON.stringify({ phone }) }); },
    login(phone, code, inviteCode) {
      return request('/auth/login', { method: 'POST', body: JSON.stringify({ phone, code, inviteCode: inviteCode || '' }) });
    },
    adminLogin(phone, password) {
      return request('/auth/admin/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
    },
    // —— 内容 / 品牌展示 ——
    businesses() { return request('/content/businesses'); },
    news(bid) { return request('/content/news' + (bid ? ('?bid=' + bid) : '')); },
    teachers(bid) { return request('/content/teachers' + (bid ? ('?bid=' + bid) : '')); },
    stories() { return request('/content/stories'); },
    campuses() { return request('/content/campuses'); },
    reviews(bid) { return request('/content/reviews' + (bid ? ('?bid=' + bid) : '')); },
    materials(bid) { return request('/content/materials' + (bid ? ('?bid=' + bid) : '')); },
    downloadMaterial(id) { return request('/content/materials/' + id + '/download', { method: 'POST' }); },
    // —— 课程 ——
    courses(bid) { return request('/courses' + (bid ? ('?bid=' + bid) : '')); },
    course(id) { return request('/courses/' + id); },
    chapters(id) { return request('/courses/' + id + '/chapters'); },
    createOrder(payload) { return request('/orders', { method: 'POST', body: JSON.stringify(payload) }); },
    pay(orderNo, payAmount) {
      const q = payAmount != null ? ('?payAmount=' + payAmount) : '';
      return request('/orders/' + orderNo + '/pay' + q, { method: 'POST' });
    },
    myOrders() { return request('/orders'); },
    createGroup(courseId, ruleId) { return request('/groups?courseId=' + courseId + '&ruleId=' + ruleId, { method: 'POST' }); },
    joinGroup(groupId) { return request('/groups/' + groupId + '/join', { method: 'POST' }); },
    myGroups() { return request('/groups/mine'); },
    // —— 招生线索 ——
    submitSignup(payload) { return request('/signups', { method: 'POST', body: JSON.stringify(payload) }); },
    mySignups() { return request('/signups/mine'); },
    // —— 题库 / 刷题 / 模考 ——
    questions(sid, page, size) { return request('/quiz/questions?sid=' + sid + '&page=' + (page || 1) + '&size=' + (size || 20)); },
    submitAnswer(questionId, chosen) { return request('/quiz/submit', { method: 'POST', body: JSON.stringify({ questionId, chosen }) }); },
    errorBook() { return request('/quiz/error-book'); },
    startExam(sid, count) { return request('/exam/start?sid=' + sid + '&count=' + (count || 20), { method: 'POST' }); },
    submitExam(payload) { return request('/exam/submit', { method: 'POST', body: JSON.stringify(payload) }); },
    examRecords() { return request('/exam/records'); },
    // —— 门户聚合：全站内容 / 学员数据同步 / 营销与服务动作 ——
    catalog() { return request('/content/catalog'); },
    settings() { return request('/content/settings'); },
    me() { return request('/portal/me'); },
    markStudy(courseId, chapterNo) {
      return request('/portal/study', { method: 'POST', body: JSON.stringify({ courseId, chapterNo }) });
    },
    claimCoupon(couponId) {
      return request('/portal/coupons/' + couponId + '/claim', { method: 'POST' });
    },
    withdraw(amount, account) {
      return request('/portal/withdraw', { method: 'POST', body: JSON.stringify({ amount, account }) });
    },
    receipt(orderNo) { return request('/portal/receipt/' + encodeURIComponent(orderNo)); },
    postMessage(phone, content) {
      return request('/service/message', { method: 'POST', body: JSON.stringify({ phone, content }) });
    },
    groups(courseId) { return request('/groups?courseId=' + courseId); },
    orderDetail(orderNo) { return request('/orders/' + encodeURIComponent(orderNo)); },
    // —— 管理端（调用前先 setAdminMode(true)） ——
    adminStats() { return request('/admin/stats'); },
    adminStatsBusiness() { return request('/admin/stats/business'); },
    adminOrders(status) { return request('/admin/orders' + (status ? ('?status=' + status) : '')); },
    adminSignups(params) {
      const q = new URLSearchParams(params || {}).toString();
      return request('/admin/signups' + (q ? ('?' + q) : ''));
    },
    adminUpdateSignup(id, status) {
      return request('/admin/signups/' + id + '/status', { method: 'POST', body: JSON.stringify({ status }) });
    },
    // 导出（返回 CSV 文本）
    exportOrdersCsv() { return requestText('/admin/orders/export'); },
    exportSignupsCsv(params) {
      const q = new URLSearchParams(params || {}).toString();
      return requestText('/admin/signups/export' + (q ? ('?' + q) : ''));
    }
  };

  window.API = API;
  if (window.App) window.App.API = API;
})();
