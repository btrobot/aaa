# 项目进度

## P0: 真实数据流 — 完成状态

> **目标**：将所有 mock 数据替换为真实 PostgreSQL 数据库连接，建立从前端到数据库的端到端数据流。

### ✅ 已完成

| 任务 | 状态 | 说明 |
|------|------|------|
| PostgreSQL 安装与配置 | ✅ | PostgreSQL 16 已安装运行，5432 端口 |
| 数据库创建 | ✅ | `nodecoda` 数据库已创建 |
| Drizzle 迁移 | ✅ | 44 张表全部迁移成功 |
| 种子数据 | ✅ | 9 产品、4 品牌、6 分类、2 语言、2 货币、2 国家、管理员/客户账号 |
| 产品 API | ✅ | GET 列表(分页/搜索/筛选)、GET 详情、POST 创建 |
| 分类 API | ✅ | GET 树形结构、POST 创建 |
| 品牌 API | ✅ | GET 列表、POST 创建 |
| 购物车 API | ✅ | GET 查询、POST 添加、PUT 更新、DELETE 删除 |
| 订单 API | ✅ | GET 查询(按客户/单号)、POST 创建(含购物车清空)、PUT 状态更新 |
| 认证 API | ✅ | POST 注册(201)、登录(200) |
| 客户 API | ✅ | GET 查询、POST 更新/地址/收藏夹 |
| 单元测试 | ✅ | 69 个测试全部通过，覆盖率 86.39% |
| TypeScript 检查 | ✅ | 零错误 |
| ESLint 检查 | ✅ | 零错误 |
| 接口冒烟测试 | ✅ | 全部 8 个 API 路由通过 |

### 🔄 待完成

| 任务 | 优先级 | 说明 |
|------|--------|------|
| 前端页面切换真实 API | P1 | 前台/后台页面从 mock 数据切换到调用 API 路由 |
| 购物车 GET 添加 locale 参数 | P1 | 当前 GET /api/cart 需传 locale=zh_cn 才能返回产品名称 |
| 管理后台 API 对接 | P1 | 产品/分类/品牌/订单管理页面对接真实 API |
| 集成测试 | P2 | 增加端到端集成测试 |
| E2E 测试 | P2 | Playwright E2E 测试 |
| 配送模块 | P2 | 结账流程配送方式选择 |
| 支付模块 | P2 | Stripe/PayPal 集成 |

### ✅ 近期新增功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 文章/新闻模块 | ✅ | 完整 CRUD + 前台新闻列表/详情 + 后台管理 + 中英文双语 + 种子数据 (3 篇) |
| 分类/品牌管理 CRUD | ✅ | 后台管理页面，含新增/编辑/删除弹窗 |
| 订单详情页 | ✅ | 后台订单详情页，含状态流转按钮 |
| 配送模块 | ✅ | shipping_methods + shipping_method_descriptions 表，ShippingService，API 路由，3 种配送方式(标准/快递/经济)，结账流程配送方式选择，自动计算运费(满额免运费)，后台配送管理页面 |
| 支付模块 | ✅ | 新增 payment_status/payment_paid_at/payment_id 字段，PaymentService(模拟 Stripe/PayPal 创建支付 + 回调确认)，支付结果页，订单详情页显示支付状态 |
| 系统设置 | ✅ | SettingsService 批量读写，系统设置 API，后台设置页面(商店信息/货币语言/订单设置/税务发票/SEO) |

### 📊 测试覆盖率

| 文件 | Statements | Branch | Functions | Lines |
|------|-----------|--------|-----------|-------|
| 总计 | 86.39% | 65.07% | 92.3% | 89.11% |
| brand.service.ts | 93.93% | 65.62% | 100% | 100% |
| cart.service.ts | 100% | 71.42% | 100% | 100% |
| category.service.ts | 92.85% | 60% | 100% | 92.85% |
| customer.service.ts | 96.07% | 80% | 100% | 100% |
| order.service.ts | 89.13% | 60.71% | 78.57% | 91.11% |
| product.service.ts | 70.78% | 60.27% | 91.66% | 72.72% |

### 🐳 数据库

- **引擎**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **表数量**: 44
- **迁移目录**: `src/lib/db/migrations/`
- **种子数据**: `scripts/seed.ts` (运行: `pnpm seed`)

### 🔑 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@nodecoda.com | admin123 |
| 客户 | customer@nodecoda.com | test123456 |