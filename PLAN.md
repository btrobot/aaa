# BeikeShop 现代版 — 全栈电商平台重构计划

> 基于 Next.js 16 + TypeScript 5 + PostgreSQL + Tailwind CSS 4 + shadcn/ui
> 采用 TDD（测试驱动开发）方法论

---

## 一、总体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        前端层 (Next.js 16 App Router)                │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────────┐   │
│  │  前台商店页面  │  │  后台管理页面   │  │  API 路由 (RESTful)   │   │
│  │  (Shop Pages)  │  │  (Admin Pages) │  │  /api/*              │   │
│  └───────┬───────┘  └───────┬────────┘  └──────────┬───────────┘   │
│          │                  │                       │                │
│  ┌───────▼──────────────────▼───────────────────────▼───────────┐  │
│  │                    服务层 (Actions / Services)                  │  │
│  │  ProductService / OrderService / CartService / CustomerService  │  │
│  │  PaymentService / ShippingService / CurrencyService / ...       │  │
│  └───────────────────────────┬───────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────▼───────────────────────────────────┐  │
│  │                     数据访问层 (Drizzle ORM)                    │  │
│  │  Schema / Queries / Migrations / Relations                    │  │
│  └───────────────────────────┬───────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────▼───────────────────────────────────┐  │
│  │                    PostgreSQL 数据库                            │  │
│  │  50+ 张表：products / orders / customers / categories / ...    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 二、模块划分与实现顺序

### Phase 1：基础设施与数据层（第 1-2 天）

| 任务 | 测试 | 说明 |
|------|------|------|
| 1.1 项目初始化 + 测试框架 | ✅ | Vitest + React Testing Library + MSW |
| 1.2 数据库 Schema 设计 | ✅ | Drizzle ORM 定义 50+ 表 |
| 1.3 数据库迁移脚本 | ✅ | 自动生成迁移 |
| 1.4 种子数据工厂 | ✅ | 测试用数据生成器 |
| 1.5 基础工具库 | ✅ | 类型定义、验证、错误处理 |

### Phase 2：核心业务层（第 3-5 天）

| 任务 | 测试 | 说明 |
|------|------|------|
| 2.1 产品管理模块 | ✅ | CRUD + SKU + 属性 + 分类 |
| 2.2 分类管理模块 | ✅ | 多级分类 + 路径 |
| 2.3 品牌管理模块 | ✅ | 品牌 CRUD |
| 2.4 客户管理模块 | ✅ | 注册/登录/地址管理 |
| 2.5 购物车模块 | ✅ | 购物车 + 购物车项 |
| 2.6 订单管理模块 | ✅ | 订单 + 订单项 + 状态机 |
| 2.7 支付模块 | ✅ | Stripe + PayPal 集成 |
| 2.8 配送模块 | ✅ | 配送方式 + 运费计算 |
| 2.9 货币模块 | ✅ | 多货币 + 汇率转换 |
| 2.10 多语言模块 | ✅ | 11 种语言支持 |

### Phase 3：前台商店（第 6-8 天）

| 任务 | 测试 | 说明 |
|------|------|------|
| 3.1 首页 | ✅ | Banner + 热销 + 分类 |
| 3.2 产品列表页 | ✅ | 搜索 + 筛选 + 排序 + 分页 |
| 3.3 产品详情页 | ✅ | 图片 + SKU + 属性 + 相关推荐 |
| 3.4 购物车页 | ✅ | 展示 + 数量调整 + 删除 |
| 3.5 结账流程 | ✅ | 地址 + 配送 + 支付 |
| 3.6 用户中心 | ✅ | 订单/地址/收藏/密码 |
| 3.7 品牌/分类页 | ✅ | 按品牌/分类浏览 |
| 3.8 文章页面 | ✅ | 公司新闻/帮助中心 |

### Phase 4：后台管理（第 9-11 天）

| 任务 | 测试 | 说明 |
|------|------|------|
| 4.1 仪表盘 | ✅ | 数据统计 + 图表 |
| 4.2 产品管理 | ✅ | CRUD + 批量操作 + 图片 |
| 4.3 订单管理 | ✅ | 列表 + 详情 + 状态流转 |
| 4.4 客户管理 | ✅ | 列表 + 详情 + 分组 |
| 4.5 分类管理 | ✅ | 树形结构 + 排序 |
| 4.6 品牌管理 | ✅ | CRUD |
| 4.7 属性管理 | ✅ | 属性组 + 属性值 |
| 4.8 系统设置 | ✅ | 多语言/货币/支付/配送 |
| 4.9 主题管理 | ✅ | 主题切换 + 装修 |
| 4.10 插件管理 | ✅ | 插件安装/卸载/配置 |

### Phase 5：高级特性（第 12-14 天）

| 任务 | 测试 | 说明 |
|------|------|------|
| 5.1 插件系统 | ✅ | Hook 机制 + 插件生命周期 |
| 5.2 REST API | ✅ | 完整的 API 接口 |
| 5.3 SEO 优化 | ✅ | sitemap + robots + structured data |
| 5.4 性能优化 | ✅ | RSC + Streaming + 图片优化 |
| 5.5 国际化完善 | ✅ | 11 种语言 + 货币切换 |
| 5.6 订单状态机 | ✅ | 状态流转 + 事件 + 通知 |

---

## 三、数据模型设计（核心表）

### 商品体系
```
products                    → 商品主表
product_skus               → SKU（规格库存）
product_descriptions       → 商品多语言描述
product_categories         → 商品-分类关联
product_attributes         → 商品属性值
product_relations          → 关联商品
product_images             → 商品图片
categories                 → 分类表
category_descriptions      → 分类多语言描述
category_paths             → 分类路径层级
brands                     → 品牌表
attributes                 → 属性定义
attribute_values           → 属性值
attribute_groups           → 属性组
```

### 订单体系
```
orders                     → 订单主表
order_products             → 订单商品
order_totals               → 订单金额明细
order_histories            → 订单状态历史
order_shipments            → 发货信息
order_payments             → 支付信息
```

### 客户体系
```
customers                  → 客户表
customer_addresses         → 客户地址
customer_groups            → 客户分组
customer_wishlists         → 收藏夹
carts                      → 购物车
cart_products              → 购物车商品
```

### 系统体系
```
settings                   → 系统设置
languages                  → 语言
currencies                 → 货币
countries                  → 国家
zones                      → 区域/州
tax_classes                → 税类
tax_rates                  → 税率
tax_rules                  → 税规则
admin_users                → 管理员
admin_user_tokens          → 管理员 Token
pages                      → 文章/页面
page_categories            → 文章分类
reviews                    → 评价
rmas                       → 退换货
notifications              → 通知
```

---

## 四、TDD 工作流

```
┌──────────────────────────────────────────────────┐
│                  TDD 循环                          │
│                                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│  │ 写测试   │ →  │ 测试失败  │ →  │ 写实现   │    │
│  │ (Red)    │    │ (Red)    │    │ (Green)  │    │
│  └──────────┘    └──────────┘    └─────┬────┘    │
│                                        │          │
│  ┌──────────┐    ┌──────────┐          │          │
│  │ 写测试   │ ←  │ 重构优化  │ ←────────┘          │
│  │ (下一轮)  │    │ (Refactor)│                    │
│  └──────────┘    └──────────┘                     │
└──────────────────────────────────────────────────┘

测试金字塔：
       ╱╲
      ╱  ╲         E2E 测试 (Playwright)
     ╱────╲        ─────────────────
    ╱      ╲      集成测试 (Supertest + MSW)
   ╱────────╲     ─────────────────
  ╱          ╲   单元测试 (Vitest + React Testing Library)
 ╱────────────╲  ─────────────────
```

### 测试策略

| 层级 | 工具 | 覆盖内容 |
|------|------|----------|
| **单元测试** | Vitest | Service 层、工具函数、验证逻辑 |
| **组件测试** | React Testing Library | UI 组件、页面渲染 |
| **集成测试** | Supertest + MSW | API 路由、数据流 |
| **E2E 测试** | Playwright | 关键用户流程 |

---

## 五、技术选型

| 类别 | 技术 | 版本 |
|------|------|------|
| **框架** | Next.js | 16 (App Router) |
| **语言** | TypeScript | 5+ (strict) |
| **UI 组件** | shadcn/ui | 最新 |
| **样式** | Tailwind CSS | 4 |
| **数据库** | PostgreSQL | 16 |
| **ORM** | Drizzle ORM | 最新 |
| **测试** | Vitest | 最新 |
| **组件测试** | React Testing Library | 最新 |
| **API 测试** | Supertest | 最新 |
| **Mock** | MSW (Mock Service Worker) | 最新 |
| **认证** | NextAuth.js | 5 |
| **支付** | Stripe SDK | 最新 |
| **国际化** | next-intl | 最新 |
| **状态管理** | Zustand | 最新 |
| **表单** | React Hook Form + Zod | 最新 |
| **图表** | Recharts | 最新 |
| **E2E** | Playwright | 最新 |

---

## 六、迭代里程碑

```
Day 1-2   ┃ Phase 1: 基础设施 ✅   ┃ 数据库 Schema + 测试框架 + 工具库
Day 3-5   ┃ Phase 2: 核心业务 ✅   ┃ 10 个核心业务模块 + 测试
Day 6-8   ┃ Phase 3: 前台商店 ✅   ┃ 8 个前台页面 + 组件测试
Day 9-11  ┃ Phase 4: 后台管理 ✅   ┃ 10 个后台模块 + 集成测试
Day 12-14 ┃ Phase 5: 高级特性 ✅   ┃ 插件系统 + API + SEO + E2E
```

---

## 七、文件结构规划

```
src/
├── app/                        # Next.js App Router 页面
│   ├── [locale]/               # 国际化路由
│   │   ├── (shop)/             # 前台商店布局组
│   │   │   ├── products/       # 产品相关
│   │   │   ├── categories/     # 分类浏览
│   │   │   ├── cart/           # 购物车
│   │   │   ├── checkout/       # 结账
│   │   │   ├── account/        # 用户中心
│   │   │   └── page/           # 文章页面
│   │   ├── admin/              # 后台管理
│   │   │   ├── dashboard/      # 仪表盘
│   │   │   ├── products/       # 产品管理
│   │   │   ├── orders/         # 订单管理
│   │   │   ├── customers/      # 客户管理
│   │   │   ├── categories/     # 分类管理
│   │   │   ├── settings/       # 系统设置
│   │   │   └── plugins/        # 插件管理
│   │   └── page.tsx            # 首页
│   └── api/                    # API 路由
│       ├── products/
│       ├── orders/
│       ├── customers/
│       └── ...
├── components/                 # 共享组件
│   ├── ui/                     # shadcn/ui 组件
│   ├── shop/                   # 前台组件
│   └── admin/                  # 后台组件
├── lib/                        # 核心库
│   ├── db/                     # 数据库层
│   │   ├── schema/             # Drizzle Schema
│   │   ├── migrations/         # 迁移文件
│   │   └── seed/               # 种子数据
│   ├── services/               # 业务服务层
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   ├── cart.service.ts
│   │   └── ...
│   ├── validations/            # Zod 验证 Schema
│   ├── hooks/                  # 自定义 Hooks
│   └── utils/                  # 工具函数
├── messages/                   # 多语言翻译
│   ├── zh.json
│   ├── en.json
│   └── ...
└── __tests__/                  # 测试目录
    ├── unit/                   # 单元测试
    │   ├── services/
    │   └── utils/
    ├── integration/            # 集成测试
    │   └── api/
    ├── components/             # 组件测试
    └── e2e/                    # E2E 测试
```

---

## 八、TDD 实施流程

### 每个模块的开发流程

```
Step 1: 写测试 (Red)
  └─ 先定义接口和预期行为
  └─ 测试应该失败（因为没有实现）

Step 2: 写实现 (Green)
  └─ 写最少量的代码让测试通过
  └─ 不关注优化，只关注正确性

Step 3: 重构 (Refactor)
  └─ 优化代码结构
  └─ 保持测试通过
  └─ 提取公共逻辑

Step 4: 提交
  └─ git commit -m "feat(module): 实现功能 + 测试"
```

### 示例：产品模块 TDD

```
1. 先写 ProductService 的测试
   - should create a product
   - should update a product
   - should find product by id
   - should search products by keyword
   - should filter products by category

2. 实现 ProductService
   - 实现 CRUD 方法
   - 实现搜索逻辑
   - 实现分类筛选

3. 重构
   - 提取公共查询逻辑
   - 添加缓存层
   - 优化查询性能
```

---

## 九、开始实施

现在开始从 Phase 1 起步，按 TDD 流程推进。