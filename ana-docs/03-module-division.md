# 模块划分

## 目录结构总览

```
src/
├── app/                    # Next.js App Router 页面路由
│   ├── [locale]/           # 国际化动态路由
│   │   ├── (shop)/         # 前台商城路由组 (无 layout 嵌套影响)
│   │   └── admin/          # 后台管理路由组
│   ├── api/                # RESTful API 路由
│   ├── layout.tsx          # 根布局 (Metadata / Inspector)
│   ├── page.tsx            # 根页面 (重定向)
│   ├── robots.ts           # SEO robots.txt
│   └── sitemap.ts          # SEO sitemap.xml
├── components/             # 共享组件
│   ├── ui/                 # shadcn/ui 基础组件 (60+ 个)
│   ├── Navbar.tsx          # 导航栏
│   ├── Footer.tsx          # 页脚
│   ├── ProductReviews.tsx  # 商品评价组件
│   └── JsonLd.tsx          # 结构化数据
├── hooks/                  # 自定义 Hooks
│   └── use-mobile.ts       # 移动端检测
├── i18n/                   # 国际化模块
│   ├── config.ts           # locale 配置 (11 种语言)
│   ├── I18nProvider.tsx     # i18n Context Provider
│   ├── CurrencyProvider.tsx # 货币 Context Provider
│   └── useTranslations.ts  # 翻译 hook
├── lib/                    # 核心库
│   ├── api.ts              # 前端 API 客户端 (封装所有 fetch 调用)
│   ├── api-middleware.ts    # 后端 API 中间件 (鉴权+限流)
│   ├── auth.ts             # JWT 认证模块
│   ├── cart-context.tsx     # 购物车 Context
│   ├── rate-limit.ts       # 内存速率限制器
│   ├── mock-data.ts        # 模拟数据
│   ├── product-data.ts     # 商品数据工具
│   ├── utils.ts            # 通用工具 (cn 函数)
│   ├── db/                 # 数据库模块
│   │   ├── db.ts           # Drizzle 连接池
│   │   ├── schema/index.ts # 全量数据库 Schema
│   │   └── migrations/     # Drizzle 迁移文件
│   ├── services/           # 业务服务层 (14 个服务)
│   └── theme/              # 主题模块
│       ├── ThemeProvider.tsx
│       └── presets.ts
├── messages/               # i18n 翻译文件 (11 个 JSON)
├── middleware.ts            # Next.js 中间件 (locale 重定向)
├── server.ts               # 自定义服务端入口
├── storage/                # 存储层 (Drizzle schema 备份)
└── __tests__/              # 测试目录
    ├── components/         # 组件测试
    ├── unit/               # 单元测试
    │   ├── services/       # 服务层测试
    │   └── db/             # 数据库 schema 测试
    └── integration/        # 集成测试
```

## 前台商城模块 (Shop)

| 路由 | 功能 | 文件 |
|------|------|------|
| `/[locale]/` | 首页 (Hero + 分类 + 热门商品) | `(shop)/page.tsx` |
| `/[locale]/products` | 商品列表 (搜索/筛选/分页) | `(shop)/products/page.tsx` |
| `/[locale]/products/[id]` | 商品详情 (图片/描述/评价) | `(shop)/products/[id]/page.tsx` |
| `/[locale]/categories` | 分类浏览 | `(shop)/categories/page.tsx` |
| `/[locale]/brands` | 品牌列表 | `(shop)/brands/page.tsx` |
| `/[locale]/cart` | 购物车 | `(shop)/cart/page.tsx` |
| `/[locale]/checkout` | 结算 | `(shop)/checkout/page.tsx` |
| `/[locale]/payment` | 支付 | `payment/page.tsx` |
| `/[locale]/auth/login` | 登录 | `(shop)/auth/login/page.tsx` |
| `/[locale]/auth/register` | 注册 | `(shop)/auth/register/page.tsx` |
| `/[locale]/account` | 个人中心 | `(shop)/account/page.tsx` |
| `/[locale]/account/orders` | 我的订单 | `(shop)/account/orders/page.tsx` |
| `/[locale]/account/addresses` | 收货地址 | `(shop)/account/addresses/page.tsx` |
| `/[locale]/account/wishlist` | 收藏夹 | `(shop)/account/wishlist/page.tsx` |
| `/[locale]/account/rmas` | 退换货 | `(shop)/account/rmas/page.tsx` |
| `/[locale]/news` | 新闻列表 | `(shop)/news/page.tsx` |
| `/[locale]/news/[id]` | 新闻详情 | `(shop)/news/[id]/page.tsx` |

## 后台管理模块 (Admin)

| 路由 | 功能 |
|------|------|
| `/[locale]/admin` | 仪表盘 |
| `/[locale]/admin/products` | 商品管理 (列表/新建/编辑) |
| `/[locale]/admin/orders` | 订单管理 |
| `/[locale]/admin/customers` | 客户管理 |
| `/[locale]/admin/categories` | 分类管理 |
| `/[locale]/admin/brands` | 品牌管理 |
| `/[locale]/admin/attributes` | 属性管理 |
| `/[locale]/admin/reviews` | 评价管理 |
| `/[locale]/admin/rmas` | 退换货管理 |
| `/[locale]/admin/pages` | 文章管理 |
| `/[locale]/admin/shipping` | 配送方式管理 |
| `/[locale]/admin/theme` | 主题设置 |
| `/[locale]/admin/customer-groups` | 客户分组 |
| `/[locale]/admin/notifications` | 通知管理 |
| `/[locale]/admin/settings` | 系统设置 |

## API 路由模块

所有 API 位于 `src/app/api/`，使用 Next.js Route Handlers：

| 模块 | 端点 | 鉴权要求 |
|------|------|----------|
| 认证 | `POST /api/auth` (login/register) | 公开 |
| 用户信息 | `GET /api/auth/me` | 登录 |
| 商品 | `/api/products`, `/api/products/[id]` | GET 公开，写操作 Admin |
| 分类 | `/api/categories`, `/api/categories/[id]` | GET 公开，写操作 Admin |
| 品牌 | `/api/brands`, `/api/brands/[id]` | GET 公开，写操作 Admin |
| 购物车 | `/api/cart` | 登录 |
| 订单 | `/api/orders`, `/api/orders/[id]` | 登录 |
| 客户 | `/api/customers`, `/api/customers/wishlist` | 登录 |
| 评价 | `/api/reviews`, `/api/reviews/stats` | GET 公开，写操作登录 |
| 退换货 | `/api/rmas`, `/api/rmas/[id]` | 登录 |
| 属性 | `/api/attributes` | Admin |
| 文章 | `/api/pages`, `/api/pages/[id]` | GET 公开，写操作 Admin |
| 配送 | `/api/shipping-methods` | GET 公开，写操作 Admin |
| 设置 | `/api/settings` | GET 公开，写操作 Admin |
| 客户分组 | `/api/customer-groups` | Admin |
| 通知 | `/api/notifications` | 登录 |
| 支付 | `/api/payment` | 登录 |
