const { courseCard, courseById } = require('../../utils/view');
const store = require('../../utils/store');

Page({
  data: { list: [], totalDone: 0, totalAll: 0 },

  onShow() {
    const study = store.study();
    const ids = store.ownedIds().filter((id, i, a) => a.indexOf(id) === i);
    let totalDone = 0;
    let totalAll = 0;
    const list = ids.map((id) => {
      const c = courseCard(courseById(id));
      const done = (study[id] || []).length;
      const all = c.chapters.length;
      totalDone += done;
      totalAll += all;
      return Object.assign(c, { done, all, percent: Math.round((done / all) * 100), finished: done === all });
    });
    this.setData({ list, totalDone, totalAll });
  },

  goCourse(e) { wx.navigateTo({ url: '/pages/course/detail?id=' + e.currentTarget.dataset.id }); },
  goCourses() { wx.navigateTo({ url: '/pages/course/list' }); }
});
