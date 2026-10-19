const store = require('../../utils/store');
const fmt = require('../../utils/format');

Page({
  data: { list: [] },

  onShow() {
    this.setData({
      list: store.signups().map((s) => Object.assign({}, s, {
        phoneText: fmt.maskPhone(s.phone),
        timeText: fmt.time(s.createdAt),
        extra: [s.edu, s.time].filter(Boolean).join(' · ')
      }))
    });
  },

  goSignup() { wx.navigateTo({ url: '/pages/signup/index' }); }
});
