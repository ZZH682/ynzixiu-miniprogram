const { businesses, courses } = require('../../data/mock');

Page({
  data: { list: [] },

  onLoad() {
    this.setData({
      list: businesses.map((b) => Object.assign({}, b, { courseCount: courses.filter((c) => c.bid === b.id).length }))
    });
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/business/detail?id=' + e.currentTarget.dataset.id });
  },
  goSignup() { wx.navigateTo({ url: '/pages/signup/index' }); }
});
