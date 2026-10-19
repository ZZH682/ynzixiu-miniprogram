const store = require('../../utils/store');
const fmt = require('../../utils/format');
const { messages } = require('../../data/mock');

Page({
  data: {
    user: null,
    phoneText: '',
    sinceText: '',
    counts: { courses: 0, signups: 0, wrong: 0 },
    pendingBalance: 0,
    unread: 0,
    hotline: getApp().globalData.phone
  },

  onShow() {
    const user = store.user();
    const orders = store.orders();
    const courseIds = orders.map((o) => o.courseId).filter((id, i, a) => a.indexOf(id) === i);
    const read = store.readMsgs();
    this.setData({
      user,
      phoneText: user ? fmt.maskPhone(user.phone) : '',
      sinceText: user ? fmt.time(user.since).slice(0, 10) : '',
      counts: {
        courses: courseIds.length,
        signups: store.signups().length,
        wrong: Object.keys(store.wrong()).length
      },
      pendingBalance: orders.filter((o) => o.status === 'balance').length,
      unread: messages.filter((m) => !read[m.id]).length
    });
  },

  goLogin() { if (!this.data.user) wx.navigateTo({ url: '/pages/login/index' }); },
  go(e) {
    const url = e.currentTarget.dataset.url;
    const needLogin = e.currentTarget.dataset.auth;
    if (needLogin && !this.data.user) {
      wx.navigateTo({ url: '/pages/login/index' });
      return;
    }
    wx.navigateTo({ url });
  },
  callPhone() { getApp().callPhone(); },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后可用手机号重新登录',
      success: (r) => {
        if (!r.confirm) return;
        store.logout();
        this.onShow();
      }
    });
  },

  // 演示时用：清空本地的订单、预约、做题记录，回到初始状态
  resetDemo() {
    wx.showModal({
      title: '重置演示数据',
      content: '将清空登录、订单、预约和做题记录',
      confirmColor: '#D63B3B',
      success: (r) => {
        if (!r.confirm) return;
        store.resetAll();
        wx.showToast({ title: '已重置' });
        this.onShow();
      }
    });
  }
});
