const { subjects, questions } = require('../../data/mock');
const store = require('../../utils/store');

const KEYS = ['A', 'B', 'C', 'D'];

Page({
  data: { list: [] },

  onShow() {
    const wrong = store.wrong();
    const list = questions
      .filter((x) => wrong[x.id])
      .map((x) => ({
        id: x.id,
        stem: x.stem,
        sname: subjects.find((s) => s.id === x.sid).name,
        chosen: wrong[x.id].chosen,
        answer: x.answer,
        answerText: x.opts[KEYS.indexOf(x.answer)],
        analysis: x.analysis
      }));
    this.setData({ list });
  },

  remove(e) {
    store.removeWrong(e.currentTarget.dataset.id);
    this.onShow();
  },
  redo() { wx.navigateTo({ url: '/pages/quiz/exam?mode=errors' }); },
  goQuiz() { wx.switchTab({ url: '/pages/quiz/index' }); }
});
