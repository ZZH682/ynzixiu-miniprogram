const { subjects, questions, businessById } = require('../../data/mock');
const store = require('../../utils/store');

Page({
  data: { stats: { done: 0, rate: 0, wrong: 0 }, list: [], wrongCount: 0 },

  onShow() {
    const records = store.records();
    const wrongCount = Object.keys(store.wrong()).length;
    const done = records.reduce((s, r) => s + r.total, 0);
    const right = records.reduce((s, r) => s + r.correct, 0);

    const list = subjects.map((s) => {
      const b = businessById(s.bid);
      const mine = records.filter((r) => r.sid === s.id);
      const best = mine.length ? Math.max.apply(null, mine.map((r) => r.score)) : -1;
      return Object.assign({}, s, {
        count: questions.filter((q) => q.sid === s.id).length,
        best,
        char: b.char,
        color: b.color,
        tint: b.tint
      });
    });

    this.setData({
      stats: { done, rate: done ? Math.round((right / done) * 100) : 0, wrong: wrongCount },
      wrongCount,
      list
    });
  },

  goSubject(e) { wx.navigateTo({ url: '/pages/quiz/exam?sid=' + e.currentTarget.dataset.id }); },
  goMock() { wx.navigateTo({ url: '/pages/quiz/exam?mode=mock' }); },
  goErrors() { wx.navigateTo({ url: '/pages/quiz/errors' }); }
});
