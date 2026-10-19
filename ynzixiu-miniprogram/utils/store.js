// 本地存储：演示版用它代替后端。正式版把这些函数换成接口请求即可。
const K = {
  user: 'yz_user',
  signups: 'yz_signups',
  orders: 'yz_orders',
  records: 'yz_quiz_records',
  wrong: 'yz_wrong',
  study: 'yz_study',
  reminders: 'yz_live_reminders',
  coupons: 'yz_my_coupons',
  groups: 'yz_my_groups',
  withdraws: 'yz_withdraws',
  readMsgs: 'yz_read_msgs'
};

function get(key, fallback) {
  try {
    const v = wx.getStorageSync(key);
    return v === '' || v === undefined || v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

function set(key, value) {
  try { wx.setStorageSync(key, value); } catch (e) {}
}

function uid(prefix) {
  return prefix + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
}

module.exports = {
  // 账号
  user: () => get(K.user, null),
  login(phone) {
    const user = { phone, since: Date.now() };
    set(K.user, user);
    return user;
  },
  logout() { try { wx.removeStorageSync(K.user); } catch (e) {} },

  // 预约留资（不要求登录）
  signups: () => get(K.signups, []),
  addSignup(data) {
    const list = get(K.signups, []);
    const item = Object.assign({ id: uid('S'), createdAt: Date.now(), status: '待回访' }, data);
    list.unshift(item);
    set(K.signups, list);
    return item;
  },

  // 订单
  orders: () => get(K.orders, []),
  order: (id) => get(K.orders, []).find((o) => o.id === id),
  addOrder(data) {
    const list = get(K.orders, []);
    const item = Object.assign({ id: uid('YZ'), receiptNo: uid('R'), createdAt: Date.now() }, data);
    list.unshift(item);
    set(K.orders, list);
    return item;
  },
  payBalance(id) {
    const list = get(K.orders, []);
    const o = list.find((x) => x.id === id);
    if (o) {
      o.paid = o.amount;
      o.status = 'paid';
      o.balancePaidAt = Date.now();
    }
    set(K.orders, list);
    return o;
  },
  ownedIds: () => get(K.orders, []).map((o) => o.courseId),

  // 做题
  records: () => get(K.records, []),
  addRecord(r) {
    const list = get(K.records, []);
    list.unshift(Object.assign({ at: Date.now() }, r));
    set(K.records, list.slice(0, 50));
  },
  wrong: () => get(K.wrong, {}),
  addWrong(qid, chosen) {
    const map = get(K.wrong, {});
    map[qid] = { chosen, at: Date.now() };
    set(K.wrong, map);
  },
  removeWrong(qid) {
    const map = get(K.wrong, {});
    delete map[qid];
    set(K.wrong, map);
  },

  // 学习进度：{ courseId: [已学章节下标] }
  study: () => get(K.study, {}),
  markChapter(courseId, idx) {
    const map = get(K.study, {});
    const done = map[courseId] || [];
    if (done.indexOf(idx) === -1) done.push(idx);
    map[courseId] = done;
    set(K.study, map);
    return done;
  },

  // ===== 直播提醒：{ liveId: true } =====
  reminders: () => get(K.reminders, {}),
  addReminder(liveId) {
    const map = get(K.reminders, {});
    map[liveId] = true;
    set(K.reminders, map);
    return map;
  },
  removeReminder(liveId) {
    const map = get(K.reminders, {});
    delete map[liveId];
    set(K.reminders, map);
    return map;
  },

  // ===== 我的优惠券：领券后存副本（演示：用券不消耗，方便反复演示）=====
  myCoupons: () => get(K.coupons, []),
  gainCoupon(c) {
    const list = get(K.coupons, []);
    if (list.some((x) => x.couponId === c.id)) return null;
    const item = {
      couponId: c.id, name: c.name, amount: c.amount, min: c.min,
      all: !!c.all, courseIds: c.courseIds || [],
      expireDays: c.expireDays, gotAt: Date.now()
    };
    list.unshift(item);
    set(K.coupons, list);
    return item;
  },
  hasCoupon(id) {
    return get(K.coupons, []).some((c) => c.couponId === Number(id));
  },

  // ===== 拼团：我发起的团 =====
  myGroups: () => get(K.groups, []),
  openGroup(data) {
    const list = get(K.groups, []);
    const item = Object.assign({ id: uid('T'), createdAt: Date.now(), status: '拼团中' }, data);
    list.unshift(item);
    set(K.groups, list);
    return item;
  },

  // ===== 分销提现记录 =====
  withdraws: () => get(K.withdraws, []),
  addWithdraw(data) {
    const list = get(K.withdraws, []);
    const item = Object.assign({ id: uid('W'), at: Date.now(), status: '提现处理中' }, data);
    list.unshift(item);
    set(K.withdraws, list);
    return item;
  },

  // ===== 消息已读：{ msgId: true } =====
  readMsgs: () => get(K.readMsgs, {}),
  markRead(msgId) {
    const map = get(K.readMsgs, {});
    map[msgId] = true;
    set(K.readMsgs, map);
  },

  resetAll() {
    Object.keys(K).forEach((k) => { try { wx.removeStorageSync(K[k]); } catch (e) {} });
  }
};
