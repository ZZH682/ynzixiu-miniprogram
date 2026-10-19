const { businesses, businessById } = require('../../data/mock');
const store = require('../../utils/store');

Page({
  data: {
    businesses: [],
    bid: 0,
    name: '',
    phone: '',
    edus: ['高中 / 中专', '大专', '本科', '其他'],
    edu: '',
    times: ['工作日白天', '工作日晚上', '周末'],
    time: '',
    note: '',
    done: false,
    submitting: false
  },

  onLoad(q) {
    const user = store.user();
    const b = q.bid ? businessById(q.bid) : null;
    this.setData({
      businesses: businesses.map((x) => ({ id: x.id, name: x.name, color: x.color, tint: x.tint })),
      bid: b ? b.id : 0,
      phone: user ? user.phone : ''
    });
  },

  pickBiz(e) { this.setData({ bid: e.currentTarget.dataset.id }); },
  pickEdu(e) { this.setData({ edu: e.currentTarget.dataset.v }); },
  pickTime(e) { this.setData({ time: e.currentTarget.dataset.v }); },
  onName(e) { this.setData({ name: e.detail.value }); },
  onPhone(e) { this.setData({ phone: e.detail.value }); },
  onNote(e) { this.setData({ note: e.detail.value }); },

  submit() {
    if (this.data.submitting) return;
    const { bid, edu, time } = this.data;
    const name = this.data.name.trim();
    const phone = this.data.phone.trim();
    const note = this.data.note.trim();
    const err = !bid ? '请选择意向业务'
      : !name ? '请填写姓名'
      : !/^1\d{10}$/.test(phone) ? '请填写正确的手机号'
      : '';
    if (err) {
      wx.showToast({ title: err, icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中', mask: true });
    setTimeout(() => {
      wx.hideLoading();
      store.addSignup({ bid, bname: businessById(bid).name, name, phone, edu, time, note });
      this.setData({ submitting: false, done: true });
      wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    }, 600);
  },

  goList() { wx.redirectTo({ url: '/pages/signup/list' }); },
  goHome() { wx.switchTab({ url: '/pages/index/index' }); }
});
