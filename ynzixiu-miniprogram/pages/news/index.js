const { news } = require('../../data/mock');

const CATS = ['全部', '成考', '自考', '专升本', '公考', '考研', '留学'];
const sorted = news.slice().sort((a, b) => (a.date < b.date ? 1 : -1));

Page({
  data: { cats: CATS, cat: '全部', list: [] },

  onLoad(q) {
    const cat = q.cat ? decodeURIComponent(q.cat) : '全部';
    this.setData({ cat: CATS.indexOf(cat) > -1 ? cat : '全部' }, () => this.refresh());
  },

  refresh() {
    const { cat } = this.data;
    this.setData({ list: sorted.filter((n) => cat === '全部' || n.category === cat) });
  },

  onCat(e) { this.setData({ cat: e.currentTarget.dataset.cat }, () => this.refresh()); },
  goNews(e) { wx.navigateTo({ url: '/pages/news/detail?id=' + e.currentTarget.dataset.id }); }
});
