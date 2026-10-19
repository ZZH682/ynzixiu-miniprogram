const { courseCard, courseById } = require('../../utils/view');
const store = require('../../utils/store');
const fmt = require('../../utils/format');

// 3000 元以上的课程支持“首付 30% + 尾款”
const INSTALLMENT_MIN = 3000;
const DEPOSIT_RATE = 0.3;

Page({
  data: {
    c: null,
    phoneText: '',
    canSplit: false,
    plan: 'full',
    pay: 'wechat',
    depositText: '',
    balanceText: '',
    payNowText: '',
    coupons: [],
    coupon: null,
    discountText: '',
    paying: false
  },

  onLoad(q) {
    const c = courseCard(courseById(q.id || 1));
    const user = store.user();
    const deposit = Math.round(c.price * DEPOSIT_RATE);
    const coupons = store.myCoupons()
      .filter((cp) => (cp.all || (cp.courseIds || []).indexOf(c.id) > -1) && c.price >= cp.min)
      .map((cp) => Object.assign({}, cp, { amountText: fmt.price(cp.amount), minText: '满 ' + fmt.price(cp.min) + ' 可用' }));
    this.setData({
      c,
      phoneText: user ? fmt.maskPhone(user.phone) : '',
      canSplit: c.price >= INSTALLMENT_MIN,
      depositText: fmt.price(deposit),
      balanceText: fmt.price(c.price - deposit),
      coupons
    });
    this.deposit = deposit;
    this.updateTotal();
  },

  setPlan(e) { this.setData({ plan: e.currentTarget.dataset.v }, () => this.updateTotal()); },
  setPay(e) { this.setData({ pay: e.currentTarget.dataset.v }); },

  pickCoupon() {
    const { coupons } = this.data;
    if (!coupons.length) return;
    const items = ['不使用优惠券'].concat(coupons.map((cp) => cp.name + '（立减 ¥' + cp.amountText + '）'));
    wx.showActionSheet({
      itemList: items,
      success: (r) => {
        const picked = r.tapIndex === 0 ? null : coupons[r.tapIndex - 1];
        this.setData({ coupon: picked }, () => this.updateTotal());
      }
    });
  },

  updateTotal() {
    const { plan, coupon, c } = this.data;
    const base = plan === 'split' ? this.deposit : c.price;
    const discount = coupon ? Math.min(coupon.amount, base) : 0;
    const now = Math.max(0, base - discount);
    this.payNow = now;
    this.discount = discount;
    this.setData({
      payNowText: fmt.price(now),
      discountText: discount ? fmt.price(discount) : ''
    });
  },

  submit() {
    if (this.data.paying) return;
    const { c, plan, pay, coupon } = this.data;
    this.setData({ paying: true });
    wx.showLoading({ title: '正在支付', mask: true });
    setTimeout(() => {
      wx.hideLoading();
      const order = store.addOrder({
        courseId: c.id,
        title: c.title,
        bname: c.bname,
        amount: c.price,
        paid: this.payNow,
        couponName: coupon ? coupon.name : '',
        couponAmount: this.discount || 0,
        plan,
        pay,
        status: plan === 'split' ? 'balance' : 'paid',
        phone: store.user().phone
      });
      this.setData({ paying: false });
      wx.redirectTo({ url: '/pages/order/result?from=pay&id=' + order.id });
    }, 900);
  }
});
