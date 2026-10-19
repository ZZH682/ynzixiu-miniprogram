const store = require('../../utils/store');

Page({
  data: {
    couponCount: 0,
    groupCount: 0,
    withdrawCount: 0
  },

  onShow() {
    this.setData({
      couponCount: store.myCoupons().length,
      groupCount: store.myGroups().length,
      withdrawCount: store.withdraws().length
    });
  },

  go(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url });
  },

  onShareAppMessage() {
    return { title: '云南自修学校 · 邀请好友一起学，报名更省钱', path: '/pages/marketing/index' };
  }
});
