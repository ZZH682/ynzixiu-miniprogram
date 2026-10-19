const store = require('../../utils/store');
const fmt = require('../../utils/format');

Page({
  data: { list: [] },

  onShow() {
    this.setData({
      list: store.orders().map((o) => Object.assign({}, o, {
        amountText: fmt.price(o.amount),
        paidText: fmt.price(o.paid),
        balanceText: fmt.price(o.amount - o.paid),
        couponText: o.couponAmount ? o.couponName + ' -¥' + fmt.price(o.couponAmount) : '',
        timeText: fmt.time(o.createdAt)
      }))
    });
  },

  payBalance(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '支付尾款',
      content: '演示环境，不会产生真实扣款',
      confirmText: '确认支付',
      success: (r) => {
        if (!r.confirm) return;
        store.payBalance(id);
        wx.showToast({ title: '尾款已付清' });
        this.onShow();
      }
    });
  },
  goReceipt(e) { wx.navigateTo({ url: '/pages/order/result?id=' + e.currentTarget.dataset.id }); },
  goCourses() { wx.navigateTo({ url: '/pages/course/list' }); }
});
