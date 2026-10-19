const store = require('../../utils/store');
const fmt = require('../../utils/format');

Page({
  data: { o: null, fromPay: false },

  onLoad(q) {
    const o = store.order(q.id);
    if (!o) return;
    const fromPay = q.from === 'pay';
    if (!fromPay) wx.setNavigationBarTitle({ title: '电子收据' });
    this.setData({
      fromPay,
      o: Object.assign({}, o, {
        amountText: fmt.price(o.amount),
        paidText: fmt.price(o.paid),
        balanceText: fmt.price(o.amount - o.paid),
        timeText: fmt.time(o.createdAt),
        phoneText: fmt.maskPhone(o.phone),
        payText: o.pay === 'wechat' ? '微信支付' : '支付宝',
        planText: o.plan === 'split' ? '首付 + 尾款' : '一次付清'
      })
    });
  },

  saveReceipt() {
    wx.showToast({ title: '演示版：正式版生成 PDF 收据', icon: 'none' });
  },
  // 支付完成：返回课程页（已解锁）；从订单列表进来：打开课程页
  goStudy() {
    if (this.data.fromPay) wx.navigateBack();
    else wx.navigateTo({ url: '/pages/course/detail?id=' + this.data.o.courseId });
  },
  goOrders() {
    if (this.data.fromPay) wx.redirectTo({ url: '/pages/order/list' });
    else wx.navigateBack();
  }
});
