const { news, courses } = require('../../data/mock');
const { courseCard } = require('../../utils/view');
const store = require('../../utils/store');

Page({
  data: { n: null, courses: [] },

  onLoad(q) {
    const n = news.find((x) => x.id === Number(q.id)) || news[0];
    this.setData({ n });
  },

  onShow() {
    if (!this.data.n) return;
    const owned = store.ownedIds();
    this.setData({
      courses: courses.filter((c) => c.bid === this.data.n.bid)
        .map((c) => Object.assign(courseCard(c), { owned: owned.indexOf(c.id) > -1 }))
    });
  },

  goCourse(e) { wx.navigateTo({ url: '/pages/course/detail?id=' + e.currentTarget.dataset.id }); },
  goSignup() { wx.navigateTo({ url: '/pages/signup/index?bid=' + this.data.n.bid }); },

  onShareAppMessage() {
    return { title: this.data.n.title, path: '/pages/news/detail?id=' + this.data.n.id };
  }
});
