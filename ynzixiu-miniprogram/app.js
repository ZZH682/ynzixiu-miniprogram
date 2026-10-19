App({
  globalData: {
    phone: '199-0888-3061',
    lastResult: null
  },

  callPhone() {
    wx.makePhoneCall({ phoneNumber: this.globalData.phone.replace(/-/g, ''), fail() {} });
  }
});
