const { distribute } = require('../../data/mock');
const store = require('../../utils/store');
const fmt = require('../../utils/format');

Page({
  data: {
    user: null,
    code: null,
    totalEarn: distribute.totalEarn,
    available: distribute.available,
    withdrawn: 0,
    rate: distribute.rate * 100,
    team: distribute.team,
    withdraws: []
  },

  onShow() {
    const user = store.user();
    const withdraws = store.withdraws();
    const withdrawn = withdraws.reduce((s, w) => s + w.amount, 0);
    this.setData({
      user,
      code: user ? 'YNZX-' + String(user.phone).slice(-4) : null,
      withdrawn,
      available: Math.max(0, distribute.available - withdrawn),
      withdraws
    });
  },

  copyCode() {
    if (!this.data.code) {
      wx.navigateTo({ url: '/pages/login/index' });
      return;
    }
    wx.setClipboardData({
      data: this.data.code,
      success: () => wx.showToast({ title: '推广码已复制' })
    });
  },

  withdraw() {
    const { user, available } = this.data;
    if (!user) { wx.navigateTo({ url: '/pages/login/index' }); return; }
    if (available <= 0) { wx.showToast({ title: '暂无可提现余额', icon: 'none' }); return; }

    wx.showModal({
      title: '提现到微信零钱',
      editable: true,
      placeholderText: '可提现 ¥' + fmt.price(available),
      confirmText: '申请提现',
      success: (r) => {
        if (!r.confirm) return;
        const amount = Math.floor(Number(r.content));
        if (!amount || amount <= 0 || amount > available) {
          wx.showToast({ title: '请输入有效金额', icon: 'none' });
          return;
        }
        store.addWithdraw({ amount, note: '推广佣金提现' });
        wx.showToast({ title: '提现申请已提交' });
        this.onShow();
      }
    });
  },

  onShareAppMessage() {
    return { title: '来云南自修学校提升学历，老学员推荐返 10% 佣金', path: '/pages/marketing/distribute' };
  }
});
