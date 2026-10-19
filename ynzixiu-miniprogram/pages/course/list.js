const { businesses, courses } = require('../../data/mock');
const { courseCard } = require('../../utils/view');
const store = require('../../utils/store');

Page({
  data: { tabs: [], bid: 0, kw: '', focus: false, list: [] },

  onLoad(q) {
    this.setData({
      tabs: [{ id: 0, name: '全部' }].concat(businesses.map((b) => ({ id: b.id, name: b.name }))),
      bid: Number(q.bid || 0),
      focus: q.focus === '1'
    });
  },

  onShow() { this.refresh(); },

  refresh() {
    const { bid, kw } = this.data;
    const owned = store.ownedIds();
    const k = kw.trim();
    const list = courses
      .map((c) => Object.assign(courseCard(c), { owned: owned.indexOf(c.id) > -1 }))
      .filter((c) => !bid || c.bid === bid)
      .filter((c) => !k || (c.title + c.bname + c.teacher).indexOf(k) > -1);
    this.setData({ list });
  },

  onTab(e) { this.setData({ bid: e.currentTarget.dataset.id }, () => this.refresh()); },
  onInput(e) { this.setData({ kw: e.detail.value }, () => this.refresh()); },
  clearKw() { this.setData({ kw: '' }, () => this.refresh()); },
  goCourse(e) { wx.navigateTo({ url: '/pages/course/detail?id=' + e.currentTarget.dataset.id }); }
});
