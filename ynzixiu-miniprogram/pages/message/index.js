const { messages } = require('../../data/mock');
const store = require('../../utils/store');

const TYPE = {
  live: { char: '播', color: '#B8432F', tint: '#FBECE8' },
  course: { char: '课', color: '#2350D8', tint: '#EAF0FF' },
  signup: { char: '约', color: '#0E7C7B', tint: '#E3F4F3' },
  coupon: { char: '券', color: '#B4570F', tint: '#FDF1E4' },
  system: { char: '单', color: '#7A3FB8', tint: '#F3ECFB' }
};

Page({
  data: {
    list: [],
    unread: 0,
    subscribeOn: false
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const read = store.readMsgs();
    const list = messages.map((m) => Object.assign({}, m, {
      read: !!read[m.id],
      char: TYPE[m.type].char,
      color: TYPE[m.type].color,
      tint: TYPE[m.type].tint
    }));
    this.setData({
      list,
      unread: list.filter((m) => !m.read).length,
      subscribeOn: wx.getStorageSync('yz_subscribe_on')
    });
  },

  open(e) {
    const id = e.currentTarget.dataset.id;
    const m = messages.find((x) => x.id === id);
    if (!m) return;
    store.markRead(id);
    this.refresh();
    if (m.to) wx.navigateTo({ url: m.to });
  },

  markAll() {
    messages.forEach((m) => store.markRead(m.id));
    this.refresh();
    wx.showToast({ title: '已全部标为已读' });
  },

  // 演示：订阅消息授权（正式版用 wx.requestSubscribeMessage + 服务端下发）
  subscribe() {
    const on = !this.data.subscribeOn;
    wx.showModal({
      title: on ? '开启消息推送' : '关闭消息推送',
      content: on
        ? '演示：开启后可通过「小程序订阅消息」推送直播开播、课程更新、报名回访等通知（正式版接入订阅消息与公众号模板消息、短信）。'
        : '关闭后将不再收到小程序订阅消息推送（演示）。',
      confirmText: on ? '开启' : '关闭',
      success: (r) => {
        if (!r.confirm) return;
        wx.setStorageSync('yz_subscribe_on', on);
        this.setData({ subscribeOn: on });
        wx.showToast({ title: on ? '已开启' : '已关闭' });
      }
    });
  }
});
