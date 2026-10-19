const { businesses, courses, news, stories, banners, businessById, lives } = require('../../data/mock');
const { courseCard } = require('../../utils/view');
const store = require('../../utils/store');

function liveStartText(l) {
  if (l.status === 'live') return '直播中 · ' + l.viewers + ' 人在看';
  if (l.status === 'upcoming') return l.startInHours <= 1 ? '即将开播' : l.startInHours + ' 小时后开播';
  return '回放 · ' + l.viewers + ' 人看过';
}

Page({
  data: {
    navTop: 24,
    navH: 32,
    capsule: 100,
    banners,
    businesses,
    topNews: [],
    hotCourses: [],
    stories: [],
    liveNow: null,
    upcomings: [],
    marketEntries: [
      { char: '分', name: '转介绍', to: '/pages/marketing/distribute', color: '#2350D8', tint: '#EAF0FF' },
      { char: '团', name: '拼团', to: '/pages/marketing/groupon', color: '#4B3FC9', tint: '#EEECFC' },
      { char: '券', name: '领券', to: '/pages/marketing/coupon', color: '#B4570F', tint: '#FDF1E4' },
      { char: '享', name: '分享海报', to: '/pages/marketing/poster', color: '#B8432F', tint: '#FBECE8' }
    ],
    phone: getApp().globalData.phone
  },

  onLoad() {
    try {
      const menu = wx.getMenuButtonBoundingClientRect();
      const win = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this.setData({ navTop: menu.top, navH: menu.height, capsule: win.windowWidth - menu.left + 8 });
    } catch (e) {}

    const liveList = lives.map((l) => Object.assign({}, l, { startText: liveStartText(l) }));
    this.setData({
      topNews: news.filter((n) => n.top).slice(0, 3),
      hotCourses: courses.slice().sort((a, b) => b.sales - a.sales).slice(0, 4).map(courseCard),
      stories: stories.map((s) => Object.assign({}, s, { color: businessById(s.bid).color })),
      liveNow: liveList.find((l) => l.status === 'live') || null,
      upcomings: liveList.filter((l) => l.status === 'upcoming').slice(0, 2)
    });
  },

  onBanner(e) {
    const b = this.data.banners[e.currentTarget.dataset.i];
    if (b.tab) wx.switchTab({ url: b.to });
    else wx.navigateTo({ url: b.to });
  },

  goBusiness(e) {
    wx.navigateTo({ url: '/pages/business/detail?id=' + e.currentTarget.dataset.id });
  },
  goNews(e) {
    wx.navigateTo({ url: '/pages/news/detail?id=' + e.currentTarget.dataset.id });
  },
  goNewsList() { wx.navigateTo({ url: '/pages/news/index' }); },
  goCourse(e) {
    wx.navigateTo({ url: '/pages/course/detail?id=' + e.currentTarget.dataset.id });
  },
  goCourseList() { wx.navigateTo({ url: '/pages/course/list' }); },
  goSearch() { wx.navigateTo({ url: '/pages/course/list?focus=1' }); },
  goAbout() { wx.navigateTo({ url: '/pages/about/index' }); },
  goLive(e) { wx.navigateTo({ url: '/pages/live/detail?id=' + e.currentTarget.dataset.id }); },
  goLiveList() { wx.navigateTo({ url: '/pages/live/index' }); },
  goMarket(e) { wx.navigateTo({ url: e.currentTarget.dataset.to }); },
  callPhone() { getApp().callPhone(); },

  onShareAppMessage() {
    return { title: '云南自修学校 · 学历提升、公考考研、出国留学', path: '/pages/index/index' };
  }
});
