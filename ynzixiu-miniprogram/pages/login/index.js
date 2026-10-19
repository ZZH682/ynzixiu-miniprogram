const store = require('../../utils/store');

const DEMO_CODE = '123456';
const DEMO_PHONE = '13800008000';

Page({
  data: { phone: '', code: '', agreed: false, wait: 0 },

  onUnload() { clearInterval(this.timer); },

  onPhone(e) { this.setData({ phone: e.detail.value }); },
  onCode(e) { this.setData({ code: e.detail.value }); },
  toggleAgree() { this.setData({ agreed: !this.data.agreed }); },

  validPhone() { return /^1\d{10}$/.test(this.data.phone); },

  sendCode() {
    if (this.data.wait) return;
    if (!this.validPhone()) {
      wx.showToast({ title: '请输入 11 位手机号', icon: 'none' });
      return;
    }
    // 演示版不发短信，直接给出验证码
    wx.showToast({ title: '演示验证码 ' + DEMO_CODE, icon: 'none', duration: 2500 });
    this.setData({ wait: 60 });
    this.timer = setInterval(() => {
      const wait = this.data.wait - 1;
      this.setData({ wait });
      if (wait <= 0) clearInterval(this.timer);
    }, 1000);
  },

  checkAgree() {
    if (this.data.agreed) return true;
    wx.showToast({ title: '请先阅读并同意协议', icon: 'none' });
    return false;
  },

  submit() {
    if (!this.validPhone()) {
      wx.showToast({ title: '请输入 11 位手机号', icon: 'none' });
      return;
    }
    if (this.data.code !== DEMO_CODE) {
      wx.showToast({ title: '验证码不正确', icon: 'none' });
      return;
    }
    if (!this.checkAgree()) return;
    this.done(this.data.phone);
  },

  // 正式版用 open-type="getPhoneNumber" 换取微信绑定手机号
  quickLogin() {
    if (!this.checkAgree()) return;
    this.done(DEMO_PHONE);
  },

  done(phone) {
    store.login(phone);
    wx.showToast({ title: '登录成功' });
    setTimeout(() => wx.navigateBack(), 600);
  },

  showDoc() {
    wx.showModal({ title: '用户协议与隐私政策', content: '演示版本。正式版由学校提供协议全文。', showCancel: false });
  }
});
