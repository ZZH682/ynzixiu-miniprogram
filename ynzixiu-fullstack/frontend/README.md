# 云南自修学校 · 前端（PC / 手机 / 公众号 H5）

本目录是「五站合一」项目的**唯一前端主线**，同一套响应式代码跑在 **PC 浏览器 / 手机浏览器 / 微信公众号 H5**。
视觉沿用品牌蓝 `#2350D8`、页面灰 `#F4F6FA`、深色 hero、白卡圆角、pill 按钮、四宫格业务、横滑喜报、悬浮咨询等设计令牌。

## 唯一入口

| 入口 | 说明 |
|---|---|
| **`index.html`（主入口）** | Hash 路由 SPA，30 个业务路由 + 2 个管理端路由。**真连 Java 后端**，后端不可达时自动降级为本地演示数据。 |
| `legacy/app.html` | 旧版 11 视图 + 4 Tab 体系，已归档，不参与构建、不进交付包，仅供版式对比。 |

> 历史上曾存在 `app.html` / `index.html` 两套前端。经确认，最终以页面更完整、路由更全的 `index.html` 为主，
> 旧 `app.html`、`js/app.js`、`js/mock.js`、`js/demo.js` 已整体移入 `frontend/legacy/`。
> Maven 构建时通过 `<excludes>` 排除 `legacy/**`，归档代码不会被打进 jar。

## 单端口同源架构（无需另起静态服务器）

后端 Spring Boot 监听 **8600**，前端静态资源由 `backend/pom.xml` 的 `<resources>` 打进
`classpath:/static/`，因此 **前端和 API 是同源的**：

```
http://localhost:8600/            → index.html
http://localhost:8600/js/api.js   → 前端脚本
http://localhost:8600/api/v1/...  → 后端 REST 接口
```

`js/api.js` 的 `apiBase()` 默认返回 `''`（同源），不再硬编码 `http://localhost:8600`，也不需要 CORS 或 nginx。

| 覆盖方式 | 用法 |
|---|---|
| 默认 | 同源，零配置 |
| 指定后端 | `window.API_BASE = 'https://xxx'` 或地址加 `?api=https://xxx` |
| 离线评审 | 不启动后端直接打开 `index.html`，自动进入离线演示模式 |

**离线降级不是静态假页面**：`js/sync.js` 在启动时请求 `/api/v1/content/catalog`，成功则把后端内容合并进
`window.MOCK`；失败则保留内置静态数据与 `localStorage`，页面与交互仍可完整演示。页脚会显示
「数据已连接后端 / 离线演示模式」，便于评审时判断当前数据源。

## 快速开始

不要单独启动本目录，直接按根目录 `README.md` 一键启动：

```bash
# Windows
start.bat

# Linux / macOS
bash start.sh

# 或手工启动（工作目录 backend/）
cd backend && ./apache-maven-3.9.9/bin/mvn -q -DskipTests spring-boot:run
```

浏览器打开 `http://localhost:8600/`。**不再需要** `python -m http.server 8620`。

演示登录：手机号任意 + 验证码 `123456`；管理端在 `#/admin-login`，账号 `13900000000` / `123456`。

## 文件结构

```
index.html        页面外壳 + 全部 CSS + 脚本加载顺序
js/data.js        静态演示数据（6 板块 / 课程章节 / 资讯 / 题库 / 喜报）
js/core.js        Hash 路由、Store、页面外壳、离线状态提示
js/api.js         REST 接入层：全部 /api/v1 端点 + JWT 注入 + 双 token 域
js/sync.js        数据同步层：catalog 合并、portal/me 回写、写操作统一刷新
js/pages.js       路由 1–11（首页 / 业务 / 课程列表 / 资讯 / 师资 / 评价 / 校区 / 资料 / 关于）
js/pages2.js      路由 12–30 + admin-login / admin（课程详情 / 拼团 / 刷题 / 模考 /
                  预约 / 登录 / 学习中心 / 订单 / 收据 / 我的 / 优惠券 / 邀请 /
                  海报 / 客服 / 管理端）
legacy/           旧 app.html 体系归档（app.html / app.js / mock.js / demo.js）
assets/           图片与图标资源
```

**脚本加载顺序不可调整**：`data.js → core.js → api.js → sync.js → pages.js → pages2.js`。

### 双 token 域

| 域 | localStorage key | 用途 |
|---|---|---|
| 用户端 | `yz_token` | 学员登录、下单、学习、刷题 |
| 管理端 | `yz_admin_token` | 管理端登录、统计、线索、导出 |

`api.js` 提供 `setAdminMode()` / `setAdminToken()` / `hasAdminToken()`，进入 `#/admin` 时切换管理端 token，
离开时切回，避免管理端令牌污染用户端请求。

### 金额单位

前端展示统一用**元**，后端与数据库统一用**分**。`sync.js` 提供 `yuan()` / `fen()` 做边界转换，
`pages2.js` 的所有下单、支付、尾款、提现动作都在调用 API 前完成换算。

## 页面与业务流（验收对照）

| 页面 | 路由 | 覆盖的建站方案验收点 |
|---|---|---|
| 首页 | `#/home` | 六大业务板块、Banner、政策头条、热门课程、营销入口、上岸喜报、品牌页脚 |
| 业务 / 板块详情 | `#/business`、`#/business/:id` | 分板块课程、备考资料、预约老师 |
| 课程列表 / 详情 | `#/course`、`#/course/:id` | 封面/价格/章节试听锁定 → 报名 → 登录 → 下单 → 支付 → **电子收据** |
| 资讯 / 详情 | `#/news`、`#/news/:id` | 政策与品牌内容展示 |
| 师资 / 评价 / 校区 / 关于 | `#/teachers`、`#/reviews`、`#/campus`、`#/about` | 品牌与信任背书 |
| 资料 | `#/materials` | 学员专享资料下载（登录后调后端记录） |
| 拼团 | `#/group/:id` | 参团、成团进度（服务端分布式锁防超员） |
| 刷题 / 分科练习 | `#/quiz`、`#/quiz/practice/:sid` | 12 科目、逐题作答、即时判分、解析与选项高亮 |
| 模考 / 成绩 / 错题本 | `#/quiz/exam`、`#/quiz/result`、`#/quiz/errors` | 服务端组卷、交卷算分、错题 upsert 累计 |
| 预约咨询 / 列表 | `#/signup`、`#/signup-list` | 招生线索表单，提交后管理端可查、可导出 |
| 登录 | `#/login` | 短信验证码登录（演示码 `123456`），JWT 写入 |
| 学习中心 | `#/study` | 章节学习进度上报，已购课程解锁 |
| 订单 / 收据 | `#/order`、`#/receipt/:id` | 订单状态、分期首付与尾款、电子收据号 |
| 我的 | `#/mine` | 订单、模考、预约、错题数、管理端入口 |
| 优惠券 / 邀请 / 海报 / 客服 | `#/coupon`、`#/invite`、`#/poster`、`#/service` | 领券、分销佣金、裂变海报、客服留言 |
| 管理端登录 / 管理端 | `#/admin-login`、`#/admin` | 分板块营收、线索状态流转、订单/线索 CSV 导出（UTF-8 BOM） |

## 数据同步机制

```
打开页面
  └─ YzSync.hydrateCatalog()  → GET /api/v1/content/catalog
       ├─ 成功：合并进 window.MOCK（板块/课程/资讯/师资/题库/轮播/优惠券）
       ├─ 派发 yz:sync-ready → 重渲染当前路由
       └─ 失败：保留内置 MOCK + localStorage，页脚标记「离线演示模式」

登录 / 登出
  ├─ 登录成功 → YzSync.hydrateMe() → GET /api/v1/portal/me
  │              把订单、学习进度、错题、优惠券、佣金等写回 Store
  ├─ 派发 yz:login / yz:logout
  └─ 写操作统一走 YzSync.write(apiCall, fallback, okMsg)：
       先调真实 API → 成功后重新 hydrateMe() → 失败回退本地演示逻辑
```

所有写操作都设计了**失败回退**，因此后端未启动或接口异常时演示流程不中断。

## 部署与已知限制

1. 前端随后端 jar 一起发布，无需独立静态托管；如需 CDN 分离，把 `frontend/` 内容整体上传并配置 `window.API_BASE`。
2. 公众号后台 → 自定义菜单 → 跳转网页 → 填官网域名；域名备案、微信认证属于外部资质，本项目不提供。
3. 上线前需由学校替换喜报、师资、资质、评价等示例文案与图片；`js/data.js` 中的示例内容应删除或替换。
4. `/api/v1/content/catalog` 为便于离线演示会下发题库答案，生产环境应移除答案字段或改为登录后按题单下发。
5. 支付、短信、视频点播均为演示实现，未接真实微信/支付宝通道与短信网关。
6. 小程序 / APP 可复用同一套 `js/api.js` 与后端 46 个接口，仅替换视图层；本项目交付范围不含小程序审核与 APP 上架。

## 已验证

- `node --check frontend/js/*.js` 全部通过（6 个脚本）
- 用最小 DOM mock 按真实加载顺序 eval 全部脚本，**32/32 路由渲染无异常**，9 个离线写动作兜底正常
- 后端 `mvn test`：14 个自动化测试通过（4 个纯单测 + 10 个 `@SpringBootTest` 全链路集成测试）
- 集成测试真实启动 H2 + Spring Boot，覆盖静态站点、内容聚合、登录、留资、题库、下单支付、收据、库存、客服留言、管理端 CSV 导出、未知路径 404
- 最终 jar 真实 HTTP 冒烟 46 项断言全部通过
- `mvn package` 后 jar 内 `BOOT-INF/classes/static/` 包含 `index.html` 与全部新脚本，且不含 `legacy/**`
