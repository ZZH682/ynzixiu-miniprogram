# 云南自修学校 · 五站合一全栈项目

一个可直接运行、可演示、可讲解的全栈交付：**Spring Boot 3.2 后端 + 原生 HTML/CSS/JS 单页前端**，
前后端由同一个端口（8600）同源提供，覆盖「六大业务板块 → 咨询留资 → 选课试听 → 下单支付 →
电子收据 → 在线学习 → 刷题/模考/错题本 → 营销裂变 → 后台管理」完整业务闭环。

> 需求来源：`五站合一建站(3)(1).docx`（建站方案 + 9 条验收标准）。
> 本项目是**本地可运行的自研实现**，不是 SaaS 建站平台；微信审核、APP 上架、域名备案等
> 需要真实资质的环节不在交付范围内，见文末「已知限制」。

---

## 1. 快速开始（只需 JDK 21，无需安装 Maven / MySQL / Redis）

### Windows
```bat
start.bat
```
脚本用项目自带 Maven 启动 dev profile（H2 内存库，启动即自动建表 + 灌种子数据），
约 25 秒后自动打开浏览器。访问 **http://localhost:8600/**。

### Linux / macOS
```bash
bash start.sh          # 或 chmod +x start.sh && ./start.sh
```

### 手工启动（等价）
```bash
cd backend
./apache-maven-3.9.9/bin/mvn -q -DskipTests spring-boot:run     # Windows 用 mvn.cmd
# 浏览器打开 http://localhost:8600/
```

### 生产部署（MySQL 8 + Redis 7）
```bash
cp .env.example .env
# 首次部署：把 .env 里 DB_INIT_MODE 改成 always（建表 + 灌种子数据），启动后改回 never
docker compose up -d --build
# http://localhost:8600/
```

**演示账号**
| 角色 | 账号 | 凭证 |
|---|---|---|
| 学员 | 任意合法手机号（如 `13800138000`） | 验证码 `123456`（dev 演示码，`/auth/sms` 返回 `devCode`） |
| 管理员 | `13900000000` | 密码 `123456` |

健康检查：`http://localhost:8600/api/v1/health`；H2 控制台（dev）：`/h2-console`。

> **端口被占用怎么办**：若 8600 上已有其它服务（例如旧版本项目的后台进程），启动会报
> `Port 8600 was already in use`。可设环境变量 `SERVER_PORT=8601` 换端口启动，
> 或在确认不再需要后关闭占用进程（`netstat -ano | findstr :8600` 查 PID）。

---

## 2. 架构

```
浏览器 ── http://localhost:8600/ ──┬── /            → classpath:/static/index.html（前端 SPA）
                                   └── /api/v1/*     → Spring Boot Controller
                                                       ↓
                                        MyBatis-Plus → H2(dev) / MySQL(prod)
                                        Caffeine(dev) / Redis(prod)
```

- **单端口同源**：`backend/pom.xml` 的 `<resources>` 把 `frontend/` 复制进
  `target/classes/static/`，由 Spring Boot 直接托管，因此**不需要**另起静态服务器，也没有跨域问题。
  需要连独立后端时才用 `?api=http://host:port` 或 `window.API_BASE` 覆盖。
- **数据同步层** `frontend/js/sync.js`：一次性拉 `/content/catalog` 把数据库内容合并进
  `window.MOCK`，登录后拉 `/portal/me` 同步学员全链路数据；页面渲染逻辑保持不变。
  数据库金额单位是「分」，同步层统一换算成「元」。
- **离线降级**：后端不可达时保留静态数据 + `localStorage`，页面仍可完整演示；
  页脚会显示「数据已连接后端 / 离线演示模式」。
- **双 token 域**：用户端 `yz_token`、管理端 `yz_admin_token`，由服务端两套 JWT 密钥分别签发，互不通用。

---

## 3. 目录结构

```
ynzixiu-fullstack/
├── backend/
│   ├── pom.xml                        # 依赖 + 前端静态资源打包配置
│   ├── apache-maven-3.9.9/           # 内置 Maven（离线即可构建）
│   └── src/
│       ├── main/java/com/ynzx/server/
│       │   ├── controller/           # 9 个 Controller
│       │   ├── service/             # 11 个 Service（含 PortalService 聚合）
│       │   ├── entity/ mapper/ dto/ common/ config/ security/
│       │   ├── cache/ lock/ ratelimit/ task/
│       │   └── YnzixiuServerApplication.java
│       ├── main/resources/
│       │   ├── application.yml / -dev.yml / -prod.yml
│       │   └── db/h2/{schema,data}.sql · db/mysql/{schema,data}.sql
│       └── test/java/com/ynzx/server/   # 14 个测试（单元 + 全链路集成）
├── frontend/
│   ├── index.html                  # 唯一主入口 SPA（hash 路由）
│   ├── css/style.css               # PC 顶栏 + 移动端 Tab 响应式
│   ├── js/
│   │   ├── data.js                 # 静态内容（离线兜底）
│   │   ├── core.js                 # 路由 / Store / 外壳
│   │   ├── api.js                  # REST 接入层（同源，双 token 域）
│   │   ├── sync.js                 # 后端数据同步层
│   │   ├── pages.js / pages2.js    # 业务页面 + 管理端
│   │   └── assets/tab/             # Tab 图标
│   ├── legacy/                     # 旧版 app.html 体系（已归档，不参与运行/打包）
│   └── README.md
├── Dockerfile · docker-compose.yml · .dockerignore · .env.example
├── start.bat · start.sh · .gitignore
└── README.md · 项目简介-简历版.md
```

---

## 4. 后端接口清单（46 个，`/api/v1` 前缀）

| 模块 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 鉴权 | POST | `/auth/sms` | 发送验证码（dev 返回 `devCode`） |
| 鉴权 | POST | `/auth/login` | 验证码登录 / 自动注册，返回用户 JWT |
| 鉴权 | POST | `/auth/admin/login` | 管理员密码登录，返回管理端 JWT |
| 内容 | GET | `/content/businesses` | 六大业务板块 |
| 内容 | GET | `/content/news` | 政策资讯（bid / category / top 过滤） |
| 内容 | GET | `/content/teachers` | 名师团队 |
| 内容 | GET | `/content/stories` | 上岸喜报 |
| 内容 | GET | `/content/campuses` | 校区网点 |
| 内容 | GET | `/content/reviews` | 学员评价 |
| 内容 | GET | `/content/materials` | 备考资料 |
| 内容 | POST | `/content/materials/{id}/download` | 资料下载（会员资料校验已报名） |
| **门户** | GET | `/content/catalog` | **一次拉取全站内容**（板块/课程/章节/题库/资讯/师资/营销规则/设置） |
| **门户** | GET | `/content/settings` | 学校基础设置 |
| 课程 | GET | `/courses` · `/courses/{id}` · `/courses/{id}/chapters` | 课程列表 / 详情 / 章节（含试听权限） |
| 订单 | POST | `/orders` | 创建订单（幂等 + 事务内原子扣库存） |
| 订单 | GET | `/orders` · `/orders/{orderNo}` | 我的订单 / 订单详情 |
| 订单 | POST | `/orders/{orderNo}/pay` | 演示支付（分布式锁 + 状态机 + 自动出电子收据） |
| 题库 | GET | `/quiz/questions` | 分科题库（练习模式隐藏答案） |
| 题库 | POST | `/quiz/submit` | 提交单题（自动判分 + 错题本 upsert） |
| 题库 | GET | `/quiz/error-book` | 我的错题本 |
| 模考 | POST | `/exam/start` · `/exam/submit` | 组卷 / 交卷判分 |
| 模考 | GET | `/exam/records` | 模考记录 |
| 报名 | POST | `/signups` | 预约留资（公开） |
| 报名 | GET | `/signups/mine` | 我的预约 |
| 拼团 | POST | `/groups` · `/groups/{groupId}/join` | 开团 / 参团（锁 + 数据库条件更新防超员） |
| 拼团 | GET | `/groups` · `/groups/mine` | 可参团列表 / 我的团 |
| **门户** | GET | `/portal/me` | **一次同步学员全链路数据**（订单/预约/学习/刷题/错题/券/佣金/收据…） |
| **门户** | POST | `/portal/study` | 标记章节学习进度（试听或已购校验） |
| **门户** | POST | `/portal/coupons/{couponId}/claim` | 领券（防超发 + 防重复） |
| **门户** | POST | `/portal/withdraw` | 佣金提现（条件扣减余额） |
| **门户** | GET | `/portal/receipt/{orderNo}` | 电子收据 |
| **服务** | POST | `/service/message` | 在线客服留言（公开） |
| 管理 | GET | `/admin/stats` · `/admin/stats/business` | 仪表盘 / 分板块营收 |
| 管理 | GET | `/admin/orders` · `/admin/signups` | 订单管理 / 线索管理（可筛选） |
| 管理 | POST | `/admin/signups/{id}/status` | 线索状态流转 |
| 管理 | GET | `/admin/orders/export` · `/admin/signups/export` | 台账 CSV 导出（UTF-8 BOM） |
| 健康 | GET | `/health` | 健康检查（Docker healthcheck 使用） |

### 关键实现（面试可讲）
- **防超卖**：`CourseMapper.deductStock` 用 `UPDATE ... WHERE stock >= #{qty}` 条件更新，
  在下单事务内调用；`OrderService` 同时复用待支付订单，避免无效占用库存。
- **支付幂等**：Controller 层 `DistributedLock` 在**事务外**加锁（锁在事务内会提前释放），
  Service 层 `@Transactional` + 订单状态机条件更新，重复回调不重复扣款/出据。
- **资金正确性**：分期首付 `ceil(amount × 30%)`、尾款 `amount - paid`；支付后**重新查库**
  拿最新 `paid` 再结算佣金（旧版传未更新对象导致佣金恒为 0）。
- **限流**：`RateLimitInterceptor` 已注册进 `WebMvcConfig`，按「IP + 业务桶」滑动窗口限流；
  `RateLimiter` Bean 独立配置在 `RateLimitConfig`，避免与 MVC 配置循环依赖。
- **安全**：JWT 用户端 / 管理端双密钥域；`ThreadLocal` 在 `afterCompletion` 清理；
  `/portal/me` 只下发脱敏用户字段，不下发 `password_hash`；管理端接口独立校验 admin 密钥域。
- **缓存 / 锁降级**：Redis 不可用时自动降级 Caffeine / 本地锁（`CacheConfig` 探测），dev 无需 Redis。
- **CSV 兼容性**：导出写入 UTF-8 BOM，Excel 打开中文不乱码。

---

## 5. 前端

- **主入口**：`index.html`，30 个业务路由 + 2 个管理端路由（`admin-login` / `admin`），
  PC 顶栏 / 移动端底部 Tab 响应式，六大板块、课程详情、拼团、题库、模考、错题本、订单、收据、
  优惠券、转介绍、海报、客服、学习中心、预约、我的、管理后台等页面均可交互。
- **真实数据**：内容、题库、课程、科目、优惠券、拼团规则、轮播图来自数据库；
  登录后订单、预约、学习进度、错题本、佣金、收据从 `/portal/me` 同步。
- **写操作落库**：登录/验证码、下单支付、尾款、预约留资、答题判分、模考交卷、章节学习、
  领券、提现、资料下载、客服留言、拼团开团/参团、管理端状态流转与 CSV 导出均调用真实接口；
  失败时回退本地演示逻辑，保证离线可用。
- **管理后台**：`13900000000 / 123456` 登录后可看统计、分板块营收、订单/线索列表、
  状态流转与 CSV 导出；退出会重置 token 域，避免污染学员端请求。

脚本加载顺序固定：`data.js → core.js → api.js → sync.js → pages.js → pages2.js`。

---

## 6. 数据与生产环境

| 文件 | 用途 |
|---|---|
| `db/h2/schema.sql` | 33 张表，dev 启动时自动建表 |
| `db/h2/data.sql` | dev 种子数据：6 板块 / 12 科目 / 39 道题 / 3 课程 + 章节 / 资讯 / 名师 / 喜报 / 校区 / 评价 / 资料 / 优惠券 / 拼团规则 / 轮播图 / 站点配置 / 管理员 |
| `db/mysql/schema.sql` | MySQL 8 DDL |
| `db/mysql/data.sql` | MySQL 种子数据（与 H2 等价） |

站点基础配置（站点名、标语、热线、服务时间、地址、备案号）放在 `settings` 表，
由 `GET /api/v1/content/settings` 与 `catalog.settings` 下发；H2 侧 `v` 为 CLOB，
`SettingMapper` 走实体的 `String` 属性由 MyBatis 转换，避免 `JdbcClob` 被序列化成畸形 JSON。

`application-dev.yml`：`spring.sql.init.mode=always`（每次启动重建内存库）。
`application-prod.yml`：`mode=${DB_INIT_MODE:never}`，**首次部署设 `DB_INIT_MODE=always`**
完成建表 + 灌数据后改回 `never`（否则 schema 中的 `DROP TABLE IF EXISTS` 会清库）。

主要环境变量：`SERVER_PORT`、`SPRING_PROFILES_ACTIVE`、`DB_*`、`REDIS_*`、`DB_INIT_MODE`、
`CACHE_TYPE`、`LOCK_TYPE`、`JWT_USER_SECRET` / `JWT_ADMIN_SECRET`（≥ 32 字节）、
`SMS_DEV_CODE`、`RATE_LIMIT_ENABLED`、`RATE_LIMIT_QPM`。

---

## 7. 测试与验证

```bash
cd backend
./apache-maven-3.9.9/bin/mvn test
```

`mvn test` 共 **14 个用例全部通过**：

- `OrderServiceUnitTest`（4 个）：一次付清 / 分期首付 30% 向上取整 / 尾款 / 空值边界。
- `SmokeIntegrationTest`（10 个，`@SpringBootTest` 真实启动 + H2）：
  同源静态站点与健康检查 → 内容种子完整性 → 验证码登录 + `/portal/me` 鉴权与脱敏 →
  留资落库 → 题库与判分 → 下单支付 + 电子收据 → 库存销量扣减 → 客服留言 →
  管理员登录 + 统计 + CSV 导出 → 未知静态路径返回真 404（归档 `legacy/` 不对外暴露）。

前端 JS 可用 `node --check frontend/js/*.js` 做语法自检。

另外对**最终打包出的 jar** 做过真实 HTTP 冒烟，46 项断言全部通过：静态资源 7 项 +
归档 `legacy` 返回真 404 + 内容聚合 17 项 + 站点配置 + 登录 → 留资 → 题库 →
下单 → 支付 → 电子收据 → 重复支付幂等 → 学习进度 → 领券 → 客服留言 →
管理端统计/订单/线索/CSV BOM 导出/线索状态流转 + 用户与管理端权限隔离。
前端另用最小 DOM mock 逐路由渲染，**32/32 路由无异常**，9 个离线写动作兜底正常。

---

## 8. 与 RFP 验收标准对照

| RFP 验收点 | 状态 | 说明 |
|---|---|---|
| 六大板块页面内容完整、导航清晰 | ✅ | 6 板块独立页 + 板块详情 + 分板块课程/资讯/资料 |
| 注册 → 咨询留资 → 课程试看 → 在线缴费 → 学习中心 | ✅ | 全链路真实落库，含章节解锁与学习进度 |
| 在线刷题 / 模考 / 错题本 | ✅ | 12 科目 39 题，判分与错题本事务落库 |
| 支付功能、电子收据自动生成 | ✅ | 演示支付（非真实微信/支付宝），`receipts` 表 + 收据页 |
| 预约表单提交后台可查、线索导出 | ✅ | 公开提交 + 管理端筛选/状态流转 + CSV |
| 后台会员 / 订单 / 财务 / 营销模块 | ✅ | 统计、分板块营收、订单、线索、导出；营销规则由后台种子数据驱动 |
| PC / 手机 / 微信 / 小程序 / APP 五端访问、数据实时同步 | ⏳ 部分 | 交付**响应式 H5**（PC + 手机浏览器 + 微信内置浏览器三端同源）；小程序 / APP 为同一后端的接入层预留，未产出原生工程 |
| 小程序提交微信审核通过、APP 可下载安装 | ❌ 不在范围 | 需微信开发者账号、应用签名、域名备案与资质，本地无法交付 |

---

## 9. 已知限制（务必如实说明）

1. **支付 / 短信是演示实现**：`devCode=123456`，支付为服务端演示状态机，未接微信/支付宝网关。
2. **内容中含示例文案与占位素材**：师资、校区、喜报、资料链接为演示数据，上线前需替换为学校真实资料并取得授权。
3. **prod 首次初始化需手动开关**：`DB_INIT_MODE=always` 只用于首次部署，之后必须改回 `never`。
4. **`/content/catalog` 下发了题目答案**：用于前端练习页即时判卷的演示便利；
   生产应由服务端判卷接口返回答案，不向客户端泄露。
5. **不在交付范围**：微信小程序原生工程与审核、Android APP 打包与上架、域名/备案/SSL、
   真实短信通道、第三方客服系统对接、视频点播存储。
6. 旧版 `app.html` 体系已归档到 `frontend/legacy/`，仅作历史参考，不参与运行与打包。
