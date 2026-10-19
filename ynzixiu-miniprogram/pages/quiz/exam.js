const { subjects, questions } = require('../../data/mock');
const store = require('../../utils/store');
const fmt = require('../../utils/format');

const KEYS = ['A', 'B', 'C', 'D'];
const MOCK_SIZE = 10;
const MOCK_SECONDS = 600;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

Page({
  data: {
    mode: 'practice', // practice 练习：选完即判；mock 模考：交卷才判
    title: '',
    total: 0,
    idx: 0,
    cur: null,
    sheet: [],
    answeredCount: 0,
    left: MOCK_SECONDS,
    leftText: fmt.clock(MOCK_SECONDS)
  },

  onLoad(q) {
    this.query = q;
    let list;
    let title;
    let mode = 'practice';
    if (q.mode === 'mock') {
      list = shuffle(questions).slice(0, MOCK_SIZE);
      title = '综合模考';
      mode = 'mock';
    } else if (q.mode === 'errors') {
      const wrong = store.wrong();
      list = questions.filter((x) => wrong[x.id]);
      title = '错题重练';
    } else {
      const s = subjects.find((x) => x.id === Number(q.sid)) || subjects[0];
      list = questions.filter((x) => x.sid === s.id);
      title = s.name;
      this.sid = s.id;
    }
    if (!list.length) {
      wx.showToast({ title: '没有可练的题目', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    wx.setNavigationBarTitle({ title });
    this.list = list;
    this.answers = {};
    this.startAt = Date.now();
    this.setData({ mode, title, total: list.length });
    this.render(0);
    if (mode === 'mock') this.startTimer();
  },

  onUnload() { clearInterval(this.timer); },

  startTimer() {
    this.timer = setInterval(() => {
      const left = this.data.left - 1;
      this.setData({ left, hurry: left <= 60, leftText: fmt.clock(Math.max(left, 0)) });
      if (left <= 0) {
        clearInterval(this.timer);
        wx.showToast({ title: '时间到，自动交卷', icon: 'none' });
        setTimeout(() => this.finish(), 600);
      }
    }, 1000);
  },

  // 生成当前题的渲染数据（选项状态在这里算好，WXML 只负责显示）
  render(idx) {
    const item = this.list[idx];
    const chosen = this.answers[item.id];
    const reveal = this.data.mode === 'practice' && !!chosen;
    const opts = item.opts.map((text, i) => {
      const key = KEYS[i];
      let state = '';
      if (reveal) {
        if (key === item.answer) state = 'right';
        else if (key === chosen) state = 'wrong';
      } else if (key === chosen) {
        state = 'picked';
      }
      return { key, text, state };
    });
    const sheet = this.list.map((x, i) => {
      const a = this.answers[x.id];
      let s = a ? 'done' : '';
      if (a && this.data.mode === 'practice') s = a === x.answer ? 'right' : 'wrong';
      return { no: i + 1, s, now: i === idx };
    });
    this.setData({
      idx,
      sheet,
      answeredCount: Object.keys(this.answers).length,
      cur: {
        stem: item.stem,
        opts,
        reveal,
        isRight: chosen === item.answer,
        answer: item.answer,
        analysis: item.analysis
      }
    });
  },

  pick(e) {
    const key = e.currentTarget.dataset.key;
    const item = this.list[this.data.idx];
    if (this.data.mode === 'practice') {
      if (this.answers[item.id]) return;
      this.answers[item.id] = key;
      if (key !== item.answer) store.addWrong(item.id, key);
      else if (this.query.mode === 'errors') store.removeWrong(item.id);
    } else {
      this.answers[item.id] = key;
    }
    this.render(this.data.idx);
  },

  prev() { if (this.data.idx > 0) this.render(this.data.idx - 1); },
  next() {
    if (this.data.idx < this.data.total - 1) this.render(this.data.idx + 1);
    else this.submit();
  },
  jump(e) { this.render(e.currentTarget.dataset.i); },

  submit() {
    const left = this.data.total - Object.keys(this.answers).length;
    if (left > 0) {
      wx.showModal({
        title: '确认交卷？',
        content: `还有 ${left} 题没有作答`,
        confirmText: '交卷',
        success: (r) => { if (r.confirm) this.finish(); }
      });
    } else {
      this.finish();
    }
  },

  finish() {
    if (this.finished) return;
    this.finished = true;
    clearInterval(this.timer);
    const items = this.list.map((x) => {
      const chosen = this.answers[x.id] || '';
      const right = chosen === x.answer;
      if (this.data.mode === 'mock' && !right) store.addWrong(x.id, chosen || '未答');
      return {
        id: x.id,
        stem: x.stem,
        chosen: chosen || '未答',
        answer: x.answer,
        answerText: x.opts[KEYS.indexOf(x.answer)],
        analysis: x.analysis,
        right
      };
    });
    const correct = items.filter((x) => x.right).length;
    const score = Math.round((correct / items.length) * 100);
    const used = Math.round((Date.now() - this.startAt) / 1000);
    store.addRecord({ sid: this.sid || 0, mode: this.data.mode, total: items.length, correct, score });
    getApp().globalData.lastResult = {
      title: this.data.title,
      query: this.query,
      total: items.length,
      correct,
      score,
      usedText: fmt.clock(used),
      items
    };
    wx.redirectTo({ url: '/pages/quiz/result' });
  }
});
