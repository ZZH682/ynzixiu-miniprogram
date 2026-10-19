const { courseCard, courseById } = require('../../utils/view');
const store = require('../../utils/store');

Page({
  data: {
    c: null,
    owned: false,
    chapters: [],
    done: 0,
    percent: 0,
    tab: 'intro',
    playing: -1,
    playingTitle: ''
  },

  onLoad(q) {
    this.id = Number(q.id || 1);
    this.setData({ c: courseCard(courseById(this.id)) });
  },

  onShow() { this.refresh(); },

  refresh() {
    const c = this.data.c;
    const owned = store.ownedIds().indexOf(c.id) > -1;
    const learned = store.study()[c.id] || [];
    const chapters = c.chapters.map((ch, i) => Object.assign({}, ch, {
      no: i + 1,
      noText: (i < 9 ? '0' : '') + (i + 1),
      learned: learned.indexOf(i) > -1,
      open: owned || ch.trial
    }));
    this.setData({
      owned,
      chapters,
      done: learned.length,
      percent: Math.round((learned.length / chapters.length) * 100)
    });
  },

  setTab(e) { this.setData({ tab: e.currentTarget.dataset.t }); },

  play(e) {
    const i = e.currentTarget.dataset.i;
    const ch = this.data.chapters[i];
    if (!ch.open) {
      wx.showToast({ title: '报名后解锁全部章节', icon: 'none' });
      return;
    }
    if (this.data.owned) store.markChapter(this.data.c.id, i);
    this.setData({ playing: i, playingTitle: `第 ${ch.no} 节 · ${ch.title}` });
    this.refresh();
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  continueStudy() {
    const next = this.data.chapters.findIndex((ch) => !ch.learned);
    this.play({ currentTarget: { dataset: { i: next === -1 ? 0 : next } } });
  },

  buy() {
    if (!store.user()) {
      wx.navigateTo({ url: '/pages/login/index' });
      return;
    }
    wx.navigateTo({ url: '/pages/order/confirm?id=' + this.data.c.id });
  },

  callPhone() { getApp().callPhone(); },

  onShareAppMessage() {
    return { title: this.data.c.title, path: '/pages/course/detail?id=' + this.data.c.id };
  }
});
