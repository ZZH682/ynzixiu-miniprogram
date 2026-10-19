// 把示例数据加工成页面直接可渲染的字段（WXML 里不能调用函数）
const { businessById, courses } = require('../data/mock');
const fmt = require('./format');

function courseCard(c) {
  const b = businessById(c.bid);
  return Object.assign({}, c, {
    priceText: fmt.price(c.price),
    origText: fmt.price(c.orig),
    typeText: c.type === 'live' ? '直播课' : '录播课',
    teacherInitial: c.teacher.slice(0, 1),
    bname: b.name,
    char: b.char,
    color: b.color,
    tint: b.tint
  });
}

const courseById = (id) => courses.find((c) => c.id === Number(id));

module.exports = { courseCard, courseById };
