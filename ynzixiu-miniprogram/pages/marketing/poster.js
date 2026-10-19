const store = require('../../utils/store');

const W = 640;
const H = 960;

Page({
  data: {
    spreader: '云南自修学校学员'
  },

  onReady() {
    const user = store.user();
    if (user) this.setData({ spreader: '学员 ' + String(user.phone).slice(-4) });
    this.draw();
  },

  draw() {
    const ctx = wx.createCanvasContext('poster');
    const name = this.data.spreader;

    // 背景渐变
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2350D8');
    g.addColorStop(1, '#4B3FC9');
    ctx.setFillStyle(g);
    ctx.fillRect(0, 0, W, H);

    // 顶部品牌
    ctx.setTextAlign('center');
    ctx.setFillStyle('#FFFFFF');
    ctx.setFontSize(30);
    ctx.fillText('云南自修学校', W / 2, 110);
    ctx.setFontSize(22);
    ctx.setFillStyle('rgba(255,255,255,0.8)');
    ctx.fillText('学历提升 · 自考 · 专升本 · 公考 · 考研 · 留学', W / 2, 158);

    // 主文案
    ctx.setFillStyle('#FFFFFF');
    ctx.setFontSize(52);
    ctx.fillText('提升学历，选云南自修学校', W / 2, 262);
    ctx.setFontSize(28);
    ctx.fillText('名师课程 · 全程督学 · 一对一规划', W / 2, 322);

    // 白色内容卡
    ctx.setFillStyle('#FFFFFF');
    ctx.fillRect(60, 400, 520, 220);
    ctx.setFillStyle('#13213B');
    ctx.setFontSize(36);
    ctx.fillText('专升本暑期集训营', W / 2, 480);
    ctx.setFillStyle('#5B6475');
    ctx.setFontSize(24);
    ctx.fillText('40 天封闭集训 · 公共课 + 专业课', W / 2, 530);
    ctx.setFillStyle('#E5522A');
    ctx.setFontSize(34);
    ctx.fillText('团购价 ¥5980 · 原价 ¥6800', W / 2, 588);

    // 二维码占位（正式版接入二维码 API 生成专属推广码）
    ctx.setFillStyle('#FFFFFF');
    ctx.fillRect(240, 672, 160, 160);
    ctx.setFillStyle('#C3C9D3');
    const cells = [[0,0],[1,0],[0,1],[1,1],[2,2],[3,3],[2,3],[3,2],[1,3],[2,1],[3,0],[0,2]];
    cells.forEach((c) => { ctx.fillRect(252 + c[0] * 34, 684 + c[1] * 34, 24, 24); });
    ctx.setFillStyle('#13213B');
    ctx.setFontSize(22);
    ctx.fillText('扫码咨询', W / 2, 820);

    // 底部说明
    ctx.setFillStyle('rgba(255,255,255,0.9)');
    ctx.setFontSize(26);
    ctx.fillText('长按识别二维码 · 免费一对一升学规划', W / 2, 872);
    ctx.setFillStyle('rgba(255,255,255,0.65)');
    ctx.setFontSize(22);
    ctx.fillText('推广人：' + name, W / 2, 908);

    ctx.draw();
  },

  save() {
    wx.canvasToTempFilePath({
      canvasId: 'poster',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => wx.showToast({ title: '已保存到相册' }),
          fail: () => wx.showModal({
            title: '保存失败',
            content: '演示环境未授权相册，可截图保存海报。正式版接入二维码 API 生成专属海报。',
            showCancel: false
          })
        });
      },
      fail: () => wx.showToast({ title: '海报生成中，请稍后重试', icon: 'none' })
    });
  },

  onShareAppMessage() {
    return { title: '提升学历，选云南自修学校 · 免费一对一规划', path: '/pages/index/index' };
  }
});
