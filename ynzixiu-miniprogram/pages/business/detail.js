const { courses, news, stories, businessById } = require('../../data/mock');
const { courseCard } = require('../../utils/view');
const store = require('../../utils/store');

Page({
  data: { b: null, courses: [], news: [], story: null },

  onLoad(q) {
    const b = businessById(q.id || 1);
    wx.setNavigationBarTitle({ title: b.name });
    this.setData({
      b,
      news: news.filter((n) => n.bid === b.id),
      story: stories.find((s) => s.bid === b.id) || null
    });
  },

  onShow() {
    if (!this.data.b) return;
    const owned = store.ownedIds();
    this.setData({
      courses: courses.filter((c) => c.bid === this.data.b.id)
        .map((c) => Object.assign(courseCard(c), { owned: owned.indexOf(c.id) > -1 }))
    });
  },

  goCourse(e) { wx.navigateTo({ url: '/pages/course/detail?id=' + e.currentTarget.dataset.id }); },
  goNews(e) { wx.navigateTo({ url: '/pages/news/detail?id=' + e.currentTarget.dataset.id }); },
  goSignup() { wx.navigateTo({ url: '/pages/signup/index?bid=' + this.data.b.id }); },
  callPhone() { getApp().callPhone(); },

  onShareAppMessage() {
    return { title: '云南自修学校 · ' + this.data.b.name, path: '/pages/business/detail?id=' + this.data.b.id };
  }
});
