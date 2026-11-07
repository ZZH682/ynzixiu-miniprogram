// 无后端演示后端（字段严格对齐 Java 真实接口的 data 部分）
// 数据来源：js/mock.js（window.MOCK，由「小程序演示源码」data/mock.js 转换而来）
// 作用：后端不可达时，所有页面仍有完整数据，且登录/下单/支付/判分/模考/错题本可交互。
(function () {
  const M = window.MOCK || {};
  const BIZ = M.businesses || [];
  const NEWS = M.news || [];
  const STORIES = M.stories || [];
  const COURSES = M.courses || [];
  const SUBJECTS = M.subjects || [];
  const QUESTIONS = M.questions || [];

  // app.js 内置 12 个科目（真实后端 sid）→ mock 题库的 subject id，保证科目名与题目内容对应
  const SID_MS = {
    1: 6, 2: 2, 3: 3, 4: 3, 5: 2, 6: 4,
    7: 5, 8: 5, 9: 6, 10: 2, 11: 7, 12: 7
  };
  const SUB_NAME = {
    1: '政治', 2: '英语', 3: '行政管理学', 4: '法学概论', 5: '大学英语', 6: '高等数学',
    7: '行测', 8: '申论', 9: '考研政治', 10: '考研英语一', 11: '雅思', 12: '托福'
  };

  // ---- 字段适配：mock 的金额单位是「元」，真实后端是「分」 ----
  function courseVO(c) {
    return {
      id: c.id, bid: c.bid, title: c.title, short: c.short, type: c.type,
      price: Math.round((c.price || 0) * 100),
      origPrice: Math.round((c.orig || 0) * 100),
      teacher: c.teacher, teacherNote: c.teacherNote, sales: c.sales,
      intro: c.intro, highlights: c.highlights, status: 1, stock: 100
    };
  }
  const COURSE_VO = COURSES.map(courseVO);

  // ---- 字段适配：mock 的 opts 是数组，真实后端是 'A.xx|B.xx' 且列表不下发答案 ----
  const QANS = {};
  const QVO = QUESTIONS.map(function (q) {
    const opts = (q.opts || []).map(function (t, i) { return String.fromCharCode(65 + i) + '.' + t; }).join('|');
    QANS[q.id] = { answer: q.answer || '', analysis: q.analysis || '', stem: q.stem || '' };
    return { id: q.id, sid: q.sid, stem: q.stem, opts: opts };
  });
  const MS_BID = {};
  SUBJECTS.forEach(function (s) { MS_BID[s.id] = s.bid; });
  function questionsBySid(sid) {
    const ms = SID_MS[sid] || 1;
    const list = QVO.filter(function (q) { return q.sid === ms; });
    if (list.length) return list;
    const bid = MS_BID[ms];
    const sameBiz = QVO.filter(function (q) { return MS_BID[q.sid] === bid; });
    return sameBiz.length ? sameBiz : QVO.slice(0, 5);
  }

  const MATERIALS = [
    { id: 1, bid: 1, name: '2026 成考报名材料清单', format: 'PDF', member: 0, downloads: 128, fileUrl: 'demo/成考报名材料清单.pdf' },
    { id: 2, bid: 1, name: '成考语文高频考点汇编', format: 'PDF', member: 1, downloads: 86, fileUrl: 'demo/成考语文考点.pdf' },
    { id: 3, bid: 2, name: '自考助学加分政策说明', format: 'PDF', member: 0, downloads: 203, fileUrl: 'demo/自考加分政策.pdf' },
    { id: 4, bid: 4, name: '省考行测真题（近三年）', format: 'ZIP', member: 1, downloads: 157, fileUrl: 'demo/省考行测真题.zip' },
    { id: 5, bid: 6, name: '雅思词汇核心 3000', format: 'PDF', member: 0, downloads: 94, fileUrl: 'demo/雅思核心词汇.pdf' }
  ];
  const TEACHERS = [
    { id: 1, bid: 1, name: '李老师', title: '成考语文主讲', note: '教龄 12 年', char: '李' },
    { id: 2, bid: 3, name: '陈老师', title: '专升本数学主讲', note: '带过 8 届集训营', char: '陈' },
    { id: 3, bid: 4, name: '张老师', title: '行测主讲', note: '原省考命题研究组', char: '张' },
    { id: 4, bid: 5, name: '马老师', title: '考研政治主讲', note: '押题命中率高', char: '马' }
  ];
  const CAMPUSES = [
    { id: 1, name: '昆明五华校区', address: '昆明市五华区学府路 88 号', phone: '0871-8888-000' },
    { id: 2, name: '呈贡大学城校区', address: '昆明市呈贡区景明南路 66 号', phone: '0871-8888-001' }
  ];
  const REVIEWS = [
    { id: 1, bid: 1, name: '王同学', content: '老师把报名到选专业都帮我理清了，很省心。', stars: 5 },
    { id: 2, bid: 3, name: '李同学', content: '集训营节奏紧凑，高数从零基础到能做题。', stars: 5 },
    { id: 3, bid: 4, name: '赵同学', content: '面试模拟练了六次，进考场一点不慌。', stars: 5 }
  ];

  // ---- 会话内状态 ----
  const DB = {
    orders: [], signups: [], errorBook: [], examRecords: [], lastExam: null, seq: 1000
  };

  function norm(s) {
    return String(s == null ? '' : s).toUpperCase().replace(/[^A-Z]/g, '').split('').sort().join('');
  }
  function stamp() {
    const d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function orderNo() { return 'DMO' + String(Date.now()).slice(-10) + (++DB.seq % 100); }
  function receiptNo() {
    const d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return 'RCP' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + String(Math.random()).slice(2, 8).toUpperCase();
  }
  function qById(id) {
    return QVO.find(function (x) { return String(x.id) === String(id); }) || {};
  }
  function ansById(id) {
    return QANS[id] || QANS[String(id)] || { answer: '', analysis: '', stem: '' };
  }
  function addWrong(id, chosen) {
    const a = ansById(id), q = qById(id);
    const hit = DB.errorBook.find(function (e) { return String(e.questionId) === String(id); });
    if (hit) { hit.wrongCount++; hit.lastChosen = chosen; }
    else DB.errorBook.push({
      questionId: id, stem: q.stem || a.stem || '', lastChosen: chosen || '',
      wrongCount: 1, answer: a.answer, analysis: a.analysis
    });
  }

  function csvCell(v) {
    const s = String(v == null ? '' : v);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCsv(rows) {
    return rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
  }

  // ---- 文本响应（CSV 导出）----
  function text(path) {
    const p = String(path).split('?')[0];
    if (p.indexOf('orders/export') >= 0) {
      const rows = [['订单号', '课程', '金额(元)', '状态', '收据号']];
      DB.orders.forEach(function (o) { rows.push([o.orderNo, o.courseTitle, (o.amount / 100).toFixed(0), o.status, o.receiptNo]); });
      return toCsv(rows);
    }
    const rows = [['姓名', '手机号', '意向板块', '来源', '状态', '备注', '时间']];
    DB.signups.forEach(function (s) {
      const b = BIZ.find(function (x) { return x.id === s.bid; });
      rows.push([s.name, s.phone, b ? b.name : '', s.source, s.status, s.note, s.createdAt]);
    });
    return toCsv(rows);
  }

  // ---- 主分发：返回真实接口中 data 的形状 ----
  function handle(path, opt) {
    opt = opt || {};
    const method = (opt.method || 'GET').toUpperCase();
    let body = {};
    try { body = JSON.parse(opt.body || '{}'); } catch (e) { body = {}; }
    const parts = String(path).split('?');
    const p = parts[0];
    const P = new URLSearchParams(parts[1] || '');
    const seg = p.split('/').filter(Boolean);
    const head = seg[0] || '';

    // 鉴权
    if (head === 'auth') {
      if (p.indexOf('/sms') >= 0) return { devCode: '123456', expireSeconds: 300 };
      if (p.indexOf('/admin/login') >= 0) return { token: 'demo-admin-token', role: 'admin', phone: body.phone || '13900000000' };
      return {
        token: 'demo-token-' + Date.now(), role: 'user', phone: body.phone || '13800000000',
        nickname: '演示学员', balance: 0, isNewUser: false
      };
    }

    // 内容 / 品牌展示
    if (head === 'content') {
      const kind = seg[1] || '';
      if (kind === 'businesses') return BIZ;
      if (kind === 'news') return P.get('bid') ? NEWS.filter(function (n) { return n.bid === +P.get('bid'); }) : NEWS;
      if (kind === 'teachers') return TEACHERS;
      if (kind === 'stories') return STORIES;
      if (kind === 'campuses') return CAMPUSES;
      if (kind === 'reviews') return REVIEWS;
      if (kind === 'materials') {
        if (p.indexOf('/download') >= 0) {
          const m = MATERIALS.find(function (x) { return x.id === +seg[2]; });
          if (m) m.downloads++;
          return { fileUrl: m ? m.fileUrl : '' };
        }
        return P.get('bid') ? MATERIALS.filter(function (m) { return m.bid === +P.get('bid'); }) : MATERIALS;
      }
      return [];
    }

    // 课程
    if (head === 'courses') {
      if (p.indexOf('/chapters') >= 0) {
        const c = COURSES.find(function (x) { return x.id === +seg[1]; });
        const chapters = ((c && c.chapters) || []).map(function (ch) {
          return { title: ch.title, dur: ch.dur, trial: !!ch.trial, unlocked: !!ch.trial, videoUrl: '' };
        });
        return { course: c ? courseVO(c) : {}, chapters: chapters };
      }
      if (seg[1]) return COURSE_VO.find(function (c) { return c.id === +seg[1]; }) || {};
      return P.get('bid') ? COURSE_VO.filter(function (c) { return c.bid === +P.get('bid'); }) : COURSE_VO;
    }

    // 订单 / 支付 / 收据
    if (head === 'orders') {
      if (method === 'POST' && seg.length === 1) {
        const c = COURSE_VO.find(function (x) { return x.id === +body.courseId; }) || COURSE_VO[0];
        const no = orderNo();
        DB.orders.push({
          orderNo: no, courseId: c.id, courseTitle: c.title, bid: c.bid,
          amount: c.price, status: 'pending', receiptNo: '', channel: '', createdAt: stamp()
        });
        return { orderNo: no, amount: c.price, status: 'pending' };
      }
      if (p.indexOf('/pay') >= 0) {
        const o = DB.orders.find(function (x) { return x.orderNo === seg[1]; });
        if (o) {
          o.status = 'paid';
          o.receiptNo = receiptNo();
          o.channel = P.get('channel') || 'wechat';
        }
        return {
          orderNo: seg[1], status: 'paid', receiptNo: o ? o.receiptNo : '',
          amount: o ? o.amount : 0, channel: o ? o.channel : 'wechat'
        };
      }
      if (seg[1]) return DB.orders.find(function (x) { return x.orderNo === seg[1]; }) || {};
      return P.get('status') ? DB.orders.filter(function (o) { return o.status === P.get('status'); }) : DB.orders;
    }

    // 招生线索
    if (head === 'signups') {
      if (method === 'POST') {
        DB.signups.push({
          id: DB.signups.length + 1, name: body.name || '', phone: body.phone || '',
          bid: body.bid || 1, source: body.source || 'h5', note: body.note || '',
          status: 'new', createdAt: stamp()
        });
        return { id: DB.signups.length };
      }
      return DB.signups;
    }

    // 题库 / 刷题 / 错题本
    if (head === 'quiz') {
      if (p.indexOf('/questions') >= 0) {
        const sid = +P.get('sid') || 1, page = +P.get('page') || 1, size = +P.get('size') || 20;
        return questionsBySid(sid).slice((page - 1) * size, page * size);
      }
      if (p.indexOf('/submit') >= 0) {
        const id = body.questionId, chosen = body.chosen || '', a = ansById(id);
        const correct = norm(chosen) === norm(a.answer);
        if (!correct) addWrong(id, chosen);
        return { correct: correct, answer: a.answer, analysis: a.analysis, chosen: chosen };
      }
      if (p.indexOf('/error-book') >= 0) return DB.errorBook;
      return [];
    }

    // 模考
    if (head === 'exam') {
      if (p.indexOf('/start') >= 0) {
        const sid = +P.get('sid') || 1, count = +P.get('count') || 20;
        const list = questionsBySid(sid).slice(0, count);
        DB.lastExam = { sid: sid, questions: list };
        return { questions: list, total: list.length, subject: SUB_NAME[sid] || '综合', sid: sid };
      }
      if (p.indexOf('/submit') >= 0) {
        const answers = body.answers || {};
        const qs = (DB.lastExam && DB.lastExam.questions) || [];
        let right = 0;
        const wrongQuestions = [];
        qs.forEach(function (q) {
          const chosen = answers[q.id] != null ? answers[q.id] : (answers[String(q.id)] || '');
          const a = ansById(q.id);
          if (norm(chosen) === norm(a.answer)) right++;
          else { addWrong(q.id, chosen); wrongQuestions.push(q.id); }
        });
        const total = qs.length;
        const rec = {
          id: DB.examRecords.length + 1, sid: body.sid || 1, score: total ? Math.round(right * 100 / total) : 0,
          right: right, total: total, wrong: total - right, duration: body.duration || 0, createdAt: stamp()
        };
        DB.examRecords.push(rec);
        return {
          examId: rec.id, score: rec.score, right: right, total: total,
          wrong: total - right, wrongQuestions: wrongQuestions
        };
      }
      if (p.indexOf('/records') >= 0) return DB.examRecords;
      return [];
    }

    // 管理端
    if (head === 'admin') {
      const kind = seg[1] || '';
      if (kind === 'stats' && seg[2] === 'business') {
        return BIZ.map(function (b) {
          const os = DB.orders.filter(function (o) { return o.bid === b.id && o.status === 'paid'; });
          return {
            bid: b.id, name: b.name, orders: os.length,
            revenue: os.reduce(function (s, o) { return s + o.amount; }, 0), refundRate: 0
          };
        });
      }
      if (kind === 'stats') return { orders: DB.orders.length, signups: DB.signups.length };
      if (kind === 'orders') return DB.orders;
      if (kind === 'signups' && p.indexOf('/status') >= 0) {
        const s = DB.signups.find(function (x) { return x.id === +seg[2]; });
        if (s) s.status = body.status || s.status;
        return { ok: true };
      }
      if (kind === 'signups') return DB.signups;
      return {};
    }

    // 拼团等未演示的营销接口
    if (head === 'groups') return [];
    return {};
  }

  window.DemoBackend = { handle: handle, text: text };
})();
