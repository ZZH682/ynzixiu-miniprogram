Page({
  data: { r: null, verdict: '' },

  onLoad() {
    const r = getApp().globalData.lastResult;
    if (!r) {
      wx.switchTab({ url: '/pages/quiz/index' });
      return;
    }
    let verdict = '基础还要再打牢，先把错题吃透';
    if (r.score >= 90) verdict = '非常扎实，保持这个节奏';
    else if (r.score >= 60) verdict = '已经及格，错题再过一遍';
    this.setData({ r, verdict });
  },

  again() {
    const q = this.data.r.query;
    const qs = Object.keys(q).map((k) => k + '=' + q[k]).join('&');
    wx.redirectTo({ url: '/pages/quiz/exam?' + qs });
  },
  goErrors() { wx.redirectTo({ url: '/pages/quiz/errors' }); }
});
