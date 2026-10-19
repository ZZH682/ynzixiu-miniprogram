const { liveById, businessById } = require('../../data/mock');
const store = require('../../utils/store');

Page({
  data: {
    l: null,
    reminded: false,
    btnText: '',
    btnDisabled: false
  },

  onLoad(q) {
    const raw = liveById(q.id || 1);
    const b = businessById(raw.bid);
    const reminded = !!store.reminders()[raw.id];
    let btnText = '';
    if (raw.status === 'live') btnText = '进入直播间';
    else if (raw.status === 'upcoming') btnText = reminded ? '已开启开播提醒' : '预约开播提醒';
    else btnText = '观看回放';

    this.setData({
      l: Object.assign({}, raw, {
        bname: b.name,
        viewersText: raw.status === 'upcoming' ? '开播前可预约提醒' : (raw.viewers + (raw.status === 'live' ? ' 人在看' : ' 人看过')),
        startText: raw.status === 'upcoming'
          ? (raw.startInHours <= 1 ? '即将开播' : raw.startInHours + ' 小时后开播')
          : (raw.status === 'live' ? '正在直播中' : '回放可随时观看')
      }),
      reminded,
      btnText
    });
  },

  remind() {
    const { l, reminded } = this.data;
    if (l.status !== 'upcoming') return;
    if (reminded) {
      wx.showModal({
        title: '开播提醒',
        content: '已开启「' + l.title + '」的开播提醒，开播前 5 分钟通过小程序订阅消息通知你（演示）。',
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }
    // 演示：正式版用 wx.requestSubscribeMessage 唤起订阅授权，下发开播提醒
    wx.showModal({
      title: '订阅开播提醒',
      content: '演示：开启后将通过「小程序订阅消息」推送开播提醒（正式版接入 requestSubscribeMessage）。',
      confirmText: '开启提醒',
      success: (r) => {
        if (!r.confirm) return;
        store.addReminder(l.id);
        this.setData({ reminded: true, btnText: '已开启开播提醒' });
        wx.showToast({ title: '已开启提醒' });
      }
    });
  },

  mainAction() {
    const { l, reminded } = this.data;
    if (l.status === 'live') {
      wx.showToast({ title: '演示：正在进入直播间', icon: 'none' });
    } else if (l.status === 'upcoming') {
      this.remind();
    } else {
      wx.showToast({ title: '演示：正在播放回放', icon: 'none' });
    }
  },

  callPhone() { getApp().callPhone(); },

  onShareAppMessage() {
    const l = this.data.l || {};
    return { title: '云南自修学校直播 · ' + (l.title || '名师直播答疑'), path: '/pages/live/detail?id=' + (l.id || 1) };
  }
});
