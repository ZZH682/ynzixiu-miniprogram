const { businesses } = require('../../data/mock');

Page({
  data: {
    intro: '云南自修学校立足云南，专注成人学历提升与职业发展培训，覆盖成人学历教育、自考助学、统招专升本、公考/事业单位、考研培训、出国留学六大业务，为在职人员、应往届毕业生和社会考生提供从学历提升到公职就业、考研深造的完整路径。',
    businesses,
    certs: ['办学许可证', '营业执照', '合作院校授权书'],
    phone: ''
  },

  onLoad() {
    this.setData({ phone: getApp().globalData.phone });
  },

  goBiz(e) { wx.navigateTo({ url: '/pages/business/detail?id=' + e.currentTarget.dataset.id }); },
  callPhone() { getApp().callPhone(); },

  onShareAppMessage() {
    return { title: '云南自修学校', path: '/pages/about/index' };
  }
});
