// 云南自修学校 · H5 页面视图（交互流程：课程详情/题库/预约/订单/登录/我的/营销/客服）
(function () {
  const A = window.App;
  const M = A.M;
  const S = A.Store;
  const fmt = A.fmt;
  const esc = A.esc;
  const P = (window.P = {});

  const courseRowHtml = (c) => {
    const card = A.courseCard(c);
    const owned = S.ownedIds().indexOf(c.id) > -1;
    return (
      '<div class="course-row">' +
      '<a class="cover cover-sm" style="background:linear-gradient(150deg,' + card.color + ',' + card.color + 'CC)" href="#/course/' + c.id + '">' +
      '<span class="cover-char">' + card.char + '</span><span class="cover-type">' + card.typeText + '</span>' +
      '<span class="cover-name">' + esc(c.short) + '</span></a>' +
      '<div class="course-main"><a class="course-title ellipsis" href="#/course/' + c.id + '">' + esc(c.title) + '</a>' +
      '<div class="course-meta">' + esc(c.teacherNote) + ' · ' + esc(c.bname) + ' · 已报名 ' + c.sales + '</div></div>' +
      '<div class="course-buy"><div><span class="price course-price"><span class="price-unit">¥</span>' + card.priceText + '</span></div>' +
      '<button class="btn ' + (owned ? 'btn-line' : 'btn-primary') + ' course-btn" onclick="P.buy(' + c.id + ')">' + (owned ? '继续学习' : '立即报名') + '</button></div>' +
      '</div>'
    );
  };
  P.courseRowHtml = courseRowHtml;

  // ============ 课程详情 ============
  P.courseDetail = (id) => {
    const c = A.courseCard(M.courseById(id));
    const owned = S.ownedIds().indexOf(c.id) > -1;
    const learned = S.study()[c.id] || [];
    const g = A.groupCard(c.id);
    const openGroups = g ? M.openGroups.filter((o) => o.courseId === c.id).map((o) => Object.assign({}, o, {
      initial: o.leader.slice(0, 1),
      need: g.size - o.joined,
      leftText: Math.floor(o.leftMin / 60) + ' 小时 ' + (o.leftMin % 60) + ' 分'
    })) : [];
    const coupon = A.bestCouponFor(c.bid, c.price);
    const pending = S.pendingGroup(c.id);

    const chapters = c.chapters.map((ch, i) => Object.assign({}, ch, {
      no: i + 1,
      noText: (i < 9 ? '0' : '') + (i + 1),
      learned: learned.indexOf(i) > -1,
      open: owned || ch.trial
    }));

    return (
      '<div class="detail-head">' +
      '<div class="detail-meta"><span class="tag tag-brand">' + esc(c.bname) + '</span><span class="tag">' + c.typeText + '</span>已报名 ' + c.sales + ' 人</div>' +
      '<h1 class="detail-title" style="margin-top:10px">' + esc(c.title) + '</h1>' +
      '<div class="detail-price-box"><span class="price detail-price"><span class="price-unit">¥</span>' + c.priceText + '</span><span class="price-orig">¥' + c.origText + '</span>' +
      (coupon ? '<span class="tag tag-warm" style="margin-left:10px">可用' + esc(coupon.name) + ' 减 ¥' + coupon.amountText + '</span>' : '') + '</div>' +
      '</div>' +

      '<div class="tabs-in">' +
      '<span class="tab-a on" data-tab="intro">课程简介</span>' +
      '<span class="tab-a" data-tab="catalog">课程目录（' + c.chapters.length + ' 节）</span>' +
      '</div>' +

      '<div class="section" id="tabIntro">' +
      '<div class="card"><div class="block-text">' + esc(c.intro) + '</div>' +
      '<div class="block-label gap">课程亮点</div>' +
      '<div class="offers">' + c.highlights.map((h) => '<div class="offer"><span class="offer-dot" style="background:' + c.color + '"></span>' + esc(h) + '</div>').join('') + '</div>' +
      '</div>' +
      '<div class="card" style="margin-top:12px;display:flex;align-items:center;gap:14px">' +
      '<span class="t-avatar" style="background:' + c.tint + ';color:' + c.color + '">' + esc(c.teacher.slice(0, 1)) + '</span>' +
      '<div style="flex:1"><div style="font-weight:700">' + esc(c.teacher) + '</div><div style="font-size:13px;color:var(--text-3)">' + esc(c.teacherNote) + '</div></div>' +
      '<a class="btn btn-line btn-sm" href="#/teachers">师资团队</a>' +
      '</div>' +
      '</div>' +

      '<div class="section" id="tabCatalog" style="display:none">' +
      '<div class="card">' +
      chapters.map((ch) =>
        '<div class="chapter" onclick="P.play(' + c.id + ',' + ch.no + ')">' +
        '<span class="chapter-no num">' + ch.noText + '</span>' +
        '<div class="chapter-main"><div class="chapter-title">' + esc(ch.title) + '</div><div class="chapter-dur num">' + ch.dur + '</div></div>' +
        '<span class="chapter-state ' + (ch.learned ? 'done' : ch.trial ? 'trial' : '') + '">' + (ch.learned ? '已学完' : ch.trial ? '可试听' : owned ? '未学习' : '未解锁') + '</span>' +
        '</div>'
      ).join('') +
      '</div>' +
      (owned ? '<div class="demo-note">已报名：全部章节已解锁，学习进度同步到「学习中心」</div>' : '<div class="demo-note">报名后解锁全部章节；标「可试听」的章节免费试看</div>') +
      '</div>' +

      (g && !owned
        ? '<div class="section"><div class="section-head"><span class="section-title">拼团更优惠</span><a class="section-more" href="#/group">拼团说明 ›</a></div>' +
        '<div class="card" style="display:flex;align-items:center;gap:14px">' +
        '<div style="flex:1"><div style="font-weight:700">' + g.size + ' 人拼团 · 每人 ¥' + g.priceText + '</div>' +
        '<div style="font-size:13px;color:var(--text-3);margin-top:4px">比单独报名省 ¥' + g.saveText + '，' + g.hours + ' 小时内成团</div></div>' +
        (pending
          ? '<a class="btn btn-primary btn-sm" href="#/group/' + pending.id + '">我的拼团</a>'
          : '<button class="btn btn-primary btn-sm" onclick="P.startGroup(' + c.id + ')">开团 / 参团</button>') +
        '</div>' +
        (openGroups.length
          ? '<div class="card" style="margin-top:12px"><div style="font-size:14px;font-weight:600;margin-bottom:10px">这些同学正在拼</div>' +
          openGroups.map((o) =>
            '<div class="row"><span class="r-avatar" style="width:34px;height:34px;font-size:14px">' + esc(o.initial) + '</span>' +
            '<span class="row-main" style="margin-left:12px"><span style="font-size:14px">' + esc(o.leader) + '</span> <span style="font-size:12px;color:var(--text-3)">已 ' + o.joined + ' 人 · 还差 ' + o.need + ' 人 · 剩 ' + o.leftText + '</span></span>' +
            '<button class="btn btn-line btn-sm" onclick="P.joinOpenGroup(\'' + o.id + '\')">参团</button></div>'
          ).join('') + '</div>'
          : '') +
        '</div>'
        : '') +

      '<div class="bottom-space"></div>' +
      '<div class="bottom-bar"><div class="bottom-bar-in">' +
      '<a class="btn btn-line" style="flex:1" href="tel:19908883061">电话咨询</a>' +
      '<button class="btn ' + (owned ? 'btn-line' : 'btn-primary') + '" style="flex:2" onclick="P.buy(' + c.id + ')">' + (owned ? '继续学习' : '立即报名') + '</button>' +
      '</div></div>'
    );
  };

  A.route('course/:id', {
    title: (c) => M.courseById(c.id).title,
    render(c) { return P.courseDetail(c.id); },
    after(c) {
      document.querySelectorAll('.tab-a').forEach((t) => {
        t.addEventListener('click', () => {
          document.querySelectorAll('.tab-a').forEach((x) => x.classList.remove('on'));
          t.classList.add('on');
          const tab = t.dataset.tab;
          document.getElementById('tabIntro').style.display = tab === 'intro' ? '' : 'none';
          document.getElementById('tabCatalog').style.display = tab === 'catalog' ? '' : 'none';
        });
      });
      P._courseId = c.id;
    }
  });

  P.play = (courseId, no) => {
    const c = M.courseById(courseId);
    const idx = no - 1;
    const ch = c && Array.isArray(c.chapters) ? c.chapters[idx] : null;
    if (!ch) { A.toast('课程或章节不存在'); return; }
    const owned = S.ownedIds().indexOf(courseId) > -1;
    if (!owned && !ch.trial) { A.toast('报名后解锁全部章节'); return; }
    if (owned) S.markChapter(courseId, idx);
    // 已购或试听时异步上报学习进度（fire-and-forget，不阻塞 UI）
    try {
      if (window.YzSync && window.YzSync.online && window.API && window.API.markStudy) {
        window.API.markStudy(courseId, no).catch(() => {});
      }
    } catch (e) { /* 吞掉错误，离线演示不受影响 */ }
    A.toast('演示版：开始学习 第 ' + no + ' 节 · ' + ch.title);
    A.render();
  };

  // —— 报名 / 拼团下单 ——
  // 本地模拟下单（离线演示 / 后端失败时的兜底，逻辑保持原样）
  function localCreateOrder(courseId, opt) {
    const c = M.courseById(courseId);
    const coupon = opt.couponId ? A.couponById(opt.couponId) : null;
    const discount = coupon ? coupon.amount : 0;
    const isGroup = !!opt.group;
    const amount = isGroup ? A.groupFor(courseId).price : c.price - discount;
    const plan = opt.plan || 'full';
    const paid = plan === 'split' ? Math.round(amount / 2) : amount;
    const order = S.addOrder({
      courseId, title: c.title, phone: S.user().phone,
      listPrice: c.price, discount, amount, paid,
      status: isGroup ? 'group' : plan === 'split' ? 'balance' : 'paid',
      plan, pay: opt.pay || 'wechat', couponId: coupon ? coupon.id : '',
      group: isGroup ? { size: A.groupFor(courseId).size, members: [], createdAt: Date.now(), hours: A.groupFor(courseId).hours } : null
    });
    if (coupon) S.useCoupon(coupon.id, order.id);
    return order;
  }

  // 在线时走真实下单 + 支付链路；任一环节失败或离线则回退本地模拟
  async function createOrder(courseId, opt) {
    if (!(window.YzSync && window.YzSync.online && window.API)) {
      return localCreateOrder(courseId, opt);
    }
    try {
      const plan = opt.plan === 'split' ? 'installment' : 'full';
      const claim = opt.couponId ? S.coupons().find((c) => c.tid === opt.couponId) : null;
      const couponClaimId = claim ? claim.claimId : undefined;
      let groupId;
      if (opt.group) {
        const g = M.groupBuys.find((x) => x.courseId === Number(courseId));
        if (!g || !g.ruleId) return localCreateOrder(courseId, opt);
        const gr = await window.API.createGroup(courseId, g.ruleId);
        groupId = gr && typeof gr === 'object' ? (gr.groupId != null ? gr.groupId : gr.id) : gr;
      }
      const r = await window.API.createOrder({
        courseId, plan, couponClaimId, groupId,
        requestId: 'H5-' + courseId + '-' + Date.now()
      });
      await window.API.pay(r.orderNo);
      await window.YzSync.hydrateMe({ render: false });
      return S.order(r.orderNo) || {
        id: r.orderNo, courseId, status: 'paid', amount: 0, paid: 0,
        title: (M.courseById(courseId) || {}).title || ''
      };
    } catch (e) {
      A.toast('后端未连接，使用离线演示');
      return localCreateOrder(courseId, opt);
    }
  }

  function openBuySheet(courseId, mode) {
    const c = M.courseById(courseId);
    const isGroup = mode === 'group';
    const basePrice = isGroup ? A.groupFor(courseId).price : c.price;
    const usable = A.usableCoupons(c.bid, basePrice);
    const myInitial = S.user().phone.slice(-1);

    const mask = A.openSheet(
      '<div class="sheet-title">' + (isGroup ? '发起拼团' : '确认报名') + '</div>' +
      '<div class="card" style="margin-bottom:14px">' +
      '<div style="font-weight:700">' + esc(c.title) + '</div>' +
      '<div class="detail-meta" style="margin-top:6px">' + esc(c.bname) + ' · ' + c.typeText + '</div>' +
      '<div class="detail-price-box"><span class="price detail-price"><span class="price-unit">¥</span>' + fmt.price(basePrice) + '</span>' +
      (isGroup ? '<span class="price-orig">¥' + fmt.price(c.price) + '</span>' : '') + '</div>' +
      '</div>' +

      (usable.length && !isGroup
        ? '<div class="card" style="margin-bottom:14px"><div class="field-label">选择优惠券</div>' +
        '<div class="pick-row" id="couponPick">' +
        '<span class="pick on" data-c="">不使用优惠券</span>' +
        usable.map((q) => '<span class="pick" data-c="' + q.id + '">' + esc(q.name) + '（减 ¥' + q.amountText + '）</span>').join('') +
        '</div></div>'
        : '') +

      (!isGroup
        ? '<div class="card" style="margin-bottom:14px"><div class="field-label">付款方式</div>' +
        '<div class="pick-row" id="planPick">' +
        '<span class="pick on" data-p="full">一次付清</span>' +
        '<span class="pick" data-p="split">首付 + 尾款（首付 ¥' + fmt.price(Math.round(basePrice / 2)) + '）</span>' +
        '</div></div>'
        : '<div class="card" style="margin-bottom:14px"><div class="block-text">' + A.groupFor(courseId).size + ' 人成团，' + A.groupFor(courseId).hours + ' 小时内未成团原路退款；成团后课程立即解锁。</div></div>') +

      '<div class="card" style="margin-bottom:14px"><div class="field-label">支付方式</div>' +
      '<div class="pick-row"><span class="pick on">微信支付</span><span class="pick">支付宝</span></div></div>' +

      '<button class="btn btn-primary btn-block" id="doPay">' + (isGroup ? '发起拼团' : '确认支付') + '</button>' +
      '<div class="demo-note" style="padding-bottom:0">演示版不产生真实支付，正式版调起微信 / 支付宝支付</div>'
    );
    let couponId = '';
    let plan = 'full';
    mask.querySelectorAll('#couponPick .pick').forEach((p) => {
      p.addEventListener('click', () => {
        mask.querySelectorAll('#couponPick .pick').forEach((x) => x.classList.remove('on'));
        p.classList.add('on');
        couponId = p.dataset.c;
      });
    });
    mask.querySelectorAll('#planPick .pick').forEach((p) => {
      p.addEventListener('click', () => {
        mask.querySelectorAll('#planPick .pick').forEach((x) => x.classList.remove('on'));
        p.classList.add('on');
        plan = p.dataset.p;
      });
    });
    mask.querySelector('#doPay').addEventListener('click', async () => {
      const payBtn = mask.querySelector('#doPay');
      payBtn.disabled = true;
      try {
        if (isGroup) {
          const order = await createOrder(courseId, { plan: 'full', group: true });
          S.joinGroup(order.id, myInitial);
          A.closeSheet(mask);
          A.toast('拼团已发起，邀请好友参团');
          location.hash = '#/group/' + order.id;
        } else {
          const order = await createOrder(courseId, { couponId, plan });
          A.closeSheet(mask);
          A.toast(plan === 'split' ? '首付成功，尾款可在订单中补付' : '支付成功，课程已解锁');
          location.hash = '#/receipt/' + order.id;
        }
      } catch (e) {
        payBtn.disabled = false;
        A.toast((e && e.message) || '下单失败，请重试');
      }
    });
  }

  P.buy = (courseId) => {
    if (!A.needLogin()) return;
    if (S.ownedIds().indexOf(courseId) > -1) {
      location.hash = '#/study';
      return;
    }
    openBuySheet(courseId, 'buy');
  };

  P.startGroup = (courseId) => {
    if (!A.needLogin()) return;
    openBuySheet(courseId, 'group');
  };

  P.joinOpenGroup = async (gid) => {
    if (!A.needLogin()) return;
    const o = M.openGroups.find((x) => x.id === gid);
    try {
      if (window.YzSync && window.YzSync.online && window.API && o && o.backendId != null) {
        await window.API.joinGroup(o.backendId);
        await window.YzSync.hydrateMe({ render: false });
        A.toast('参团成功，满员即成团');
        A.render();
        return;
      }
    } catch (e) { /* 回退本地模拟 */ }
    const g = A.groupFor(o.courseId);
    const order = S.addOrder({
      courseId: o.courseId, title: M.courseById(o.courseId).title, phone: S.user().phone,
      listPrice: M.courseById(o.courseId).price, discount: 0, amount: g.price, paid: 0,
      status: 'group', plan: 'full', pay: 'wechat', couponId: '',
      group: { size: g.size, members: [o.leader].concat(Array(o.joined).fill('同学')).concat([S.user().phone.slice(-1)]), createdAt: Date.now(), hours: g.hours, open: true }
    });
    A.toast('参团成功，满员即成团');
    location.hash = '#/group/' + order.id;
  };

  // ============ 拼团详情 ============
  A.route('group/:id', {
    title: () => '拼团详情',
    render(c) {
      const o = S.order(c.id);
      if (!o) return '<div class="empty-page"><div class="empty-title">拼团不存在</div><a class="btn btn-ghost" href="#/course">去选课</a></div>';
      const g = A.groupFor(o.courseId);
      const course = M.courseById(o.courseId);
      const done = o.status !== 'group';
      const left = o.group.createdAt + o.group.hours * 3600 * 1000 - Date.now();
      return (
        '<div class="page-head"><div class="page-title">' + (done ? '拼团已成功' : '拼团中') + '</div>' +
        '<div class="page-sub">' + esc(course.short) + ' · ' + o.group.size + ' 人团 · 每人 ¥' + fmt.price(g.price) + '</div></div>' +
        '<div class="section"><div class="card" style="text-align:center">' +
        '<div style="font-size:15px;color:var(--text-2)">已参团</div>' +
        '<div style="margin:14px 0"><span class="summary-num num">' + o.group.members.length + '</span><span style="color:var(--text-3)"> / ' + o.group.size + ' 人</span></div>' +
        '<div style="display:flex;justify-content:center;gap:10px;margin-bottom:14px">' +
        o.group.members.map((m) => '<span class="r-avatar" style="background:var(--brand-weak);color:var(--brand)">' + esc(String(m).slice(0, 1)) + '</span>').join('') +
        (done ? '' : Array(o.group.size - o.group.members.length).fill(0).map(() => '<span class="r-avatar" style="background:var(--bg);color:var(--text-3)">?</span>').join('')) +
        '</div>' +
        (done
          ? '<div style="color:var(--good);font-weight:700">已成团，课程已解锁 → <a href="#/study" style="text-decoration:underline">去学习</a></div>'
          : '<div class="exam-clock num" id="groupClock">剩余 --:--</div>' +
          '<div style="font-size:13px;color:var(--text-3);margin-top:6px">倒计时结束未成团将原路退款</div>' +
          '<button class="btn btn-primary btn-block" style="margin-top:16px" onclick="P.simJoin(\'' + o.id + '\')">演示：模拟一位好友参团</button>') +
        '</div></div>' +
        '<div class="section"><div class="card course-card">' + courseRowHtml(course) + '</div></div>' +
        '<div class="demo-note">真机演示看不到真实好友，用按钮模拟；好友通过分享链接进入会带上邀请参数</div>'
      );
    },
    after(c) {
      const o = S.order(c.id);
      if (!o || o.status === 'group') return;
      const clock = document.getElementById('groupClock');
      if (!clock) return;
      const timer = setInterval(() => {
        const left = o.group.createdAt + o.group.hours * 3600 * 1000 - Date.now();
        if (left <= 0) {
          clearInterval(timer);
          clock.textContent = '已超时';
          return;
        }
        const h = Math.floor(left / 3600000);
        const m = Math.floor((left % 3600000) / 60000);
        const s = Math.floor((left % 60000) / 1000);
        clock.textContent = '剩余 ' + h + ' 小时 ' + m + ' 分 ' + s + ' 秒';
      }, 1000);
    }
  });

  P.simJoin = (id) => {
    const o = S.joinGroup(id, '好友');
    if (o && o.status !== 'group') A.toast('已成团，课程已解锁');
    else A.toast('好友已参团，还差 ' + (o.group.size - o.group.members.length) + ' 人');
    A.render();
  };

  // ============ 题库 ============
  A.route('quiz', {
    title: () => '在线题库',
    render() {
      const wrong = Object.keys(S.wrong()).length;
      const records = S.records();
      return (
        '<div class="page-head"><div class="page-title">在线题库</div><div class="page-sub">分科练习选完即判，综合模考限时 10 分钟</div></div>' +
        '<div class="section">' +
        '<div class="quiz-grid">' +
        M.subjects.map((s) => {
          const count = M.questions.filter((q) => q.sid === s.id).length;
          const b = M.businessById(s.bid);
          return (
            '<div class="quiz-card">' +
            '<span class="mark" style="background:' + b.tint + ';color:' + b.color + '">' + b.char + '</span>' +
            '<div class="quiz-card-name">' + esc(s.name) + '</div>' +
            '<div class="quiz-card-meta num">' + count + ' 道题 · 单选 · 即时判卷</div>' +
            '<a class="btn btn-ghost btn-sm quiz-card-btn" href="#/quiz/practice/' + s.id + '">开始练习</a>' +
            '</div>'
          );
        }).join('') +
        '</div>' +
        '</div>' +
        '<div class="section">' +
        '<div class="promo-grid">' +
        '<div class="promo promo-big"><span class="promo-kicker">综合模考</span>' +
        '<span class="promo-title">全科目混合 20 题\n限时 10 分钟</span>' +
        '<a class="promo-go" href="#/quiz/exam">开始模考 →</a></div>' +
        '<a class="promo promo-sm" href="#/quiz/errors"><span class="promo-title-sm">错题本（' + wrong + '）</span><span class="promo-sub">答错的题自动收录，可反复练习</span></a>' +
        '<div class="promo promo-sm"><span class="promo-title-sm">练习记录</span><span class="promo-sub">已完成 ' + records.length + ' 次练习 / 模考</span></div>' +
        '</div>' +
        '</div>'
      );
    }
  });

  // —— 分科练习 / 错题练习 ——
  function practiceView() {
    const st = window.__practice;
    if (!st) return '<div class="empty-page"><div class="empty-title">练习已结束</div><a class="btn btn-ghost" href="#/quiz">回题库</a></div>';
    const q = st.list[st.idx];
    const chosen = st.answers[q.id];
    const judged = chosen !== undefined;
    const total = st.list.length;
    return (
      '<div class="page-head"><div class="page-title">' + esc(st.title) + '</div>' +
      '<div class="page-sub num">第 ' + (st.idx + 1) + ' / ' + total + ' 题 · 已答对 ' + st.right + ' 题</div></div>' +
      '<div class="section">' +
      '<div class="exam-bar"><div class="exam-progress"><div class="exam-progress-bar"><div class="exam-progress-in" style="width:' + Math.round((st.idx / total) * 100) + '%"></div></div></div>' +
      '<span class="num" style="font-size:13px;color:var(--text-3)">' + st.idx + ' / ' + total + '</span></div>' +
      '<div class="card">' +
      '<div class="q-stem">' + esc(q.stem) + '</div>' +
      '<div class="q-opts">' +
      q.opts.map((o, i) => {
        const k = String.fromCharCode(65 + i);
        let cls = 'q-opt';
        if (judged) {
          cls += ' lock';
          if (k === q.answer) cls += ' right';
          else if (k === chosen) cls += ' wrong';
        }
        return '<div class="' + cls + '" onclick="P.choose(\'' + k + '\')"><span class="k">' + k + '</span><span>' + esc(o) + '</span></div>';
      }).join('') +
      '</div>' +
      (judged
        ? '<div class="q-analysis"><b>解析：</b>' + esc(q.analysis) + '</div>' +
        '<button class="btn btn-primary btn-block" style="margin-top:14px" onclick="P.next()">' + (st.idx + 1 === total ? '查看结果' : '下一题') + '</button>'
        : '') +
      '</div></div>'
    );
  }

  window.__practice = null;
  P.startPractice = (list, title) => {
    window.__practice = { list, title, idx: 0, right: 0, answers: {} };
    location.hash = '#/quiz/practice';
  };
  P.choose = (k) => {
    const st = window.__practice;
    if (!st) return;
    const q = st.list[st.idx];
    if (st.answers[q.id] !== undefined) return;
    st.answers[q.id] = k;
    if (k === q.answer) {
      st.right++;
      if (st.mode === 'wrong') S.removeWrong(q.id);
    } else {
      S.addWrong(q.id, k);
    }
    // 判断对错后异步上报答题结果（fire-and-forget，不影响本地错题本）
    try {
      if (window.YzSync && window.YzSync.online && window.API && window.API.submitAnswer) {
        window.API.submitAnswer(q.id, k).catch(() => {});
      }
    } catch (e) { /* 吞掉错误，离线演示不受影响 */ }
    A.render();
  };
  P.next = () => {
    const st = window.__practice;
    if (!st) return;
    if (st.idx + 1 >= st.list.length) {
      S.addRecord({ mode: st.mode === 'wrong' ? '错题练习' : '分科练习', title: st.title, right: st.right, total: st.list.length });
      location.hash = '#/quiz/result';
      return;
    }
    st.idx++;
    A.render();
  };

  A.route('quiz/practice', {
    title: () => '练习中',
    render() { return practiceView(); }
  });
  A.route('quiz/practice/:sid', {
    render(c) {
      const sid = Number(c.sid);
      // 已在练习中（同科目）则不重置，支持翻页时重渲染
      if (!window.__practice || window.__practice.sid !== sid || window.__practice.mode !== 'practice') {
        const s = M.subjects.find((x) => x.id === sid);
        const list = M.questions.filter((q) => q.sid === s.id);
        window.__practice = { list, title: s.name, idx: 0, right: 0, answers: {}, mode: 'practice', sid };
      }
      return practiceView();
    }
  });

  // —— 综合模考 ——
  A.route('quiz/exam', {
    title: () => '综合模考',
    render() {
      // 进入模考页时若无进行中的考试则开考（重新进入会重新开考）
      if (!window.__exam) {
        const list = M.questions.slice().sort(() => Math.random() - 0.5).slice(0, 20);
        window.__exam = { list, idx: 0, answers: {}, left: 600 };
      }
      const st = window.__exam;
      const q = st.list[st.idx];
      const answered = st.answers[q.id];
      const doneCount = st.list.filter((x) => st.answers[x.id] !== undefined).length;
      return (
        '<div class="page-head"><div class="page-title">综合模考</div>' +
        '<div class="page-sub">全科目混合 ' + st.list.length + ' 题 · 限时 10 分钟</div></div>' +
        '<div class="section">' +
        '<div class="exam-bar"><span class="exam-clock num" id="examClock">' + fmt.clock(st.left) + '</span>' +
        '<div class="exam-progress"><div class="exam-progress-bar"><div class="exam-progress-in" style="width:' + Math.round((doneCount / st.list.length) * 100) + '%"></div></div></div>' +
        '<span class="num" style="font-size:13px;color:var(--text-3)">已答 ' + doneCount + ' / ' + st.list.length + '</span></div>' +
        '<div class="card">' +
        '<div class="q-stem num">第 ' + (st.idx + 1) + ' 题 · ' + esc(q.stem) + '</div>' +
        '<div class="q-opts">' +
        q.opts.map((o, i) => {
          const k = String.fromCharCode(65 + i);
          return '<div class="q-opt ' + (answered === k ? 'right' : '') + '" onclick="P.examChoose(\'' + k + '\')"><span class="k">' + k + '</span><span>' + esc(o) + '</span></div>';
        }).join('') +
        '</div>' +
        '</div>' +
        '<div class="card" style="margin-top:12px">' +
        '<div class="field-label">答题卡</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
        st.list.map((x, i) => {
          const a = st.answers[x.id];
          return '<span class="chip ' + (i === st.idx ? 'on' : '') + '" style="min-width:40px;text-align:center" onclick="P.examGoto(' + i + ')">' + (i + 1) + (a ? '' : '') + '</span>';
        }).join('') +
        '</div>' +
        '<div style="display:flex;gap:12px;margin-top:14px">' +
        '<button class="btn btn-line" style="flex:1" onclick="P.examGoto(' + Math.max(0, st.idx - 1) + ')">上一题</button>' +
        '<button class="btn btn-line" style="flex:1" onclick="P.examGoto(' + Math.min(st.list.length - 1, st.idx + 1) + ')">下一题</button>' +
        '<button class="btn btn-primary" style="flex:1" onclick="P.examSubmit()">交卷</button>' +
        '</div>' +
        '</div>' +
        '</div>'
      );
    },
    after() {
      const st = window.__exam;
      if (!st) return;
      const clock = document.getElementById('examClock');
      if (window.__examTimer) clearInterval(window.__examTimer);
      window.__examTimer = setInterval(() => {
        st.left--;
        if (clock) clock.textContent = fmt.clock(Math.max(0, st.left));
        if (st.left <= 0) {
          clearInterval(window.__examTimer);
          P.examSubmit(true);
        }
      }, 1000);
    }
  });

  P.startExam = () => {
    const list = M.questions.slice().sort(() => Math.random() - 0.5).slice(0, 20);
    window.__exam = { list, idx: 0, answers: {}, left: 600 };
    location.hash = '#/quiz/exam';
  };
  P.examChoose = (k) => {
    const st = window.__exam;
    if (!st) return;
    st.answers[st.list[st.idx].id] = k;
    A.render();
  };
  P.examGoto = (i) => {
    const st = window.__exam;
    if (!st) return;
    st.idx = Math.max(0, Math.min(st.list.length - 1, i));
    A.render();
  };
  P.examSubmit = (timeout) => {
    const st = window.__exam;
    if (!st) return;
    if (window.__examTimer) clearInterval(window.__examTimer);
    let right = 0;
    st.list.forEach((q) => {
      if (st.answers[q.id] === q.answer) right++;
      else if (st.answers[q.id] !== undefined) S.addWrong(q.id, st.answers[q.id]);
    });
    // 模考成绩异步上报（fire-and-forget，不影响结果页）
    try {
      if (window.YzSync && window.YzSync.online && window.API && window.API.submitExam) {
        const answers = {};
        Object.keys(st.answers).forEach((k) => { answers[String(k)] = st.answers[k]; });
        window.API.submitExam({ sid: 0, duration: 600 - (st.left || 0), answers }).catch(() => {});
      }
    } catch (e) { /* 吞掉错误，离线演示不受影响 */ }
    S.addRecord({ mode: '综合模考', title: '全科目混合', right, total: st.list.length });
    window.__examResult = { right, total: st.list.length, timeout: !!timeout };
    window.__exam = null;
    location.hash = '#/quiz/result';
  };

  // —— 结果 / 错题本 ——
  A.route('quiz/result', {
    title: () => '练习结果',
    render() {
      const r = window.__examResult || (window.__practice ? { right: window.__practice.right, total: window.__practice.list.length } : null);
      window.__practice = null;
      window.__examResult = null;
      if (!r) return '<div class="empty-page"><div class="empty-title">暂无结果</div><a class="btn btn-ghost" href="#/quiz">回题库</a></div>';
      const wrong = Object.keys(S.wrong()).length;
      return (
        '<div class="section">' +
        '<div class="card result-score">' +
        '<div class="result-num num">' + r.right + '<span style="font-size:22px;color:var(--text-3)"> / ' + r.total + '</span></div>' +
        '<div class="result-k">' + (r.timeout ? '时间到，已自动交卷' : '本次成绩') + '</div>' +
        '</div>' +
        '<div class="card" style="margin-top:14px;display:flex;gap:12px">' +
        '<a class="btn btn-line" style="flex:1" href="#/quiz">再练一组</a>' +
        '<a class="btn btn-ghost" style="flex:1" href="#/quiz/errors">错题本（' + wrong + '）</a>' +
        '<a class="btn btn-primary" style="flex:1" href="#/course">去看课程</a>' +
        '</div></div>'
      );
    }
  });

  A.route('quiz/errors', {
    title: () => '错题本',
    render() {
      const wrong = S.wrong();
      const list = Object.keys(wrong).map((qid) => {
        const q = M.questions.find((x) => x.id === Number(qid));
        return q ? Object.assign({}, q, { chosen: wrong[qid].chosen }) : null;
      }).filter(Boolean);
      return (
        '<div class="page-head"><div class="page-title">错题本</div>' +
        '<div class="page-sub">答错的题自动收录，答对后移出</div></div>' +
        (list.length
          ? '<div class="section">' +
          '<div class="card" style="margin-bottom:14px;display:flex;align-items:center;gap:14px">' +
          '<div style="flex:1"><b class="num">' + list.length + '</b> 道错题待攻克</div>' +
          '<button class="btn btn-primary btn-sm" onclick="P.practiceWrong()">刷错题</button>' +
          '</div>' +
          list.map((q) =>
            '<div class="card" style="margin-bottom:12px">' +
            '<div class="q-stem">' + esc(q.stem) + '</div>' +
            '<div class="q-opts">' +
            q.opts.map((o, i) => {
              const k = String.fromCharCode(65 + i);
              let cls = 'q-opt lock';
              if (k === q.answer) cls += ' right';
              else if (k === q.chosen) cls += ' wrong';
              return '<div class="' + cls + '"><span class="k">' + k + '</span><span>' + esc(o) + '</span></div>';
            }).join('') +
            '</div>' +
            '<div class="q-analysis"><b>你的答案：</b>' + (q.chosen || '未答') + '　<b>正确答案：</b>' + q.answer + '<br><b>解析：</b>' + esc(q.analysis) + '</div>' +
            '<button class="btn btn-line btn-sm" style="margin-top:12px" onclick="P.removeWrong(' + q.id + ')">移出错题本</button>' +
            '</div>'
          ).join('') +
          '</div>'
          : '<div class="empty"><div class="empty-title">错题本是空的</div>练习和模考中答错的题会出现在这里<a class="btn btn-ghost" style="margin-top:16px" href="#/quiz">去刷题</a></div>')
      );
    }
  });

  P.practiceWrong = () => {
    const wrong = S.wrong();
    const list = Object.keys(wrong).map((qid) => M.questions.find((x) => x.id === Number(qid))).filter(Boolean);
    if (!list.length) { A.toast('错题本是空的'); return; }
    window.__practice = { list, title: '错题练习', idx: 0, right: 0, answers: {}, mode: 'wrong' };
    location.hash = '#/quiz/practice';
  };
  P.removeWrong = (qid) => {
    S.removeWrong(qid);
    A.toast('已移出错题本');
    A.render();
  };

  // ============ 预约 ============
  A.route('signup', {
    title: () => '预约一对一规划',
    render(c) {
      const user = S.user();
      const bid = c.bid ? Number(c.bid) : 0;
      return (
        '<div class="page-head"><div class="page-title">预约一对一规划</div>' +
        '<div class="page-sub">留下信息，老师 1 个工作日内联系你（无需登录）</div></div>' +
        '<div class="section"><div class="card" id="signupCard">' +
        '<div class="field"><div class="field-label">意向业务<span class="req">*</span></div>' +
        '<div class="pick-row" id="bizPick">' +
        '<span class="pick' + (bid === 0 ? ' on' : '') + '" data-id="0">还没想好</span>' +
        M.businesses.map((b) => '<span class="pick' + (bid === b.id ? ' on' : '') + '" data-id="' + b.id + '">' + esc(b.name) + '</span>').join('') +
        '</div></div>' +
        '<div class="field"><div class="field-label">姓名<span class="req">*</span></div><input class="input" id="spName" placeholder="怎么称呼你" /></div>' +
        '<div class="field"><div class="field-label">手机号<span class="req">*</span></div><input class="input num" id="spPhone" type="number" maxlength="11" placeholder="用于老师联系你" value="' + (user ? user.phone : '') + '" /></div>' +
        '<div class="field"><div class="field-label">当前学历</div>' +
        '<div class="pick-row" id="eduPick">' +
        ['高中 / 中专', '大专', '本科', '其他'].map((x, i) => '<span class="pick' + (i === 0 ? '' : '') + '" data-v="' + x + '">' + x + '</span>').join('') +
        '</div></div>' +
        '<div class="field"><div class="field-label">方便接听电话的时间</div>' +
        '<div class="pick-row" id="timePick">' +
        ['工作日白天', '工作日晚上', '周末'].map((x) => '<span class="pick" data-v="' + x + '">' + x + '</span>').join('') +
        '</div></div>' +
        '<div class="field"><div class="field-label">想咨询的问题（选填）</div><textarea class="input" id="spNote" placeholder="比如：初中毕业能不能报成考？"></textarea></div>' +
        '<button class="btn btn-primary btn-block" id="spSubmit" style="margin-top:18px">提交预约</button>' +
        '</div></div>' +
        '<div class="demo-note">演示版：预约记录保存在本机，可在「我的 · 我的预约」查看</div>'
      );
    },
    after(c) {
      let bid = c.bid ? Number(c.bid) : 0;
      let edu = '';
      let time = '';
      document.querySelectorAll('#bizPick .pick').forEach((p) => p.addEventListener('click', () => {
        document.querySelectorAll('#bizPick .pick').forEach((x) => x.classList.remove('on'));
        p.classList.add('on');
        bid = Number(p.dataset.id);
      }));
      document.querySelectorAll('#eduPick .pick').forEach((p) => p.addEventListener('click', () => {
        document.querySelectorAll('#eduPick .pick').forEach((x) => x.classList.remove('on'));
        p.classList.add('on');
        edu = p.dataset.v;
      }));
      document.querySelectorAll('#timePick .pick').forEach((p) => p.addEventListener('click', () => {
        document.querySelectorAll('#timePick .pick').forEach((x) => x.classList.remove('on'));
        p.classList.add('on');
        time = p.dataset.v;
      }));
      document.getElementById('spSubmit').addEventListener('click', async () => {
        const name = document.getElementById('spName').value.trim();
        const phone = document.getElementById('spPhone').value.trim();
        const note = document.getElementById('spNote').value.trim();
        if (!name) return A.toast('请填写姓名');
        if (!/^1\d{10}$/.test(phone)) return A.toast('请填写正确的手机号');
        const localData = {
          type: '预约', bid, bname: bid ? M.businessById(bid).name : '待确定',
          name, phone, edu, time, note
        };
        // 优先走真实后端留资；未登录 / 返回空 / 同步失败时回退本地，保证「我的预约」可见
        let needLocal = true;
        try {
          if (window.YzSync && window.YzSync.online && window.API) {
            const r = await window.API.submitSignup({ name, phone, bid, note, source: 'h5' });
            if (r) {
              const ok = await window.YzSync.hydrateMe({ render: false });
              needLocal = !(ok && S.signups().some((s) => s.phone === phone && s.name === name));
            }
          }
        } catch (e) { /* 回退本地记录 */ }
        if (needLocal) S.addSignup(localData);
        document.getElementById('signupCard').innerHTML =
          '<div style="text-align:center;padding:32px 0">' +
          '<div style="font-size:44px">✓</div>' +
          '<div style="font-size:18px;font-weight:700;margin-top:10px">预约成功</div>' +
          '<div style="font-size:14px;color:var(--text-2);margin-top:8px">老师会在 1 个工作日内电话联系你</div>' +
          '<div style="display:flex;gap:12px;margin-top:20px">' +
          '<a class="btn btn-line" style="flex:1" href="#/signup-list">我的预约</a>' +
          '<a class="btn btn-primary" style="flex:1" href="#/home">回首页</a>' +
          '</div></div>';
      });
    }
  });

  A.route('signup-list', {
    title: () => '我的预约',
    render() {
      const list = S.signups().map((s) => Object.assign({}, s, {
        phoneText: fmt.maskPhone(s.phone),
        timeText: fmt.time(s.createdAt),
        extra: [s.edu, s.time].filter(Boolean).join(' · ')
      }));
      return (
        '<div class="page-head"><div class="page-title">我的预约</div><div class="page-sub">留资记录，老师会逐一回访</div></div>' +
        (list.length
          ? '<div class="section">' + list.map((s) =>
            '<div class="card" style="margin-bottom:12px">' +
            '<div class="r-head"><span style="font-weight:700">' + esc(s.bname || '预约') + '</span>' +
            '<span class="tag tag-warm" style="margin-left:auto">' + esc(s.status) + '</span></div>' +
            '<div style="font-size:14px;margin-top:10px">联系人：' + esc(s.name) + '　<span class="num">' + s.phoneText + '</span></div>' +
            (s.extra ? '<div style="font-size:13px;color:var(--text-2);margin-top:4px">情况：' + esc(s.extra) + '</div>' : '') +
            (s.note ? '<div style="font-size:13px;color:var(--text-2);margin-top:4px">备注：' + esc(s.note) + '</div>' : '') +
            '<div class="r-date num" style="margin-top:8px">提交于 ' + s.timeText + '</div>' +
            '</div>'
          ).join('') + '<div class="demo-note">老师会在 1 个工作日内电话联系你</div></div>'
          : '<div class="empty"><div class="empty-title">还没有预约记录</div>预约后，老师会电话联系你做一对一规划<br><a class="btn btn-ghost" style="margin-top:16px" href="#/signup">去预约规划</a></div>')
      );
    }
  });

  // ============ 登录 ============
  A.route('login', {
    title: () => '登录',
    render() {
      return (
        '<div class="section" style="max-width:420px">' +
        '<div class="card">' +
        '<div class="page-title" style="font-size:20px">登录 / 注册</div>' +
        '<div class="page-sub" style="margin-bottom:8px">手机号登录，五端账户通用</div>' +
        '<div class="field"><div class="field-label">手机号</div><input class="input num" id="lgPhone" type="number" maxlength="11" placeholder="请输入手机号" /></div>' +
        '<div class="field"><div class="field-label">验证码</div>' +
        '<div style="display:flex;gap:12px;align-items:center">' +
        '<input class="input num" id="lgCode" type="number" maxlength="6" placeholder="6 位验证码" style="flex:1" />' +
        '<button class="btn btn-line btn-sm" id="lgCodeBtn" style="width:130px">获取验证码</button>' +
        '</div></div>' +
        '<button class="btn btn-primary btn-block" id="lgSubmit" style="margin-top:18px">登录</button>' +
        '<div class="demo-note" style="padding-bottom:0">演示版验证码为 123456，不产生真实短信</div>' +
        '</div></div>'
      );
    },
    after() {
      let left = 0;
      let timer = null;
      const btn = document.getElementById('lgCodeBtn');
      btn.addEventListener('click', async () => {
        const phone = (document.getElementById('lgPhone').value || '').trim();
        if (!/^1\d{10}$/.test(phone)) return A.toast('请填写正确的手机号');
        if (left > 0) return;
        // 优先走真实后端发码；失败回退本地离线演示
        try {
          if (window.API) {
            const r = await window.API.sendSms(phone);
            A.toast(r && r.devCode ? ('验证码已发送，演示码 ' + r.devCode) : '验证码已发送');
          } else {
            A.toast('离线演示：验证码 123456');
          }
        } catch (e) {
          A.toast(((e && e.message) || '后端未连接') + '，使用离线演示验证码 123456');
        }
        left = 60;
        btn.textContent = left + ' 秒后重发';
        timer = setInterval(() => {
          left--;
          btn.textContent = left + ' 秒后重发';
          if (left <= 0) {
            clearInterval(timer);
            btn.textContent = '获取验证码';
          }
        }, 1000);
      });
      document.getElementById('lgSubmit').addEventListener('click', async () => {
        const phone = (document.getElementById('lgPhone').value || '').trim();
        const code = (document.getElementById('lgCode').value || '').trim();
        if (!/^1\d{10}$/.test(phone)) return A.toast('请填写正确的手机号');
        // 优先走真实后端登录；失败回退本地离线演示登录
        try {
          if (window.API) {
            const r = await window.API.login(phone, code, S.inviter());
            S.login({ phone: phone, nickname: r.nickname, userId: r.userId, token: r.token, role: r.role });
            document.dispatchEvent(new CustomEvent('yz:login'));
            A.toast('登录成功（已接入真实后端）');
            location.hash = '#/mine';
            return;
          }
        } catch (e) {
          A.toast(((e && e.message) || '后端未连接') + '，切换到离线演示登录');
        }
        if (code !== '123456') return A.toast('离线演示验证码为 123456');
        S.login(phone);
        document.dispatchEvent(new CustomEvent('yz:login'));
        A.toast('离线演示登录成功（数据仅保存在本机）');
        location.hash = '#/mine';
      });
    }
  });

  // ============ 学习中心 ============
  A.route('study', {
    title: () => '学习中心',
    render() {
      if (!A.needLogin()) return '';
      const study = S.study();
      const ids = S.ownedIds().filter((id, i, a) => a.indexOf(id) === i);
      let totalDone = 0;
      let totalAll = 0;
      const list = ids.map((id) => {
        const c = A.courseCard(M.courseById(id));
        const done = (study[id] || []).length;
        const all = c.chapters.length;
        totalDone += done;
        totalAll += all;
        return Object.assign(c, { done, all, percent: Math.round((done / all) * 100), finished: done === all });
      });
      return (
        '<div class="page-head"><div class="page-title">学习中心</div>' +
        '<div class="page-sub">报名课程的章节进度，五端同步</div></div>' +
        (list.length
          ? '<div class="section">' +
          '<div class="summary-card" style="margin-bottom:14px">' +
          '<div class="summary-item"><span class="summary-num num">' + list.length + '</span><span class="summary-k">在读课程</span></div>' +
          '<div class="summary-item"><span class="summary-num num">' + totalDone + '</span><span class="summary-k">已学章节</span></div>' +
          '<div class="summary-item"><span class="summary-num num">' + totalAll + '</span><span class="summary-k">总章节</span></div>' +
          '</div>' +
          list.map((c) =>
            '<div class="card" style="margin-bottom:12px;cursor:pointer" onclick="location.hash=\'#/course/' + c.id + '\'">' +
            '<div style="display:flex;gap:12px;align-items:center">' +
            '<span class="mark mark-sm" style="background:' + c.tint + ';color:' + c.color + '">' + c.char + '</span>' +
            '<div style="flex:1;min-width:0"><div style="font-weight:600" class="ellipsis">' + esc(c.title) + '</div>' +
            '<div style="font-size:12px;color:var(--text-3);margin-top:2px">' + c.typeText + ' · ' + esc(c.teacher) + '</div></div>' +
            '<span class="num" style="font-size:13px;color:' + (c.finished ? 'var(--good)' : 'var(--text-3)') + '">' + (c.finished ? '已学完' : c.done + ' / ' + c.all) + '</span>' +
            '</div>' +
            '<div class="exam-progress" style="margin-top:12px"><div class="exam-progress-bar"><div class="exam-progress-in ' + (c.finished ? '' : '') + '" style="width:' + c.percent + '%;' + (c.finished ? 'background:var(--good)' : '') + '"></div></div></div>' +
            '</div>'
          ).join('') + '</div>'
          : '<div class="empty"><div class="empty-title">还没有报名课程</div>报名后的课程和学习进度会显示在这里<br><a class="btn btn-ghost" style="margin-top:16px" href="#/course">去选课</a></div>')
      );
    }
  });

  // ============ 订单 ============
  A.route('order', {
    title: () => '我的订单',
    render() {
      if (!A.needLogin()) return '';
      const orders = S.orders();
      return (
        '<div class="page-head"><div class="page-title">我的订单</div><div class="page-sub">缴费订单与电子收据</div></div>' +
        (orders.length
          ? '<div class="section">' + orders.map((o) => {
            const c = M.courseById(o.courseId);
            const statusText = o.status === 'paid' ? '已付清' : o.status === 'balance' ? '待付尾款' : o.status === 'unpaid' ? '待支付' : '拼团中';
            const statusCls = o.status === 'paid' ? 'tag-good' : (o.status === 'balance' || o.status === 'unpaid') ? 'tag-warm' : 'tag-brand';
            return (
              '<div class="card" style="margin-bottom:12px">' +
              '<div style="display:flex;align-items:center;gap:12px">' +
              '<span class="mark mark-sm" style="background:' + A.courseCard(c).tint + ';color:' + A.courseCard(c).color + '">' + A.courseCard(c).char + '</span>' +
              '<div style="flex:1;min-width:0"><div class="ellipsis" style="font-weight:600">' + esc(o.title) + '</div>' +
              '<div class="num" style="font-size:12px;color:var(--text-3);margin-top:2px">' + o.id + ' · ' + fmt.time(o.createdAt) + '</div></div>' +
              '<span class="tag ' + statusCls + '">' + statusText + '</span>' +
              '</div>' +
              '<div style="display:flex;align-items:baseline;margin-top:10px">' +
              '<span class="price" style="font-size:20px"><span class="price-unit">¥</span>' + fmt.price(o.amount) + '</span>' +
              (o.discount ? '<span class="tag tag-warm" style="margin-left:8px">已减 ¥' + fmt.price(o.discount) + '</span>' : '') +
              '<span style="margin-left:auto;font-size:13px;color:var(--text-3)" class="num">' + (o.plan === 'split' ? '首付 + 尾款 · 已付 ¥' + fmt.price(o.paid) : '一次付清') + '</span>' +
              '</div>' +
              '<div style="display:flex;gap:10px;margin-top:12px">' +
              (o.status === 'balance' ? '<button class="btn btn-primary btn-sm" style="flex:1" onclick="P.payBalance(\'' + o.id + '\')">支付尾款 ¥' + fmt.price(o.amount - o.paid) + '</button>' : '') +
              (o.status === 'group' ? '<a class="btn btn-primary btn-sm" style="flex:1" href="#/group/' + o.id + '">拼团详情</a>' : '') +
              '<a class="btn btn-line btn-sm" style="flex:1" href="#/receipt/' + o.id + '">电子收据</a>' +
              '</div>' +
              '</div>'
            );
          }).join('') + '</div>'
          : '<div class="empty"><div class="empty-title">还没有订单</div>报名课程后这里会显示订单和电子收据<br><a class="btn btn-ghost" style="margin-top:16px" href="#/course">去选课</a></div>')
      );
    }
  });

  P.payBalance = async (id) => {
    try {
      if (!(window.YzSync && window.YzSync.online && window.API)) throw new Error('离线演示');
      await window.API.pay(id);
      await window.YzSync.hydrateMe({ render: false });
      A.toast('尾款支付成功');
    } catch (e) {
      S.payBalance(id);
      A.toast('离线演示：尾款已补付');
    }
    A.render();
  };

  A.route('receipt/:id', {
    title: () => '电子收据',
    render(c) {
      const o = S.order(c.id);
      if (!o) return '<div class="empty-page"><div class="empty-title">收据不存在</div><a class="btn btn-ghost" href="#/order">回订单</a></div>';
      return (
        '<div class="page-head"><div class="page-title">电子收据</div>' +
        '<div class="page-sub num">' + (o.status === 'paid' ? '已付清' : '待付尾款') + ' · ' + o.receiptNo + '</div></div>' +
        '<div class="section"><div class="card">' +
        '<div style="text-align:center;padding:10px 0 18px;border-bottom:1px dashed var(--line)">' +
        '<div style="font-size:13px;color:var(--text-3)">云南自修学校 · 学费收据（演示）</div>' +
        '<div class="detail-price-box" style="justify-content:center;margin-top:8px"><span class="price detail-price"><span class="price-unit">¥</span>' + fmt.price(o.paid) + '</span>' +
        (o.paid < o.amount ? '<span class="price-orig">共 ¥' + fmt.price(o.amount) + '</span>' : '') + '</div>' +
        '</div>' +
        '<div class="row"><span style="color:var(--text-3);font-size:13px;width:88px">课程</span><span class="row-main">' + esc(o.title) + '</span></div>' +
        '<div class="row"><span style="color:var(--text-3);font-size:13px;width:88px">订单号</span><span class="row-main num">' + o.id + '</span></div>' +
        '<div class="row"><span style="color:var(--text-3);font-size:13px;width:88px">收据号</span><span class="row-main num">' + o.receiptNo + '</span></div>' +
        '<div class="row"><span style="color:var(--text-3);font-size:13px;width:88px">手机号</span><span class="row-main num">' + fmt.maskPhone(o.phone) + '</span></div>' +
        '<div class="row"><span style="color:var(--text-3);font-size:13px;width:88px">原价</span><span class="row-main num">¥' + fmt.price(o.listPrice || o.amount) + '</span></div>' +
        (o.discount ? '<div class="row"><span style="color:var(--text-3);font-size:13px;width:88px">优惠</span><span class="row-main num">-¥' + fmt.price(o.discount) + '</span></div>' : '') +
        '<div class="row"><span style="color:var(--text-3);font-size:13px;width:88px">实付</span><span class="row-main num" style="font-weight:700">¥' + fmt.price(o.paid) + (o.paid < o.amount ? '（尾款 ¥' + fmt.price(o.amount - o.paid) + ' 待付）' : '') + '</span></div>' +
        '<div class="row"><span style="color:var(--text-3);font-size:13px;width:88px">方式</span><span class="row-main">' + (o.pay === 'wechat' ? '微信支付' : '支付宝') + ' · ' + (o.plan === 'split' ? '首付 + 尾款' : '一次付清') + '</span></div>' +
        '<div class="row"><span style="color:var(--text-3);font-size:13px;width:88px">时间</span><span class="row-main num">' + fmt.time(o.createdAt) + '</span></div>' +
        '</div>' +

        '<div class="card" style="margin-top:14px;display:flex;align-items:center;gap:14px">' +
        '<div style="flex:1;font-size:14px;color:var(--text-2)">订阅开课 / 考试提醒<br><span style="font-size:12px;color:var(--text-3)">正式版：小程序订阅消息 + 公众号模板消息 + 短信</span></div>' +
        '<button class="btn ' + (S.remind() ? 'btn-line' : 'btn-primary') + ' btn-sm" onclick="P.subscribe()">' + (S.remind() ? '已订阅' : '订阅提醒') + '</button>' +
        '</div>' +

        '<div style="display:flex;gap:12px;margin-top:14px">' +
        '<button class="btn btn-line" style="flex:1" onclick="A.toast(\'演示版：正式版生成 PDF 收据\')">保存收据</button>' +
        (o.status === 'paid' ? '<a class="btn btn-primary" style="flex:1" href="#/study">去学习</a>' : '<a class="btn btn-primary" style="flex:1" href="#/order">回订单</a>') +
        '</div>' +
        '</div>'
      );
    }
  });

  P.subscribe = () => {
    if (S.remind()) return;
    S.setRemind(true);
    A.toast('已订阅开课 / 考试提醒');
    A.render();
  };

  // ============ 我的 ============
  A.route('mine', {
    title: () => '我的',
    render() {
      const user = S.user();
      const orders = S.orders();
      const courseIds = orders.map((o) => o.courseId).filter((id, i, a) => a.indexOf(id) === i);
      const counts = {
        courses: courseIds.length,
        signups: S.signups().length,
        wrong: Object.keys(S.wrong()).length
      };
      const pendingBalance = orders.filter((o) => o.status === 'balance').length;
      const pendingGroup = orders.filter((o) => o.status === 'group').length;
      const couponCount = A.myCoupons().filter((q) => q.state === 'ok').length;

      const menu = (url, name, tag, auth) =>
        '<a class="menu-row" href="' + (auth && !user ? '#/login' : url) + '">' + name +
        (tag ? '<span class="tag ' + tag.cls + '" style="margin-left:auto">' + tag.t + '</span>' : '') +
        '<span class="row-arrow">›</span></a>';

      return (
        '<div class="mine-head">' +
        '<span class="mine-avatar">' + (user ? '学' : '') + '</span>' +
        (user
          ? '<div style="flex:1"><div class="mine-name num">学员 ' + fmt.maskPhone(user.phone) + '</div>' +
          '<div class="mine-sub">' + fmt.time(user.since).slice(0, 10) + ' 加入 · 五端账户通用</div></div>'
          : '<div style="flex:1"><a class="mine-name" href="#/login" style="display:block">登录 / 注册</a>' +
          '<div class="mine-sub">登录后查看课程、订单和学习进度</div></div>') +
        '</div>' +

        '<div class="section">' +
        '<div class="counts">' +
        '<a class="count" href="' + (user ? '#/study' : '#/login') + '"><span class="count-num num">' + counts.courses + '</span><span class="count-k">我的课程</span></a>' +
        '<a class="count" href="#/signup-list"><span class="count-num num">' + counts.signups + '</span><span class="count-k">我的预约</span></a>' +
        '<a class="count" href="#/quiz/errors"><span class="count-num num">' + counts.wrong + '</span><span class="count-k">错题</span></a>' +
        '</div>' +

        '<div class="card menu">' +
        menu('#/study', '学习中心', null, true) +
        menu('#/order', '我的订单', pendingBalance ? { cls: 'tag-warm', t: pendingBalance + ' 笔待付尾款' } : pendingGroup ? { cls: 'tag-brand', t: pendingGroup + ' 个拼团中' } : null, true) +
        menu('#/signup-list', '我的预约') +
        menu('#/quiz/errors', '错题本') +
        menu('#/materials', '备考资料') +
        '</div>' +

        '<div class="card menu">' +
        menu('#/invite', '邀请有礼', { cls: 'tag-bad', t: '推荐好友赚奖励' }, true) +
        menu('#/coupon', '优惠券', couponCount ? { cls: '', t: couponCount + ' 张可用' } : null) +
        menu('#/poster', '专属海报') +
        '</div>' +

        '<div class="card menu">' +
        menu('#/service', '在线客服') +
        '<a class="menu-row" href="tel:19908883061">咨询热线<span class="num" style="margin-left:auto;color:var(--text-3)">199-0888-3061</span><span class="row-arrow">›</span></a>' +
        menu('#/about', '关于我们') +
        menu('#/admin', '管理后台', { cls: 'tag-brand', t: '演示' }) +
        '</div>' +

        (user
          ? '<div style="display:flex;gap:12px;margin-top:14px">' +
          '<button class="btn btn-line" style="flex:1" onclick="P.logout()">退出登录</button>' +
          '<button class="btn btn-line" style="flex:1" onclick="P.resetDemo()">重置演示数据</button>' +
          '</div>'
          : '<a class="btn btn-primary btn-block" style="margin-top:14px" href="#/login">登录 / 注册</a>') +

        '<div class="demo-note">演示版本 · 数据仅保存在本机（localStorage）</div>' +
        '</div>'
      );
    }
  });

  P.logout = () => {
    A.confirmDialog({ title: '退出登录', content: '退出后可用手机号重新登录', confirmText: '退出' }).then((ok) => {
      if (!ok) return;
      S.logout();
      A.toast('已退出登录');
      A.render();
    });
  };

  P.resetDemo = () => {
    A.confirmDialog({
      title: '重置演示数据',
      content: '将清空登录、订单、预约、做题记录、优惠券和推广记录',
      confirmText: '清空',
      cancelText: '取消'
    }).then((ok) => {
      if (!ok) return;
      S.resetAll();
      A.toast('已重置');
      A.render();
    });
  };

  // ============ 领券中心 ============
  A.route('coupon', {
    title: () => '领券中心',
    render() {
      const claimed = S.coupons().map((m) => m.tid);
      return (
        '<div class="page-head"><div class="page-title">领券中心</div><div class="page-sub">分业务发放，下单自动抵扣</div></div>' +
        '<div class="section"><div class="biz-list">' +
        M.coupons.map((q) => {
          const card = A.couponCard(q);
          const got = claimed.indexOf(q.id) > -1;
          return (
            '<div class="biz-item">' +
            '<div style="width:120px;flex-shrink:0;text-align:center;border-right:1px dashed var(--line);padding-right:14px">' +
            '<div class="price" style="font-size:30px"><span class="price-unit">¥</span>' + card.amountText + '</div>' +
            '<div style="font-size:11px;color:var(--text-3)">满 ' + card.minText + ' 可用</div>' +
            '</div>' +
            '<div class="biz-item-main">' +
            '<div class="biz-item-name">' + esc(q.name) + '</div>' +
            '<div class="biz-item-sum">' + esc(card.scopeText) + ' · 领取后 ' + q.days + ' 天有效</div>' +
            '<button class="btn ' + (got ? 'btn-line' : 'btn-primary') + ' btn-sm" style="margin-top:10px" onclick="P.claim(\'' + q.id + '\')">' + (got ? '已领取' : '立即领取') + '</button>' +
            '</div></div>'
          );
        }).join('') +
        '</div></div>' +
        '<div class="demo-note">演示版：领取后可在课程下单页选择使用</div>'
      );
    }
  });

  P.claim = async (tid) => {
    const q = M.coupons.find((x) => x.id === tid);
    try {
      if (window.YzSync && window.YzSync.online && window.API && q && q.backendId != null) {
        await window.API.claimCoupon(q.backendId);
        await window.YzSync.hydrateMe({ render: false });
        A.toast('领取成功，下单时可用');
        A.render();
        return;
      }
    } catch (e) { /* 回退本地领券 */ }
    if (S.claimCoupon(tid)) A.toast('离线演示：领取成功，下单时可用');
    else A.toast('已经领取过这张券了');
    A.render();
  };

  // ============ 邀请有礼 ============
  A.route('invite', {
    title: () => '邀请有礼',
    render() {
      const user = S.user();
      if (!user) return '';
      const code = A.inviteCode(user.phone);
      const records = S.referrals().map((r) => Object.assign({}, r, {
        reward: r.status === 'paid' ? A.rewardOf(r.paid, r.level) : 0
      }));
      const totalReward = records.reduce((s, r) => s + r.reward, 0);
      const balance = totalReward - S.withdrawn();
      const promo = S.promo();
      return (
        '<div class="page-head"><div class="page-title">邀请有礼</div>' +
        '<div class="page-sub">好友通过你的邀请报名，你得实付金额 5%（二级 2%）</div></div>' +

        '<div class="section"><div class="card" style="text-align:center">' +
        '<div style="font-size:13px;color:var(--text-3)">我的邀请码</div>' +
        '<div class="num" style="font-size:32px;font-weight:800;letter-spacing:2px;margin-top:6px">' + code + '</div>' +
        '<div style="display:flex;gap:12px;margin-top:14px">' +
        '<button class="btn btn-line" style="flex:1" onclick="P.copyCode(\'' + code + '\')">复制邀请码</button>' +
        '<a class="btn btn-primary" style="flex:1" href="#/poster">生成海报</a>' +
        '</div>' +
        '</div></div>' +

        '<div class="section"><div class="summary-card">' +
        '<div class="summary-item"><span class="summary-num num">' + promo.shares + '</span><span class="summary-k">分享次数</span></div>' +
        '<div class="summary-item"><span class="summary-num num">' + promo.visits + '</span><span class="summary-k">访问人数</span></div>' +
        '<div class="summary-item"><span class="summary-num num">' + promo.leads + '</span><span class="summary-k">留资线索</span></div>' +
        '</div></div>' +

        '<div class="section"><div class="card" style="display:flex;align-items:center;gap:14px">' +
        '<div style="flex:1"><div style="font-size:13px;color:var(--text-3)">可提现奖励（元）</div>' +
        '<div class="price num" style="font-size:30px">' + fmt.price(Math.max(0, balance)) + '</div></div>' +
        '<button class="btn btn-primary" onclick="P.withdraw(' + Math.max(0, balance) + ')">提现</button>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--text-3);margin-top:8px">累计奖励 ¥' + fmt.price(totalReward) + ' · 已提现 ¥' + fmt.price(S.withdrawn()) + ' · 演示版不真实到账</div>' +
        '</div>' +

        '<div class="section"><div class="section-head"><span class="section-title">推荐记录</span>' +
        '<button class="btn btn-ghost btn-sm" onclick="P.simFriend()">演示：模拟一位好友报名</button></div>' +
        '<div class="card">' +
        (records.length ? records.map((r) =>
          '<div class="row"><span class="row-main"><span style="font-size:14px">' + esc(r.name) + '</span>' +
          '<span class="tag ' + (r.level === 1 ? 'tag-brand' : '') + '" style="margin-left:8px">' + (r.level === 1 ? '一级' : '二级') + '</span><br>' +
          '<span style="font-size:12px;color:var(--text-3)">' + esc(r.course) + ' · ' + r.date + '</span></span>' +
          '<span style="text-align:right"><span class="price num">+¥' + fmt.price(r.reward) + '</span><br>' +
          '<span class="tag ' + (r.status === 'paid' ? 'tag-good' : 'tag-warm') + '">' + (r.status === 'paid' ? '已报名' : '已留资') + '</span></span></div>'
        ).join('') : '<div class="empty" style="padding:32px 0">还没有推荐记录</div>') +
        '</div></div>' +

        '<div class="demo-note">好友通过分享链接进入会带上 inviter 参数；提现、退款不会真实发生</div>'
      );
    },
    after() {
      if (!A.needLogin()) location.hash = '#/login';
    }
  });

  P.copyCode = (code) => {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); A.toast('邀请码已复制'); } catch (e) { A.toast(code); }
    ta.remove();
  };

  P.simFriend = () => {
    const user = S.user();
    if (!user) return;
    S.addReferral({ name: '新同学', course: '专升本集训营', paid: 5980, level: 1, status: 'paid', date: fmt.time(Date.now()).slice(0, 10) });
    const promo = S.promo();
    promo.leads += 1;
    promo.visits += 3;
    A.toast('好友已通过你的海报报名，奖励 +¥' + A.rewardOf(5980, 1));
    A.render();
  };

  P.withdraw = async (amount) => {
    if (amount <= 0) return A.toast('暂无可提现奖励');
    const ok = await A.confirmDialog({ title: '提现', content: '提现 ¥' + fmt.price(amount) + ' 到绑定账户？', confirmText: '提现' });
    if (!ok) return;
    let online = false;
    try {
      if (window.YzSync && window.YzSync.online && window.API) {
        const account = (S.user() && S.user().phone) || '微信零钱';
        await window.API.withdraw(window.YzSync.fen(amount), account);
        await window.YzSync.hydrateMe({ render: false });
        online = true;
        A.toast('提现申请已提交');
      }
    } catch (e) { /* 回退本地提现 */ }
    if (!online) {
      S.withdraw(amount);
      A.toast('离线演示：提现申请已提交');
    }
    A.render();
  };

  // ============ 专属海报 ============
  A.route('poster', {
    title: () => '专属海报',
    render() {
      const user = S.user();
      if (!user) return '';
      const code = A.inviteCode(user.phone);
      return (
        '<div class="page-head"><div class="page-title">专属海报</div>' +
        '<div class="page-sub">分享海报带你的邀请码，好友报名你得奖励</div></div>' +
        '<div class="section">' +
        '<div class="card" style="max-width:360px;margin:0 auto;text-align:center;background:linear-gradient(160deg,#17359A,#2350D8);color:#fff;padding:40px 28px">' +
        '<div style="font-size:13px;letter-spacing:3px;opacity:0.75">云南自修学校</div>' +
        '<div style="font-size:24px;font-weight:800;margin-top:12px;line-height:1.4">学历提升 · 公考考研\n出国留学一站式服务</div>' +
        '<div style="font-size:13px;margin-top:14px;opacity:0.85">六大业务板块 · 五站合一数据互通</div>' +
        '<div style="background:rgba(255,255,255,0.16);border-radius:12px;padding:14px;margin-top:20px">' +
        '<div style="font-size:12px;opacity:0.8">我的邀请码</div>' +
        '<div class="num" style="font-size:26px;font-weight:800;letter-spacing:2px">' + code + '</div>' +
        '</div>' +
        '<div style="font-size:11px;margin-top:16px;opacity:0.7">示意海报 · 正式版由后台生成带邀请参数的小程序码</div>' +
        '</div>' +
        '<div style="display:flex;gap:12px;margin-top:16px;max-width:360px;margin-left:auto;margin-right:auto">' +
        '<button class="btn btn-line" style="flex:1" onclick="P.copyCode(\'' + code + '\')">复制邀请码</button>' +
        '<button class="btn btn-primary" style="flex:1" onclick="A.toast(\'演示版：正式版保存海报到相册\')">保存海报</button>' +
        '</div>' +
        '</div>' +
        '<div class="demo-note">演示版为静态示意；正式版按学校品牌与课程自动生成海报</div>'
      );
    },
    after() {
      if (!A.needLogin()) location.hash = '#/login';
    }
  });

  // ============ 在线客服 ============
  const RULES = [
    { keys: ['报名', '怎么报', '流程', '付费'], reply: '报名很方便：选好课程后点「立即报名」，用手机号登录，选一次付清或「首付 + 尾款」，在线支付即可。报名后课程章节全部解锁。' },
    { keys: ['试听', '试看', '试课'], reply: '大部分课程都有试听章节，课程目录里标了「可试听」的章节点开就能看，不需要先付费。' },
    { keys: ['分期', '尾款', '付款', '支付', '学费', '价格', '多少钱'], reply: '支持一次付清和「首付 + 尾款」两种方式，尾款在「我的 · 我的订单」里补付。领券中心的券下单时可直接抵扣。' },
    { keys: ['校区', '地址', '在哪', '位置'], reply: '目前有昆明总校和呈贡学习中心两个校区，具体地址可以在「关于我们 · 校区环境」里查看，也可以直接打 199-0888-3061 问路。' },
    { keys: ['资料', '真题', '下载', '讲义'], reply: '「我的 · 备考资料」里可以下载历年真题、政策文件和讲义；标了「学员专享」的需要登录后下载。' },
    { keys: ['自考', '加分'], reply: '云南自考助学加分政策、大小自考区别，可以看「业务 · 自考助学」页面，也可以留下手机号让老师电话详细讲。' },
    { keys: ['专升本', '升本'], reply: '统招专升本有政策解读、历年分数线、集训营和志愿填报指导，「业务 · 统招专升本」页面能看到完整服务内容。' },
    { keys: ['公考', '省考', '国考', '事业单位', '教师编'], reply: '公考 / 事业单位板块有招考公告、笔试面试特训、历年真题下载和面试模拟预约，老师会一对一指导选岗。' },
    { keys: ['考研'], reply: '考研板块覆盖择校择专业、公共课 / 专业课、复试调剂和集训营，可以先预约一次免费的择校沟通。' },
    { keys: ['留学', '雅思', '托福', '签证'], reply: '出国留学板块提供多国申请、雅思托福培训和签证指导，「业务 · 出国留学」页面可预约一对一留学规划。' },
    { keys: ['人工', '老师', '电话'], reply: '工作时间可以打咨询热线 199-0888-3061，或在「我的」页面预约一对一规划，老师会在 1 个工作日内联系你。' }
  ];
  const FALLBACK = '这个问题已记录，客服老师会尽快回复。你也可以拨打咨询热线 199-0888-3061，或在「我的」里预约一对一规划，老师 1 个工作日内联系你。';
  const QUICK = ['怎么报名？', '课程能试听吗？', '学费能分期吗？', '校区在哪里？', '资料怎么下载？'];

  A.route('service', {
    title: () => '在线客服',
    render() {
      const msgs = window.__chat || [{ who: '客服小自', text: '你好，我是云南自修学校的在线客服（演示版自动回复）。选下面的常见问题，或直接输入你的问题。', me: false }];
      window.__chat = msgs;
      return (
        '<div class="chat-page">' +
        '<div class="chat-list" id="chatList">' +
        msgs.map((m) =>
          '<div class="chat-msg">' +
          '<span class="chat-avatar ' + (m.me ? 'me' : 's') + '">' + (m.me ? '我' : '修') + '</span>' +
          '<div class="chat-bubble ' + (m.me ? 'me' : 's') + '">' + esc(m.text) + '</div>' +
          '</div>'
        ).join('') +
        '</div>' +
        '<div class="chat-quick">' + QUICK.map((q) => '<span class="chat-q" onclick="P.ask(\'' + q + '\')">' + q + '</span>').join('') + '</div>' +
        '<div class="chat-inputbar">' +
        '<input class="chat-input" id="chatInput" placeholder="输入你的问题" />' +
        '<button class="chat-send" onclick="P.sendChat()">发送</button>' +
        '</div>' +
        '<div class="demo-note" style="padding-bottom:0">演示版自动回复；正式版接入第三方客服系统实时接待</div>' +
        '</div>'
      );
    },
    after() {
      const list = document.getElementById('chatList');
      list.scrollTop = list.scrollHeight;
      const input = document.getElementById('chatInput');
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') P.sendChat(); });
    }
  });

  P.chatPush = (text, me) => {
    const msgs = window.__chat || [];
    msgs.push({ who: me ? '我' : '客服小自', text, me: !!me });
    window.__chat = msgs;
  };
  P.sendChat = async () => {
    const input = document.getElementById('chatInput');
    // 输入框可能不在当前 DOM（例如路由已切换），做空值保护避免 undefined.trim()
    const text = ((input && input.value) || '').trim();
    if (!text) return;
    input.value = '';
    P.chatPush(text, true);
    A.render();
    setTimeout(() => {
      const hit = RULES.find((r) => r.keys.some((k) => text.indexOf(k) > -1));
      P.chatPush(hit ? hit.reply : FALLBACK, false);
      A.render();
    }, 500);
    // 留言同步到后端；失败保留本地演示记录（聊天消息已 push）
    try {
      if (window.YzSync && window.YzSync.online && window.API && window.API.postMessage) {
        const phone = (S.user() && S.user().phone) || '';
        await window.API.postMessage(phone, text);
      }
    } catch (e) { /* 回退本地记录 */ }
  };
  P.ask = (q) => {
    P.chatPush(q, true);
    A.render();
    setTimeout(() => {
      const hit = RULES.find((r) => r.keys.some((k) => q.indexOf(k) > -1));
      P.chatPush(hit ? hit.reply : FALLBACK, false);
      A.render();
    }, 500);
  };

  // ============ 名师详情（弹层） ============
  P.teacherDetail = (id) => {
    const t = M.teachers.find((x) => x.id === id);
    const b = M.businessById(t.bid);
    const cs = M.courses.filter((c) => c.bid === t.bid);
    const mask = A.openSheet(
      '<div class="sheet-title">' + esc(t.name) + ' · ' + esc(t.title) + '</div>' +
      '<div class="card" style="display:flex;gap:14px;align-items:center;margin-bottom:14px">' +
      '<span class="t-avatar" style="background:' + b.tint + ';color:' + b.color + '">' + esc(t.name.slice(0, 1)) + '</span>' +
      '<div><div class="num" style="font-weight:700">' + t.years + ' 年教龄 · 累计学员 ' + t.students + '</div>' +
      '<div style="font-size:13px;color:var(--text-3);margin-top:2px">' + esc(b.name) + '</div></div>' +
      '</div>' +
      '<div class="t-tags" style="margin-bottom:14px">' + t.tags.map((x) => '<span class="tag">' + esc(x) + '</span>').join('') + '</div>' +
      '<div class="block-label">老师简介</div><div class="block-text">' + esc(t.intro) + '</div>' +
      '<div class="block-label gap">主讲课程</div>' +
      '<div class="card course-card" style="padding:6px 0">' + cs.map((c) => courseRowHtml(c)).join('') + '</div>' +
      '<button class="btn btn-primary btn-block" style="margin-top:16px" onclick="A.closeSheet(document.querySelector(\'.mask\'))">知道了</button>'
    );
    return mask;
  };

  // ============ 资料下载 ============
  // 与 pages.js 的 materials 事件委托逻辑一致：在线调后端解锁，失败/离线回退本地记录
  P.downloadMat = async (id) => {
    const m = M.materials.find((x) => x.id === id);
    if (m.member && !S.user()) {
      A.confirmDialog({ title: '学员专享资料', content: '这份资料仅对报名学员开放，登录后即可下载', confirmText: '去登录' }).then((ok) => {
        if (ok) location.hash = '#/login';
      });
      return;
    }
    try {
      if (window.YzSync && window.YzSync.online && window.API && window.API.downloadMaterial) {
        const r = await window.API.downloadMaterial(id);
        S.addDownload(id);
        const url = r && r.fileUrl;
        A.toast(url ? ('资料已解锁：' + url) : '资料已解锁');
      } else {
        S.addDownload(id);
        A.toast('离线演示：已记录下载 ' + m.name);
      }
    } catch (e) {
      S.addDownload(id);
      A.toast('后端未连接，使用离线演示下载 ' + m.name);
    }
    A.render();
  };

  // 便捷入口：首页搜索框跳课程列表
  P.goSearch = () => { location.hash = '#/course'; };

  // ============ 管理端（登录 / 后台） ============
  // render 为同步函数，数据缓存在 window.__admin；新增点击函数统一挂 window.P，前缀 P.admin*
  const ADMIN_ORDER_STATUS = [
    { v: '', t: '全部状态' },
    { v: 'unpaid', t: '待支付' },
    { v: 'paid', t: '已付清' },
    { v: 'part_paid', t: '部分支付' },
    { v: 'group', t: '拼团中' }
  ];
  const ADMIN_SIGNUP_STATUS = [
    { v: 'new', t: '待回访' },
    { v: 'contacted', t: '已联系' },
    { v: 'followed', t: '跟进中' },
    { v: 'converted', t: '已报名' },
    { v: 'closed', t: '已关闭' }
  ];
  const ADMIN_STATUS_CN = {
    '待回访': 'new', '已联系': 'contacted', '跟进中': 'followed',
    '已报名': 'converted', '已关闭': 'closed'
  };

  const adminVal = (v) => {
    if (v == null) return '';
    if (typeof v === 'object') { try { return JSON.stringify(v); } catch (e) { return String(v); } }
    return String(v);
  };
  const adminSignupStatusVal = (s) => {
    const v = String(s == null ? '' : s);
    if (ADMIN_STATUS_CN[v]) return ADMIN_STATUS_CN[v];
    return ADMIN_SIGNUP_STATUS.some((o) => o.v === v) ? v : 'new';
  };
  // 通用键值表格：字段名不确定时按并集列头展示，所有插值统一 esc
  const adminTable = (rows, emptyText) => {
    const list = Array.isArray(rows)
      ? rows
      : (rows && typeof rows === 'object' ? Object.keys(rows).map((k) => ({ 项目: k, 数值: rows[k] })) : []);
    if (!list.length) return '<div class="card"><div class="empty">' + esc(emptyText || '暂无数据') + '</div></div>';
    const keys = [];
    list.forEach((r) => {
      const o = (r && typeof r === 'object') ? r : { 值: r };
      Object.keys(o).forEach((k) => { if (keys.indexOf(k) === -1) keys.push(k); });
    });
    return (
      '<div class="card" style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">' +
      '<thead><tr>' + keys.map((k) => '<th style="text-align:left;padding:8px;border-bottom:1px solid var(--line);white-space:nowrap">' + esc(k) + '</th>').join('') + '</tr></thead>' +
      '<tbody>' + list.map((r) => {
        const o = (r && typeof r === 'object') ? r : { 值: r };
        return '<tr>' + keys.map((k) => '<td style="padding:8px;border-bottom:1px solid var(--line)">' + esc(adminVal(o[k])) + '</td>').join('') + '</tr>';
      }).join('') + '</tbody></table></div>'
    );
  };
  const adminSignupRows = (signups) => {
    if (!signups.length) return '<div class="card"><div class="empty">暂无线索</div></div>';
    return '<div class="card">' + signups.map((s) => {
      const id = adminVal(s.id != null ? s.id : '');
      const name = adminVal(s.name);
      const phone = adminVal(s.phone);
      const cur = adminSignupStatusVal(s.status);
      const selId = 'admSp_' + String(id).replace(/[^A-Za-z0-9_-]/g, '');
      return (
        '<div class="row" style="align-items:center;flex-wrap:wrap;gap:8px">' +
        '<span class="row-main"><b>' + esc(name) + '</b> <span class="num">' + esc(phone) + '</span><br>' +
        '<span class="num" style="font-size:12px;color:var(--text-3)">#' + esc(id) + '</span></span>' +
        '<select class="input" style="width:auto;min-width:110px" id="' + esc(selId) + '" data-sid="' + esc(id) + '">' +
        ADMIN_SIGNUP_STATUS.map((o) => '<option value="' + o.v + '"' + (o.v === cur ? ' selected' : '') + '>' + esc(o.t) + '</option>').join('') +
        '</select>' +
        '<button class="btn btn-primary btn-sm" onclick="P.adminSaveSignup(\'' + esc(selId) + '\')">保存</button>' +
        '</div>'
      );
    }).join('') + '</div>';
  };
  const adminDownloadCsv = (text, filename) => {
    try {
      const blob = new Blob([text || ''], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      A.toast('导出失败');
    }
  };

  window.__admin = {
    loading: false, loaded: false, stats: {}, business: [], orders: [], signups: [],
    error: '', offline: false, status: ''
  };

  A.route('admin-login', {
    title: () => '管理端登录',
    render() {
      return (
        '<div class="section" style="max-width:420px">' +
        '<div class="card">' +
        '<div class="page-title" style="font-size:20px">管理后台登录</div>' +
        '<div class="page-sub" style="margin-bottom:8px">演示账号 13900000000 / 123456</div>' +
        '<div class="field"><div class="field-label">手机号</div><input class="input num" id="adPhone" type="number" maxlength="11" placeholder="请输入管理员手机号" value="13900000000" /></div>' +
        '<div class="field"><div class="field-label">密码</div><input class="input" id="adPwd" type="password" placeholder="请输入密码" value="123456" /></div>' +
        '<button class="btn btn-primary btn-block" id="adSubmit" style="margin-top:18px">登录管理端</button>' +
        '<div class="demo-note" style="padding-bottom:0">演示账号：13900000000 / 123456；离线时仅可查看演示入口</div>' +
        '</div></div>'
      );
    },
    after() {
      document.getElementById('adSubmit').addEventListener('click', async () => {
        const phone = (document.getElementById('adPhone').value || '').trim();
        const pwd = (document.getElementById('adPwd').value || '').trim();
        if (!phone || !pwd) return A.toast('请填写手机号和密码');
        const btn = document.getElementById('adSubmit');
        btn.disabled = true;
        try {
          if (!window.API) throw new Error('后端未连接');
          // 登录接口属于 /auth/*，用干净的用户域（不使用旧 admin token）
          window.API.setAdminMode(false);
          const r = await window.API.adminLogin(phone, pwd);
          if (!r || !r.token) throw new Error('登录失败：未返回令牌');
          window.API.setAdminToken(r.token);
          A.toast('管理端登录成功');
          location.hash = '#/admin';
        } catch (e) {
          btn.disabled = false;
          A.toast((e && e.message) || '管理端登录失败');
        }
      });
    }
  });

  A.route('admin', {
    title: () => '管理后台',
    render() {
      const a = window.__admin || {};
      if (!window.API || !window.API.hasAdminToken()) {
        return (
          '<div class="page-head"><div class="page-title">管理后台</div><div class="page-sub">五站合一运营管理</div></div>' +
          '<div class="section"><div class="card" style="text-align:center;padding:32px">' +
          '<div class="empty-title">请先登录管理端</div>' +
          '<a class="btn btn-primary" style="margin-top:16px" href="#/admin-login">去登录</a>' +
          '</div></div>'
        );
      }
      if (a.loading) {
        return (
          '<div class="page-head"><div class="page-title">管理后台</div><div class="page-sub">五站合一运营管理</div></div>' +
          '<div class="section"><div class="card" style="text-align:center;padding:32px">数据加载中…</div></div>'
        );
      }
      const stats = a.stats || {};
      const business = a.business || [];
      const orders = a.orders || [];
      const signups = a.signups || [];
      const flag = a.offline ? '<span class="tag tag-warm" style="margin-left:8px">离线数据</span>' : '';
      const statHtml = Object.keys(stats).length
        ? '<div class="summary-card">' + Object.keys(stats).map((k) =>
            '<div class="summary-item"><span class="summary-num num">' + esc(adminVal(stats[k])) + '</span><span class="summary-k">' + esc(k) + '</span></div>'
          ).join('') + '</div>'
        : '<div class="card"><div class="empty">暂无统计' + flag + '</div></div>';
      return (
        '<div class="page-head"><div class="page-title">管理后台</div>' +
        '<div class="page-sub">五站合一运营管理' + flag + '</div></div>' +
        '<div class="section">' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">' +
        '<button class="btn btn-line btn-sm" onclick="P.adminRefresh()">刷新</button>' +
        '<button class="btn btn-line btn-sm" onclick="P.adminExportOrders()">导出订单 CSV</button>' +
        '<button class="btn btn-line btn-sm" onclick="P.adminExportSignups()">导出线索 CSV</button>' +
        '<button class="btn btn-line btn-sm" onclick="P.adminLogout()">退出管理端</button>' +
        '</div>' +
        '<div class="section-head"><span class="section-title">经营概览</span></div>' + statHtml +
        '<div class="section-head" style="margin-top:18px"><span class="section-title">分板块营收</span></div>' + adminTable(business, '暂无分板块数据') +
        '<div class="section-head" style="margin-top:18px"><span class="section-title">订单</span></div>' +
        '<div class="card" style="margin-bottom:12px"><div class="field"><div class="field-label">状态筛选</div>' +
        '<select class="input" id="admOrderStatus" onchange="P.adminFilterOrders(this.value)">' +
        ADMIN_ORDER_STATUS.map((o) => '<option value="' + o.v + '"' + ((a.status || '') === o.v ? ' selected' : '') + '>' + esc(o.t) + '</option>').join('') +
        '</select></div></div>' +
        adminTable(orders, '暂无订单') +
        '<div class="section-head" style="margin-top:18px"><span class="section-title">招生线索</span></div>' +
        adminSignupRows(signups) +
        (a.error ? '<div class="demo-note">' + esc(a.error) + '</div>' : '') +
        '</div>'
      );
    },
    after() {
      if (!window.API) return;
      window.API.setAdminMode(true);
      const a = window.__admin;
      if (!window.API.hasAdminToken()) return;
      if (a.loading || a.loaded) return; // 避免 render → after → A.render 无限重复拉取
      P.adminLoad();
    }
  });

  P.adminLoad = async () => {
    const a = window.__admin;
    if (a.loading) return;
    a.loading = true;
    a.error = '';
    A.render(); // 切换为「加载中」，其 after() 因 loading=true 直接返回
    try {
      window.API.setAdminMode(true);
      const [stats, business, orders, signups] = await Promise.all([
        window.API.adminStats(),
        window.API.adminStatsBusiness(),
        window.API.adminOrders(a.status),
        window.API.adminSignups()
      ]);
      a.stats = stats || {};
      a.business = business || [];
      a.orders = Array.isArray(orders) ? orders : (orders && orders.list) || [];
      a.signups = Array.isArray(signups) ? signups : (signups && signups.list) || [];
      a.offline = false;
    } catch (e) {
      // 任一下游失败：订单 / 线索降级到本机 Store，并标注离线数据
      a.stats = a.stats || {};
      a.business = a.business || [];
      a.orders = S.orders();
      a.signups = S.signups();
      a.offline = true;
      a.error = ((e && e.message) || '后端未连接') + '，当前展示离线数据';
    }
    a.loading = false;
    a.loaded = true;
    A.render(); // 渲染缓存数据，其 after() 因 loaded=true 直接返回
  };

  P.adminRefresh = () => {
    const a = window.__admin;
    a.loaded = false;
    a.loading = false;
    a.error = '';
    P.adminLoad();
  };

  P.adminFilterOrders = async (status) => {
    const a = window.__admin;
    a.status = status || '';
    try {
      if (window.API && window.API.hasAdminToken()) {
        window.API.setAdminMode(true);
        const rows = await window.API.adminOrders(a.status);
        a.orders = Array.isArray(rows) ? rows : (rows && rows.list) || [];
        a.offline = false;
      } else {
        a.orders = S.orders();
        a.offline = true;
      }
    } catch (e) {
      a.orders = S.orders();
      a.offline = true;
      a.error = '订单加载失败，展示离线数据';
    }
    A.render();
  };

  P.adminSaveSignup = async (selId) => {
    const sel = document.getElementById(selId);
    if (!sel) return;
    const id = sel.getAttribute('data-sid') || '';
    const status = sel.value;
    let ok = false;
    try {
      if (window.API && window.API.hasAdminToken()) {
        window.API.setAdminMode(true);
        await window.API.adminUpdateSignup(id, status);
        ok = true;
      }
    } catch (e) { /* 回退本地演示 */ }
    const a = window.__admin;
    const row = (a.signups || []).find((s) => String(s.id) === String(id));
    if (row) row.status = status;
    A.toast(ok ? '线索状态已保存' : '离线演示：状态仅保存在本机');
    A.render();
  };

  P.adminExportOrders = async () => {
    try {
      if (!window.API) throw new Error('后端未连接');
      window.API.setAdminMode(true);
      const csv = await window.API.exportOrdersCsv();
      adminDownloadCsv(csv, 'orders.csv');
      A.toast('订单 CSV 已导出');
    } catch (e) {
      A.toast((e && e.message) || '订单导出失败');
    }
  };

  P.adminExportSignups = async () => {
    try {
      if (!window.API) throw new Error('后端未连接');
      window.API.setAdminMode(true);
      const csv = await window.API.exportSignupsCsv();
      adminDownloadCsv(csv, 'signups.csv');
      A.toast('线索 CSV 已导出');
    } catch (e) {
      A.toast((e && e.message) || '线索导出失败');
    }
  };

  P.adminLogout = () => {
    if (window.API) {
      window.API.setAdminMode(false);
      window.API.setAdminToken(null);
    }
    window.__admin = {
      loading: false, loaded: false, stats: {}, business: [], orders: [], signups: [],
      error: '', offline: false, status: ''
    };
    location.hash = '#/home';
  };

  // 离开管理端页面时重置 adminMode，避免污染用户端 token 域
  window.addEventListener('hashchange', () => {
    if (window.API && location.hash.indexOf('#/admin') !== 0) {
      window.API.setAdminMode(false);
    }
  });
})();
