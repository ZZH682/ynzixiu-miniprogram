const { coupons } = require('../../data/mock');
const store = require('../../utils/store');
const fmt = require('../../utils/format');

Page({
  data: {
    tab: 'center',
    centerList: [],
    mineList: []
  },

  onShow() {
    this.refresh();
  },

  setTab(e) {
    this.setData({ tab: e.currentTarget.dataset.t }, () => this.refresh());
  },

  refresh() {
    const mine = store.myCoupons();
    const mineMap = {};
    mine.forEach((c) => { mineMap[c.couponId] = c; });

    const centerList = coupons.map((c) => Object.assign({}, c, {
      amountText: fmt.price(c.amount),
      minText: c.min ? '满 ' + fmt.price(c.min) + ' 可用' : '无门槛',
      expireText: '领取后 ' + c.expireDays + ' 天内有效',
      got: !!mineMap[c.id]
    }));

    const mineList = mine.map((c) => Object.assign({}, c, {
      amountText: fmt.price(c.amount),
      minText: c.min ? '满 ' + fmt.price(c.min) + ' 可用' : '无门槛',
      gotText: '领取于 ' + fmt.time(c.gotAt).slice(0, 10),
      expireText: c.expireDays + ' 天内有效'
    }));

    this.setData({ centerList, mineList });
  },

  gain(e) {
    const id = Number(e.currentTarget.dataset.id);
    const c = coupons.find((x) => x.id === id);
    if (store.hasCoupon(id)) { wx.showToast({ title: '已领取过了', icon: 'none' }); return; }
    store.gainCoupon(c);
    wx.showToast({ title: '领取成功' });
    this.refresh();
  },

  useCoupon(e) {
    const id = Number(e.currentTarget.dataset.id);
    const c = coupons.find((x) => x.id === id);
    if (c && c.courseIds && c.courseIds.length) {
      wx.navigateTo({ url: '/pages/course/detail?id=' + c.courseIds[0] });
    } else {
      wx.navigateTo({ url: '/pages/course/list' });
    }
  }
});
