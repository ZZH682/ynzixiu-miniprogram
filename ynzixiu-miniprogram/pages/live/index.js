const { lives } = require('../../data/mock');
const { businessById } = require('../../data/mock');
const store = require('../../utils/store');

function startText(l) {
  if (l.status === 'live') return '开播 ' + Math.max(1, Math.abs(l.startInHours)) + ' 小时';
  if (l.status === 'upcoming') {
    const h = l.startInHours;
    return h <= 1 ? '即将开播' : h + ' 小时后开播';
  }
  return '回放 · 48 分钟';
}

function decorate(l) {
  const b = businessById(l.bid);
  return Object.assign({}, l, {
    startText: startText(l),
    statusText: l.status === 'live' ? '直播中' : l.status === 'upcoming' ? '预约提醒' : '看回放',
    bname: b.name,
    reminded: !!store.reminders()[l.id]
  });
}

Page({
  data: {
    liveNow: null,
    upcomings: [],
    replays: []
  },

  onShow() {
    const list = lives.map(decorate);
    this.setData({
      liveNow: list.find((l) => l.status === 'live') || null,
      upcomings: list.filter((l) => l.status === 'upcoming'),
      replays: list.filter((l) => l.status === 'replay')
    });
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/live/detail?id=' + e.currentTarget.dataset.id });
  },

  onShareAppMessage() {
    return { title: '云南自修学校 · 直播课堂，名师直播答疑', path: '/pages/live/index' };
  }
});
