const { groupons, grouponById } = require('../../data/mock');
const store = require('../../utils/store');
const fmt = require('../../utils/format');

Page({
  data: {
    list: [],
    myGroups: []
  },

  onShow() {
    const list = groupons.map((g) => Object.assign({}, g, {
      groupText: fmt.price(g.group),
      originText: fmt.price(g.origin),
      saveText: fmt.price(g.origin - g.group),
      percent: Math.round(g.joined / g.need * 100),
      endText: g.endInHours + ' 小时后结束'
    }));
    const myGroups = store.myGroups().map((g) => Object.assign({}, g, {
      groupText: fmt.price(g.group),
      originText: fmt.price(g.origin),
      saveText: fmt.price(g.origin - g.group),
      timeText: new Date(g.createdAt).toLocaleDateString()
    }));
    this.setData({ list, myGroups });
  },

  join(e) {
    const id = Number(e.currentTarget.dataset.id);
    const g = grouponById(id);
    if (!store.user()) { wx.navigateTo({ url: '/pages/login/index' }); return; }
    wx.showModal({
      title: '确认参团',
      content: '参团「' + g.title + '」，成团价 ¥' + fmt.price(g.group) + '（演示：不产生真实扣款）',
      confirmText: '去参团',
      success: (r) => {
        if (!r.confirm) return;
        wx.showToast({ title: '参团成功（演示）' });
      }
    });
  },

  open() {
    if (!store.user()) { wx.navigateTo({ url: '/pages/login/index' }); return; }
    wx.showActionSheet({
      itemList: groupons.map((g) => g.title),
      success: (r) => {
        const g = groupons[r.tapIndex];
        store.openGroup({
          groupId: g.id, title: g.title,
          origin: g.origin, group: g.group, need: g.need, joined: 1,
          leader: '我'
        });
        wx.showToast({ title: '已开团，去邀请好友' });
        this.onShow();
      }
    });
  },

  shareGroup(e) {
    const id = e.currentTarget.dataset.id;
    const g = this.data.myGroups.find((x) => x.id === id);
    wx.showModal({
      title: '邀请好友参团',
      content: g ? '分享「' + g.title + '」拼团链接给好友，2 人成团即享 ¥' + g.groupText + '（演示：微信原生分享）' : '',
      confirmText: '去转发',
      success: (r) => {
        if (r.confirm) wx.showShareMenu && wx.showShareMenu({ withShareTicket: true });
      }
    });
  },

  onShareAppMessage() {
    const g = this.data.list[0];
    return { title: g ? '拼团省 ¥' + g.saveText + '：' + g.title : '云南自修学校拼团', path: '/pages/marketing/groupon' };
  }
});
