const T = {
  quiz: {
    name: '题库模板',
    desc: '一次导入成百上千道题目，自动归入对应科目。',
    header: ['题号', '科目', '题型', '题干', '选项A', '选项B', '选项C', '选项D', '正确答案', '解析'],
    rows: [
      ['1', '专升本·高等数学', '单选', '函数 f(x)=x²−4x+3 的对称轴是', 'x=1', 'x=2', 'x=3', 'x=−2', 'B', '对称轴 x=−b/2a=2'],
      ['2', '成考·英语', '单选', 'The weather in Kunming is ______ than that in Beijing.', 'good', 'better', 'best', 'well', 'B', '有 than 用比较级']
    ]
  },
  course: {
    name: '课程模板',
    desc: '批量录入课程与章节，录播 / 直播课程都支持。',
    header: ['课程ID', '所属业务', '课程名称', '讲师', '价格(元)', '原价(元)', '类型(录播/直播)', '课程简介', '章节标题', '章节时长'],
    rows: [
      ['C001', '统招专升本', '专升本公共课网课', '刘老师', '1980', '2580', '录播', '三科系统课配套题库与模考', '备考规划', '14:20'],
      ['C002', '成人学历教育', '成考考前辅导班', '李老师', '980', '1280', '录播', '按成考大纲系统梳理考点', '导学课', '12:40']
    ]
  },
  news: {
    name: '资讯模板',
    desc: '批量发布政策解读、招考公告等资讯内容。',
    header: ['资讯ID', '栏目', '标题', '摘要', '发布时间', '正文'],
    rows: [
      ['N001', '专升本', '2026 云南专升本政策解读', '政策要点速览', '2026-08-15', '云南省统招专升本按类别划定分数线……'],
      ['N002', '成考', '成人高考报名要点', '报名时间与条件', '2026-09-01', '云南省成人高考一般在 9 月网上报名……']
    ]
  }
};

Page({
  data: {
    tab: 'quiz',
    tpl: null
  },

  onLoad() {
    this.pick('quiz');
  },

  pick(key) {
    const t = T[key];
    this.setData({
      tab: key,
      tpl: {
        name: t.name,
        desc: t.desc,
        header: t.header,
        rows: t.rows
      }
    });
  },

  setTab(e) {
    this.pick(e.currentTarget.dataset.t);
  },

  copyTpl() {
    const t = T[this.data.tab];
    const lines = [t.header.join(',')].concat(t.rows.map((r) => r.join(',')));
    wx.setClipboardData({
      data: lines.join('\n'),
      success: () => wx.showToast({ title: '模板已复制' })
    });
  },

  copyRow(e) {
    const t = T[this.data.tab];
    const row = t.rows[e.currentTarget.dataset.i];
    wx.setClipboardData({
      data: t.header.join(',') + '\n' + row.join(','),
      success: () => wx.showToast({ title: '示例已复制' })
    });
  },

  demoImport() {
    wx.showModal({
      title: '模拟导入（演示）',
      content: '演示：正式版在管理后台上传 CSV / Excel 文件，按模板校验后批量写入题库、课程与资讯，支持分批导入与错误行提示。',
      showCancel: false
    });
  }
});
