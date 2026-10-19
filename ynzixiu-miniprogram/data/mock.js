// 演示用示例数据。正式版由学校在后台录入，接口返回同样的结构。

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

// 上岸喜报：示例，正式版须取得学员本人同意后展示
const stories = [
  { id: 1, name: '王同学', bid: 3, tag: '2026 专升本', result: '已录取 · 省内公办本科', quote: '白天实习，晚上刷题，最后两个月跟着集训营冲刺。' },
  { id: 2, name: '李女士', bid: 1, tag: '成考专升本', result: '已录取 · 工商管理', quote: '工作十年想补个本科，老师帮我把报名到选专业都理清了。' },
  { id: 3, name: '赵同学', bid: 4, tag: '2026 省考', result: '进入面试 · 县级岗位', quote: '面试模拟练了六次，进考场时一点都不慌。' },
  { id: 4, name: '陈同学', bid: 6, tag: '雅思', result: '总分 6.5 · 已拿录取', quote: '口语陪练每周两次，Part 2 再也不卡壳。' }
];

const banners = [
  { id: 1, kicker: '学历提升', title: '成考、国开、自考、专升本\n哪条路适合你', action: '免费预约规划', to: '/pages/signup/index', theme: 'ink' },
  { id: 2, kicker: '专升本集训营', title: '40 天封闭集训\n公共课 + 专业课', action: '查看课程', to: '/pages/course/detail?id=4', theme: 'brand' },
  { id: 3, kicker: '在线题库', title: '每天 10 分钟\n刷题、判卷、错题本', action: '开始刷题', to: '/pages/quiz/index', theme: 'teal', tab: true }
];

// ===== 直播课堂（演示：开播时间用“从现在起 N 小时”表达，演示时始终有即将开播的场次）=====
const lives = [
  {
    id: 1, bid: 3, status: 'live', startInHours: -1, viewers: 1286, cover: '升', color: '#4B3FC9', tint: '#EEECFC',
    title: '2026 云南专升本政策解读 · 招生院校与专业全解析', teacher: '陈老师', teacherNote: '专升本政策主讲',
    tags: ['政策解读', '招生院校', '志愿填报'],
    intro: '正在直播中：云南省普通专升本最新政策、招生院校与专业变化、志愿填报注意事项，支持弹幕提问，直播结束可看回放。',
    highlights: ['最新政策与时间节点', '招生院校与专业变化', '志愿填报避坑指南', '在线答疑互动']
  },
  {
    id: 2, bid: 1, status: 'upcoming', startInHours: 2, viewers: 0, cover: '学', color: '#2350D8', tint: '#EAF0FF',
    title: '成人高考报名倒计时 · 现场答疑', teacher: '李老师', teacherNote: '成考语文、英语主讲',
    tags: ['成人高考', '报名答疑'],
    intro: '成考报名即将截止，本场直播讲清报名流程、材料准备与常见问题，欢迎预约开播提醒，开播前 5 分钟通知你。',
    highlights: ['报名流程与材料清单', '考试科目与备考安排', '现场连麦答疑']
  },
  {
    id: 3, bid: 3, status: 'upcoming', startInHours: 26, viewers: 0, cover: '集', color: '#4B3FC9', tint: '#EEECFC',
    title: '专升本暑期集训营 · 开营说明会', teacher: '陈老师', teacherNote: '集训营班主任',
    tags: ['集训营', '开营说明'],
    intro: '40 天封闭集训怎么安排？公共课专业课如何分配？住宿与督学怎么管？开营前直播一次讲清楚。',
    highlights: ['集训日程与作息', '课程与师资安排', '住宿与督学服务', '入学准备清单']
  },
  {
    id: 4, bid: 4, status: 'replay', startInHours: -72, viewers: 932, cover: '面', color: '#B8432F', tint: '#FBECE8',
    title: '公务员面试礼仪与答题框架（回放）', teacher: '杨老师', teacherNote: '结构化面试考官经验',
    tags: ['公考', '面试'],
    intro: '回放：结构化面试评分标准、答题框架与考场礼仪，全程 48 分钟，可反复观看。',
    highlights: ['评分标准解读', '答题框架示范', '常见误区提醒']
  }
];

const liveById = (id) => lives.find((l) => l.id === Number(id));

// ===== 消息中心（演示：正式版由公众号模板消息 / 小程序订阅消息 / 短信下发）=====
const messages = [
  { id: 1, type: 'live', title: '直播开播提醒', summary: '你预约的「2026 云南专升本政策解读」即将开播，点击进入直播间', time: '今天 19:30', to: '/pages/live/detail?id=1' },
  { id: 2, type: 'course', title: '课程更新通知', summary: '你购买的「专升本公共课网课」新增第 6 节：模考讲评', time: '昨天 10:12', to: '/pages/course/detail?id=5' },
  { id: 3, type: 'signup', title: '预约回访', summary: '老师已收到你的规划预约，将在 1 个工作日内回电，请留意来电', time: '09-28 16:40', to: '/pages/signup/list' },
  { id: 4, type: 'coupon', title: '优惠券到期提醒', summary: '「满 3000 减 300」专享券明天到期，报课前记得使用', time: '09-27 09:15', to: '/pages/marketing/coupon' },
  { id: 5, type: 'system', title: '订单支付成功', summary: '你的订单已支付成功，电子收据可在「我的订单」查看', time: '09-20 14:30', to: '/pages/order/list' },
  { id: 6, type: 'live', title: '直播回放已生成', summary: '你关注的「公务员面试礼仪与答题框架」回放已生成，可随时观看', time: '09-18 11:00', to: '/pages/live/detail?id=4' }
];

// ===== 领券中心（演示：领取后存入本地“我的优惠券”）=====
const coupons = [
  { id: 1, name: '新人立减券', amount: 100, min: 500, all: true, expireDays: 30, desc: '全场课程满 500 元可用', color: '#2350D8' },
  { id: 2, name: '专升本专享券', amount: 300, min: 3000, courseIds: [4, 5], expireDays: 30, desc: '专升本课程满 3000 元可用', color: '#4B3FC9' },
  { id: 3, name: '老学员回馈券', amount: 200, min: 2000, all: true, expireDays: 45, desc: '全场课程满 2000 元可用', color: '#0E7C7B' },
  { id: 4, name: '面试特训券', amount: 500, min: 3980, courseIds: [7], expireDays: 30, desc: '面试特训班专用', color: '#B8432F' }
];

// ===== 拼团（演示：2 人 / 3 人团，开团后生成团号）=====
const groupons = [
  { id: 1, courseId: 4, title: '云南专升本暑期集训营', origin: 6800, group: 5980, need: 3, joined: 2, leader: '王**', endInHours: 8, char: '升', color: '#4B3FC9', tint: '#EEECFC' },
  { id: 2, courseId: 1, title: '成人高考考前辅导班', origin: 1280, group: 980, need: 2, joined: 1, leader: '李**', endInHours: 20, char: '学', color: '#2350D8', tint: '#EAF0FF' },
  { id: 3, courseId: 6, title: '省考笔试系统班', origin: 2980, group: 2580, need: 3, joined: 2, leader: '赵**', endInHours: 32, char: '公', color: '#B8432F', tint: '#FBECE8' }
];

const grouponById = (id) => groupons.find((g) => g.id === Number(id));

// ===== 转介绍分销（演示：10% 佣金，数据为示例）=====
const distribute = {
  rate: 0.1,
  totalEarn: 1860,
  available: 1260,
  team: [
    { name: '王同学', joined: '2026-09-20', status: '已报名', earn: 128, course: '专升本公共课网课' },
    { name: '李女士', joined: '2026-09-15', status: '已报名', earn: 98, course: '成考考前辅导班' },
    { name: '赵同学', joined: '2026-09-10', status: '已报名', earn: 298, course: '省考笔试系统班' },
    { name: '陈同学', joined: '2026-09-02', status: '意向中', earn: 0, course: '—' }
  ]
};

const businessById = (id) => businesses.find((b) => b.id === Number(id));

module.exports = {
  businesses, courses, news, subjects, questions, stories, banners,
  lives, liveById, messages, coupons, groupons, grouponById, distribute, businessById
};
