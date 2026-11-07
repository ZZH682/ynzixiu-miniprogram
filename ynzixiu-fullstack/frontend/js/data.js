// 云南自修学校 · H5 官网示例数据（与小程序演示版 data/mock.js 同源）
// 正式版由学校在后台录入，接口返回同样的结构
window.MOCK = (function () {
  const businesses = [
    {
      id: 1, code: 'xueli', name: '成人学历教育', char: '学', color: '#2350D8', tint: '#EAF0FF',
      summary: '成考 · 国开 · 远程，在职也能拿学历',
      tags: ['成人高考', '国家开放大学', '远程教育'],
      audience: '在职人员、需要提升学历的社会考生',
      intro: '覆盖成人高考、国家开放大学、远程教育三种形式。从报考条件、学制专业到学信网认证，一位老师全程跟进。',
      offers: ['报考条件与学制专业介绍', '学信网认证查询指导', '考前辅导课程', '成考 / 国开 / 远程报名', '历年录取分数线', '一对一学历规划']
    },
    {
      id: 2, code: 'zikao', name: '自考助学', char: '自', color: '#0E7C7B', tint: '#E3F4F3',
      summary: '大小自考怎么选，加分政策讲清楚',
      tags: ['大自考', '小自考', '助学加分'],
      audience: '时间灵活、希望稳步拿到本科文凭的考生',
      intro: '讲清大自考和小自考的区别，说明助学加分政策，按专业配好科目、题库和网课，毕业与学位申请全程指导。',
      offers: ['大小自考区别说明', '助学加分政策', '各专业科目列表', '题库与网课资源', '毕业申请流程', '学位申请条件']
    },
    {
      id: 3, code: 'zsb', name: '统招专升本', char: '升', color: '#4B3FC9', tint: '#EEECFC',
      summary: '云南专升本，从政策解读到志愿填报',
      tags: ['政策解读', '集训营', '志愿填报'],
      audience: '云南省内应届专科生',
      intro: '聚焦云南省普通专升本：政策解读、历年分数线、招生院校与专业、考前集训营、志愿填报指导。',
      offers: ['云南专升本政策解读', '历年分数线查询', '招生院校与专业', '集训课程', '志愿填报指导', '上岸学员经验分享']
    },
    {
      id: 4, code: 'gongkao', name: '公考 / 事业单位', char: '公', color: '#B8432F', tint: '#FBECE8',
      summary: '省考、国考、三支一扶、教师编',
      tags: ['省考', '国考', '事业单位', '教师编'],
      audience: '准备公务员、事业单位、教师编考试的考生',
      intro: '招考公告持续更新，笔试面试分阶段特训，历年真题可下载，岗位报考有老师一对一指导。',
      offers: ['招考公告实时更新', '笔试面试特训课程', '历年真题下载', '面试模拟预约', '岗位报考指导']
    },
    {
      id: 5, code: 'kaoyan', name: '考研培训', char: '研', color: '#7A3FB8', tint: '#F3ECFB',
      summary: '择校择专业，到复试调剂',
      tags: ['择校', '公共课', '复试调剂'],
      audience: '本科在读或已毕业、计划读研的考生',
      intro: '考研全流程服务：择校择专业、公共课和专业课、线上线下集训营、复试调剂。',
      offers: ['择校择专业指导', '公共课 / 专业课课程', '复试调剂服务', '线上线下集训营', '考研资讯更新']
    },
    {
      id: 6, code: 'liuxue', name: '出国留学', char: '留', color: '#2F7D4F', tint: '#E7F4EC',
      summary: '多国申请、雅思托福、签证指导',
      tags: ['留学申请', '雅思托福', '签证'],
      audience: '计划出国读本科、硕士的学生和家长',
      intro: '英、澳、美、加等多国留学申请，配套雅思托福语言培训和签证办理指导。',
      offers: ['多国留学申请服务', '雅思托福语言培训', '签证办理指导', '录取案例展示', '留学规划一对一预约']
    }
  ];

  const ch = (title, dur, trial) => ({ title, dur, trial: !!trial });

  const courses = [
    {
      id: 1, bid: 1, title: '成人高考考前辅导班（高起专 / 专升本）', short: '成考考前辅导', type: 'recorded',
      price: 980, orig: 1280, teacher: '李老师', teacherNote: '成考语文、英语主讲', sales: 156,
      intro: '按成考大纲系统梳理考点，配套历年真题与模拟卷，班主任全程督学。',
      highlights: ['语文 / 数学 / 英语三科核心考点', '历年真题逐题精讲', '考前冲刺模拟与错题复盘', '报名与志愿填报指导'],
      chapters: [ch('导学：成考怎么考、怎么备', '12:40', 1), ch('语文：字音字形与病句', '38:15', 1), ch('数学：函数与方程', '45:02'), ch('英语：高频语法与完形', '41:30'), ch('真题精讲与冲刺', '52:18')]
    },
    {
      id: 2, bid: 1, title: '国家开放大学学历提升班', short: '国开学历提升', type: 'recorded',
      price: 880, orig: 1080, teacher: '王老师', teacherNote: '国开教务规划', sales: 89,
      intro: '国开免试入学，入学、作业、考试到毕业，教务老师全程提醒与辅导。',
      highlights: ['入学资格与专业选择', '每学期课程与作业提醒', '期末考试辅导', '毕业申请指导'],
      chapters: [ch('国开是什么、适合谁', '15:20', 1), ch('入学流程与材料', '18:05'), ch('学习平台使用', '22:40'), ch('考试与毕业', '20:12')]
    },
    {
      id: 3, bid: 2, title: '自考助学班（云南）', short: '自考助学', type: 'recorded',
      price: 1280, orig: 1580, teacher: '赵老师', teacherNote: '自考政策与公共课', sales: 67,
      intro: '讲清云南自考助学加分政策，核心科目精讲，配套题库刷题与考前复习。',
      highlights: ['助学加分政策详解', '核心科目考点精讲', '题库刷题与考前复习'],
      chapters: [ch('大自考与小自考', '16:45', 1), ch('助学加分怎么拿', '21:30'), ch('马原核心考点', '48:10'), ch('考前复习方法', '25:00')]
    },
    {
      id: 4, bid: 3, title: '云南专升本暑期集训营', short: '专升本集训营', type: 'live',
      price: 6800, orig: 8800, teacher: '陈老师', teacherNote: '专升本数学主讲', sales: 203,
      intro: '40 天封闭集训，名师面授加线上同步，公共课与专业课全覆盖。',
      highlights: ['40 天封闭集训，早读 + 正课 + 晚自习', '公共课 + 专业课全覆盖', '志愿填报一对一指导', '上岸学员经验分享'],
      chapters: [ch('开营直播：集训安排', '30:00', 1), ch('高数：极限与连续', '90:00'), ch('英语：阅读理解', '90:00'), ch('语文：作文专项', '90:00'), ch('全真模考讲评', '120:00')]
    },
    {
      id: 5, bid: 3, title: '专升本公共课网课（语文 + 数学 + 英语）', short: '专升本公共课', type: 'recorded',
      price: 1980, orig: 2580, teacher: '刘老师', teacherNote: '专升本英语主讲', sales: 178,
      intro: '随报随学，三科系统课配套题库与模考。',
      highlights: ['三科系统课程', '每章配套练习', '阶段模考与讲评'],
      chapters: [ch('备考规划', '14:20', 1), ch('高数：导数与微分', '46:30', 1), ch('英语：长难句', '39:45'), ch('语文：文言文阅读', '42:10'), ch('模考讲评', '55:00')]
    },
    {
      id: 6, bid: 4, title: '省考笔试系统班', short: '省考笔试', type: 'recorded',
      price: 2980, orig: 3980, teacher: '张老师', teacherNote: '行测主讲', sales: 145,
      intro: '行测五大模块与申论全程精讲，真题演练到考前。',
      highlights: ['行测五大模块精讲', '申论批改指导', '历年真题与模拟冲刺'],
      chapters: [ch('省考概况与备考路线', '18:00', 1), ch('言语理解', '62:30'), ch('数量关系', '70:15'), ch('判断推理', '66:40'), ch('申论：归纳概括', '58:20')]
    },
    {
      id: 7, bid: 4, title: '公务员面试特训班', short: '面试特训', type: 'live',
      price: 3980, orig: 4980, teacher: '杨老师', teacherNote: '结构化面试考官经验', sales: 98,
      intro: '结构化与无领导小组面试，全真模拟加一对一点评。',
      highlights: ['面试礼仪与答题框架', '题型精讲', '全真模拟', '一对一点评'],
      chapters: [ch('面试评分标准', '25:00', 1), ch('综合分析题', '60:00'), ch('组织计划题', '60:00'), ch('全真模拟与点评', '120:00')]
    },
    {
      id: 8, bid: 5, title: '考研政治全程班', short: '考研政治', type: 'recorded',
      price: 2580, orig: 3280, teacher: '马老师', teacherNote: '考研政治主讲', sales: 88,
      intro: '基础、强化、冲刺三阶段，配套时政专题。',
      highlights: ['马原、毛中特、史纲、思修全覆盖', '时政专题', '冲刺阶段重点梳理'],
      chapters: [ch('考研政治怎么学', '20:10', 1), ch('马原：唯物论', '52:40'), ch('毛中特：核心概念', '48:30'), ch('时政专题', '40:00')]
    },
    {
      id: 9, bid: 5, title: '考研英语二精讲班', short: '考研英语二', type: 'recorded',
      price: 2380, orig: 2980, teacher: '周老师', teacherNote: '考研英语主讲', sales: 76,
      intro: '词汇、长难句、阅读、写作四大模块，真题逐篇精讲。',
      highlights: ['核心词汇', '长难句拆解', '阅读真题精讲', '写作模板与批改'],
      chapters: [ch('英语二题型解析', '17:30', 1), ch('长难句拆解', '44:20', 1), ch('阅读：细节题', '50:10'), ch('小作文与大作文', '46:45')]
    },
    {
      id: 10, bid: 6, title: '雅思 6.5 目标班', short: '雅思 6.5', type: 'live',
      price: 5800, orig: 6800, teacher: '中外教团队', teacherNote: '听说读写分科授课', sales: 54,
      intro: '听说读写四科系统课，配模考点评与口语陪练。',
      highlights: ['四科系统课程', '每月一次全真模考', '口语一对一陪练'],
      chapters: [ch('雅思评分与备考路线', '22:00', 1), ch('听力：地图题', '60:00'), ch('口语：Part 2 话题', '60:00'), ch('写作：小作文图表', '60:00')]
    }
  ];

  const news = [
    {
      id: 1, bid: 1, category: '成考', top: true, date: '2026-09-01', views: 320,
      title: '2026 年云南省成人高考报名要点（示例）',
      summary: '报名时间、考试时间、报名条件速览',
      content: ['【示例内容，正式版由学校按官方公告录入】', '云南省成人高考一般在 9 月网上报名，10 月下旬考试。报考者须年满 18 周岁；报考专升本须具有国民教育系列专科及以上学历。', '具体时间与条件以云南省招生考试院公告为准。']
    },
    {
      id: 2, bid: 2, category: '自考', top: true, date: '2026-08-20', views: 280,
      title: '云南自考助学加分政策解读（示例）',
      summary: '哪些科目能加分、怎么申请，一篇讲清',
      content: ['【示例内容，正式版由学校按官方公告录入】', '参加正规助学班的考生，部分科目可享受过程性考核加分。加分的科目范围与分值以当年政策为准。', '具体以云南省招生考试院发布为准。']
    },
    {
      id: 3, bid: 3, category: '专升本', top: true, date: '2026-08-15', views: 410,
      title: '云南专升本录取分数线怎么看（示例）',
      summary: '近三年分数线趋势与备考建议',
      content: ['【示例内容，正式版由学校按官方公告录入】', '云南省统招专升本按类别划定分数线，公办院校竞争更激烈。建议尽早开始公共课备考。', '具体以云南省招生考试院发布为准。']
    },
    {
      id: 4, bid: 4, category: '公考', top: false, date: '2026-08-10', views: 356,
      title: '公务员考试全年时间节点（示例）',
      summary: '省考、国考、三支一扶关键节点',
      content: ['【示例内容，正式版由学校按官方公告录入】', '国考一般 10 月报名、11 月或 12 月笔试；省考多在上半年；三支一扶、事业单位招聘全年分批进行。', '具体以官方公告为准。']
    },
    {
      id: 5, bid: 5, category: '考研', top: false, date: '2026-08-05', views: 198,
      title: '2027 考研备考时间轴（示例）',
      summary: '从择校到复试的关键节点',
      content: ['【示例内容，正式版由学校按官方公告录入】', '3–6 月打基础，7–9 月强化，10 月报名，12 月初试，次年 3–4 月复试调剂。', '具体以研招网发布为准。']
    },
    {
      id: 6, bid: 6, category: '留学', top: false, date: '2026-07-30', views: 156,
      title: '留学申请什么时候考语言（示例）',
      summary: '雅思、托福规划时间表',
      content: ['【示例内容，正式版由学校按官方公告录入】', '建议在递交申请前 6–12 个月开始准备语言考试，给重考留出时间。', '具体要求以目标院校官网为准。']
    }
  ];

  const subjects = [
    { id: 1, bid: 1, name: '成考 · 语文' },
    { id: 2, bid: 1, name: '成考 · 英语' },
    { id: 3, bid: 2, name: '自考 · 马克思主义基本原理' },
    { id: 4, bid: 3, name: '专升本 · 高等数学' },
    { id: 5, bid: 4, name: '公考 · 行测' },
    { id: 6, bid: 5, name: '考研 · 政治' },
    { id: 7, bid: 6, name: '留学 · 雅思词汇' }
  ];

  const q = (id, sid, stem, opts, answer, analysis) => ({ id, sid, stem, opts, answer, analysis });

  const questions = [
    q(101, 1, '下列词语中，书写完全正确的一项是', ['按部就班', '按步就班', '按部就搬', '按步就搬'], 'A', '“按部就班”是固定写法，“部”指门类。'),
    q(102, 1, '“山重水复疑无路，柳暗花明又一村”的作者是', ['李白', '杜甫', '陆游', '白居易'], 'C', '出自南宋陆游《游山西村》。'),
    q(103, 1, '下列句子中，没有语病的一项是', ['通过这次活动，使我深受教育。', '我们要养成勤洗手的好习惯。', '他的学习成绩有了明显的增加。', '这本书对我很感兴趣。'], 'B', 'A 缺主语；C “成绩”应搭配“提高”；D 主客颠倒。'),
    q(104, 1, '“档案”中“档”字的正确读音是', ['dǎng', 'dàng', 'dāng', 'tàng'], 'B', '“档”读 dàng，常被误读成 dǎng。'),
    q(201, 2, 'The weather in Kunming is ______ than that in Beijing.', ['good', 'better', 'best', 'well'], 'B', '有 than，用比较级；good 的比较级是 better。'),
    q(202, 2, 'She has lived in Kunming ______ 2019.', ['for', 'since', 'at', 'in'], 'B', 'since 接时间点，for 接时间段。'),
    q(203, 2, '— Could you help me carry the box?  — ______.', ['Yes, I could', "No, I couldn't", 'Sure, no problem', "That's right"], 'C', '回应 Could you... 的请求，肯定回答常用 Sure / Of course。'),
    q(301, 3, '哲学的基本问题是', ['物质和意识的关系问题', '实践和认识的关系问题', '运动和静止的关系问题', '内因和外因的关系问题'], 'A', '哲学的基本问题是思维和存在，即物质和意识的关系问题。'),
    q(302, 3, '马克思主义的三个组成部分不包括', ['马克思主义哲学', '马克思主义政治经济学', '科学社会主义', '空想社会主义'], 'D', '马克思主义由哲学、政治经济学、科学社会主义三部分组成。'),
    q(303, 3, '划分唯物主义和唯心主义的唯一标准是', ['是否承认世界可知', '思维和存在何者为第一性', '是否承认矛盾推动发展', '是否承认运动是物质的根本属性'], 'B', '对思维和存在何者第一性的不同回答，划分唯物主义与唯心主义。'),
    q(401, 4, '函数 f(x) = x² − 4x + 3 的对称轴是', ['x = 1', 'x = 2', 'x = 3', 'x = −2'], 'B', '对称轴 x = −b / 2a = 4 / 2 = 2。'),
    q(402, 4, '当 x → 0 时，sin x / x 的极限是', ['0', '1', '∞', '不存在'], 'B', '重要极限：lim(x→0) sin x / x = 1。'),
    q(403, 4, '设 f(x) = eˣ，则 f′(x) =', ['eˣ', 'x·eˣ⁻¹', 'eˣ⁻¹', 'ln x'], 'A', 'eˣ 的导数仍是 eˣ。'),
    q(404, 4, '∫ 2x dx =', ['x² + C', '2x² + C', 'x + C', '2 + C'], 'A', '(x²)′ = 2x，所以 ∫ 2x dx = x² + C。'),
    q(501, 5, '与“口若悬河”意思最接近的是', ['沉默寡言', '滔滔不绝', '语无伦次', '言简意赅'], 'B', '“口若悬河”形容能说会道，与“滔滔不绝”相近。'),
    q(502, 5, '某班 50 人，男生占 60%，女生有多少人', ['15', '20', '25', '30'], 'B', '50 × (1 − 60%) = 20。'),
    q(503, 5, '关于二十四节气，下列说法正确的是', ['立春是夏季的第一个节气', '冬至这天北半球白昼最短', '小暑比大暑热', '惊蛰在清明之后'], 'B', '冬至太阳直射南回归线，北半球白昼最短。'),
    q(504, 5, '2, 4, 8, 16, ( )', ['18', '24', '32', '30'], 'C', '每项是前一项的 2 倍，16 × 2 = 32。'),
    q(601, 6, '剩余价值产生的唯一源泉是', ['不变资本', '可变资本', '固定资本', '流动资本'], 'B', '只有购买劳动力的可变资本才能创造剩余价值。'),
    q(602, 6, '我国社会主义初级阶段的基本经济制度包括', ['单一公有制', '公有制为主体、多种所有制经济共同发展', '私有制为主体', '计划经济为主'], 'B', '公有制为主体、多种所有制经济共同发展。'),
    q(603, 6, '“一国两制”构想最初是为解决什么问题提出的', ['台湾问题', '香港问题', '澳门问题', '南海问题'], 'A', '“一国两制”最初为解决台湾问题提出，率先用于香港。'),
    q(701, 7, 'abandon 最接近的意思是', ['放弃', '接受', '提高', '包含'], 'A', 'abandon v. 放弃、抛弃。'),
    q(702, 7, '下列单词中，重音在第一个音节的是', ['about', 'picture', 'computer', 'arrive'], 'B', 'picture /ˈpɪktʃə/，重音在第一个音节。'),
    q(703, 7, 'environment 的正确拼写是', ['environmnet', 'enviornment', 'environment', 'environement'], 'C', '正确拼写是 environment。')
  ];

  const stories = [
    { id: 1, name: '王同学', bid: 3, tag: '2026 专升本', result: '已录取 · 省内公办本科', quote: '白天实习，晚上刷题，最后两个月跟着集训营冲刺。' },
    { id: 2, name: '李女士', bid: 1, tag: '成考专升本', result: '已录取 · 工商管理', quote: '工作十年想补个本科，老师帮我把报名到选专业都理清了。' },
    { id: 3, name: '赵同学', bid: 4, tag: '2026 省考', result: '进入面试 · 县级岗位', quote: '面试模拟练了六次，进考场时一点都不慌。' },
    { id: 4, name: '陈同学', bid: 6, tag: '雅思', result: '总分 6.5 · 已拿录取', quote: '口语陪练每周两次，Part 2 再也不卡壳。' }
  ];

  const banners = [
    { id: 1, kicker: '学历提升', title: '成考、国开、自考、专升本\n哪条路适合你', action: '免费预约规划', to: '#/signup', theme: 'ink' },
    { id: 2, kicker: '专升本集训营', title: '40 天封闭集训\n公共课 + 专业课', action: '查看课程', to: '#/course/4', theme: 'brand' },
    { id: 3, kicker: '在线题库', title: '每天 10 分钟\n刷题、判卷、错题本', action: '开始刷题', to: '#/quiz', theme: 'teal' }
  ];

  // —— 营销裂变：示例规则，正式版由学校在后台「营销」模块配置 ——
  const groupBuys = [
    { courseId: 4, size: 3, price: 5980, hours: 24 },
    { courseId: 5, size: 3, price: 1680, hours: 24 },
    { courseId: 6, size: 2, price: 2580, hours: 24 },
    { courseId: 10, size: 2, price: 5200, hours: 24 }
  ];

  const openGroups = [
    { id: 'G801', courseId: 4, leader: '张同学', joined: 2, leftMin: 312 },
    { id: 'G802', courseId: 4, leader: '周同学', joined: 1, leftMin: 1185 },
    { id: 'G803', courseId: 5, leader: '杨同学', joined: 2, leftMin: 96 },
    { id: 'G804', courseId: 6, leader: '吴同学', joined: 1, leftMin: 640 },
    { id: 'G805', courseId: 10, leader: '孙同学', joined: 1, leftMin: 418 }
  ];

  const coupons = [
    { id: 'Q1', bid: 0, name: '新学员通用券', amount: 100, min: 800, days: 30 },
    { id: 'Q2', bid: 3, name: '专升本集训营专享', amount: 500, min: 5000, days: 15 },
    { id: 'Q3', bid: 1, name: '成考 / 国开立减', amount: 80, min: 800, days: 30 },
    { id: 'Q4', bid: 2, name: '自考助学立减', amount: 150, min: 1200, days: 30 },
    { id: 'Q5', bid: 4, name: '公考课程立减', amount: 300, min: 2500, days: 30 },
    { id: 'Q6', bid: 5, name: '考研课程立减', amount: 200, min: 2000, days: 30 },
    { id: 'Q7', bid: 6, name: '雅思班立减', amount: 400, min: 5000, days: 30 }
  ];

  const referralRule = { rate1: 0.05, rate2: 0.02, friendCoupon: 'Q1' };

  const referralSeed = [
    { id: 'R1', name: '刘同学', course: '专升本集训营', paid: 5980, level: 1, status: 'paid', date: '2026-09-28' },
    { id: 'R2', name: '何女士', course: '国开学历提升', paid: 880, level: 2, status: 'paid', date: '2026-09-21' },
    { id: 'R3', name: '黄同学', course: '预约 · 专升本规划', paid: 0, level: 1, status: 'lead', date: '2026-10-06' }
  ];
  const promoSeed = { shares: 14, visits: 52, leads: 6 };

  // —— 名师团队：示例，正式版由学校提供真实师资信息 ——
  const teachers = [
    { id: 1, bid: 1, name: '李老师', title: '成考语文 · 英语主讲', years: 12, students: 1560, tags: ['考点梳理', '真题精讲'], intro: '十二年成考辅导经验，擅长把语文和英语的考点拆成好记的模块，学员平均提分 40+。' },
    { id: 2, bid: 1, name: '王老师', title: '国开教务规划师', years: 8, students: 890, tags: ['入学指导', '毕业跟进'], intro: '熟悉国家开放大学各专业入学与毕业要求，负责国开学员从报名到毕业的全程教务提醒。' },
    { id: 3, bid: 2, name: '赵老师', title: '自考政策与公共课讲师', years: 10, students: 1120, tags: ['助学加分', '马原'], intro: '专注云南自考政策解读与公共课教学，主讲马克思主义基本原理、近现代史纲要。' },
    { id: 4, bid: 3, name: '陈老师', title: '专升本数学主讲', years: 11, students: 2030, tags: ['高数', '志愿填报'], intro: '专升本数学辅导十一年，主编校内高数讲义三套，带出多名公办本科录取学员。' },
    { id: 5, bid: 3, name: '刘老师', title: '专升本英语主讲', years: 9, students: 1780, tags: ['阅读', '写作模板'], intro: '英语专业八级，擅长长难句拆解和写作速成，学员英语平均分 82+。' },
    { id: 6, bid: 4, name: '张老师', title: '行测主讲', years: 13, students: 1450, tags: ['言语', '判断推理'], intro: '十三年公考教研经验，行测五大模块体系化教学，解题技巧讲得透、记得住。' },
    { id: 7, bid: 4, name: '杨老师', title: '结构化面试教练', years: 10, students: 960, tags: ['全真模拟', '一对一点评'], intro: '有考官视角的面试教练，全真模拟 + 逐题点评，帮助学员克服紧张、答出亮点。' },
    { id: 8, bid: 5, name: '马老师', title: '考研政治主讲', years: 12, students: 880, tags: ['马原', '时政'], intro: '考研政治全程班主讲，基础到冲刺三阶段教学，时政专题命中率高。' },
    { id: 9, bid: 5, name: '周老师', title: '考研英语主讲', years: 9, students: 760, tags: ['长难句', '写作批改'], intro: '考研英语一 / 二均有权威授课经验，阅读真题逐篇精讲，作文一批一改。' },
    { id: 10, bid: 6, name: '中外教团队', title: '雅思听说读写分科授课', years: 7, students: 540, tags: ['口语陪练', '模考点评'], intro: '中教负责技巧与方法，外教负责口语与写作思维，每月一次全真模考。' }
  ];

  // —— 学员评价：示例，正式版须取得学员本人同意后展示 ——
  const reviews = [
    { id: 1, bid: 3, name: '王同学', tag: '2026 专升本 · 已录取', course: '云南专升本暑期集训营', rating: 5, date: '2026-09-28', content: '40 天集训收获很大，数学从 60 分提到 102 分。老师晚自习还在答疑，志愿填报也帮我避开了扎堆的院校。' },
    { id: 2, bid: 1, name: '李女士', tag: '成考专升本', course: '成人高考考前辅导班', rating: 5, date: '2026-09-15', content: '工作十年还能捡起英语，多亏李老师把语法讲得清楚。报名、审核、准考证都是教务老师提醒到位的。' },
    { id: 3, bid: 4, name: '赵同学', tag: '2026 省考 · 进面', course: '公务员面试特训班', rating: 5, date: '2026-08-30', content: '面试模拟练了六次，从不敢开口到流畅作答。杨老师点评很细，一个眼神、一个手势都会纠正。' },
    { id: 4, bid: 2, name: '孙同学', tag: '自考本科 · 在读', course: '自考助学班（云南）', rating: 4, date: '2026-08-22', content: '助学加分政策讲得明白，题库和网课配套用起来很方便。马原跟着赵老师过了两遍，考了 78 分。' },
    { id: 5, bid: 5, name: '钱同学', tag: '2027 考研 · 备考中', course: '考研政治全程班', rating: 5, date: '2026-08-10', content: '马原部分讲得特别好懂，时政专题省了自己整理的时间。每周的学习计划很清晰。' },
    { id: 6, bid: 6, name: '陈同学', tag: '雅思 6.5 · 已拿录取', course: '雅思 6.5 目标班', rating: 5, date: '2026-07-25', content: '口语陪练每周两次，Part 2 再也不卡壳了。模考点评能看出自己在哪个分数段，备考很有方向。' },
    { id: 7, bid: 3, name: '周同学', tag: '2026 专升本 · 已录取', course: '专升本公共课网课', rating: 4, date: '2026-07-18', content: '网课可以倍速回看，适合学校还有课的专科生。每章配套练习做完再看讲评，效果更好。' },
    { id: 8, bid: 1, name: '吴先生', tag: '国开专科 · 在读', course: '国家开放大学学历提升班', rating: 5, date: '2026-07-05', content: '免试入学，教务老师每学期提前提醒作业和考试，对上班族很友好。' }
  ];

  // —— 校区环境：占位示意，正式版替换为实景图片 / 视频 ——
  const campus = [
    {
      id: 1, name: '昆明总校', addr: '昆明市五华区示例路 88 号 · 示例大厦 3-5 层', phone: '199-0888-3061',
      areas: ['总部教学区', '多媒体教室', '安静自习室', '学员休息区']
    },
    {
      id: 2, name: '呈贡学习中心', addr: '昆明市呈贡大学城示例大道 12 号 · 示例广场 2 层', phone: '199-0888-3061',
      areas: ['集训授课区', '答疑教室', '模考机房', '资料阅览区']
    }
  ];

  // —— 备考资料下载：示例，正式版由后台上传真实 PDF ——
  const materials = [
    { id: 1, bid: 1, name: '2026 成考政治考点速记手册', cat: '讲义', format: 'PDF', size: '2.4 MB', member: false },
    { id: 2, bid: 1, name: '成人高考历年真题（2021-2025）', cat: '历年真题', format: 'PDF', size: '12.8 MB', member: false },
    { id: 3, bid: 2, name: '云南自考助学加分政策说明', cat: '政策文件', format: 'PDF', size: '1.1 MB', member: false },
    { id: 4, bid: 2, name: '自考公共课真题分类汇编', cat: '历年真题', format: 'PDF', size: '18.6 MB', member: true },
    { id: 5, bid: 3, name: '云南专升本招生院校与专业目录', cat: '政策文件', format: 'PDF', size: '3.6 MB', member: false },
    { id: 6, bid: 3, name: '专升本高数公式定理大全', cat: '讲义', format: 'PDF', size: '4.2 MB', member: false },
    { id: 7, bid: 4, name: '行测 5000 题刷题册', cat: '讲义', format: 'PDF', size: '26.4 MB', member: true },
    { id: 8, bid: 4, name: '国考省考历年真题合集', cat: '历年真题', format: 'PDF', size: '32.1 MB', member: false },
    { id: 9, bid: 5, name: '考研英语二真题解析（2015-2026）', cat: '历年真题', format: 'PDF', size: '21.7 MB', member: true },
    { id: 10, bid: 5, name: '考研政治时政热点汇编', cat: '讲义', format: 'PDF', size: '5.9 MB', member: false },
    { id: 11, bid: 6, name: '雅思写作高分范文 30 篇', cat: '讲义', format: 'PDF', size: '8.3 MB', member: false },
    { id: 12, bid: 6, name: '雅思剑桥真题 4-19 全套', cat: '历年真题', format: 'PDF', size: '156 MB', member: true }
  ];

  const businessById = (id) => businesses.find((b) => b.id === Number(id));
  const courseById = (id) => courses.find((c) => c.id === Number(id));

  return {
    businesses, courses, news, subjects, questions, stories, banners, businessById, courseById,
    teachers, reviews, campus, materials,
    groupBuys, openGroups, coupons, referralRule, referralSeed, promoSeed
  };
})();
