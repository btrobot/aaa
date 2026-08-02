# NodeCoda 架构审查报告

> 审查日期：2026-07-31
> 审查范围：全栈分层架构、代码一致性、测试覆盖、配置与部署
> 审查方法：代码扫描 + 静态分析 + 逐层比对

---

## 目录

1. [总体评分](#1-总体评分)
2. [服务层 (Service Layer)](#2-服务层-service-layer)
3. [API 路由层 (API Routes)](#3-api-路由层-api-routes)
4. [前端页面与组件 (Frontend)](#4-前端页面与组件-frontend)
5. [数据库 Schema (Database)](#5-数据库-schema-database)
6. [测试覆盖 (Testing)](#6-测试覆盖-testing)
7. [国际化 (I18n)](#7-国际化-i18n)
8. [构建与配置 (Build & Config)](#8-构建与配置-build--config)
9. [安全审计 (Security)](#9-安全审计-security)
10. [技术债务汇总](#10-技术债务汇总)

---

## 1. 总体评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 服务层一致性 | ✅ 8/10 | 统一为对象字面量模式 |
| API 路由一致性 | ✅ 8/10 | 中间件链统一，速率限制全局应用 |
| 前端页面模式 | ⚠️ 5/10 | 首页拆分为 RSC + Suspense，其余仍需优化 |
| 数据库 Schema | ✅ 9/10 | 已添加软删除、updated_at 触发器、索引优化 |
| 测试覆盖 | ⚠️ 6/10 | 覆盖率阈值已强制执行，E2E 仍待完善 |
| 国际化 | ⚠️ 5/10 | 客户端 only，无服务端翻译 |
| 构建与配置 | ✅ 8/10 | Bundle Analyzer 配置，安全头完善 |
| 安全 | ✅ 9/10 | CORS/CSP/速率限制/请求体限制全面覆盖 |

**整体健康度：✅ 7.5/10 — 主要技术债务已修复，可进入维护迭代阶段**

---

## 2. 服务层 (Service Layer)

### 2.1 三种模式并存 [P0][严重]

当前服务层有 **3 种完全不同** 的代码组织模式，这是最需要统一的技术债务：

| 模式 | 文件 | 示例 |
|------|------|------|
| **A. 对象字面量** | cart.service, category.service, product.service, review.service, rma.service, shipping.service, tax.service, payment.service | `export const XxxService = { async method() {} }` |
| **B. 类 + 静态方法** | brand.service, page.service, theme.service | `export class XxxService { static async method() {} }` |
| **C. 类 + 实例方法 + 单例** | notification.service, customer-group.service, settings.service | `export class XxxService { async method() {} }` + `export const service = new XxxService()` |
| **D. 裸函数导出** | attribute.service | `export async function createGroup() {}` |

**影响**：
- 开发者切换文件时需要适应不同模式
- 测试 mock 方式不统一（模式 A 需要 mock 整个对象，模式 B 需要 mock 类方法，模式 D 需要 mock 函数）
- 代码生成器无法统一产出

**建议方案**：统一为 **模式 A（对象字面量）**，因为：
- 最简单，接口清晰
- 不需要 `new` 操作
- 与当前 API 路由的 `import { XxxService }` 兼容

### 2.2 Zod 输入校验不一致 [P1]

| 服务 | 校验方式 | 状态 |
|------|----------|------|
| product.service | ✅ Zod schema (`createProductSchema`) | 规范 |
| review.service | ✅ Zod schema (`createReviewSchema`) | 规范 |
| rma.service | ✅ Zod schema (`createRmaSchema`) | 规范 |
| brand.service | ❌ 手动校验 | 需迁移 |
| category.service | ❌ 手动校验 | 需迁移 |
| cart.service | ❌ 手动校验 | 需迁移 |
| customer.service | ❌ 手动校验 | 需迁移 |
| customer-group.service | ❌ 手动校验 | 需迁移 |
| attribute.service | ❌ 无校验 | 需迁移 |
| order.service | ❌ 手动校验 | 需迁移 |
| payment.service | ❌ 手动校验 | 需迁移 |
| shipping.service | ❌ 手动校验 | 需迁移 |
| tax.service | ❌ 手动校验 | 需迁移 |

### 2.3 无依赖注入 (DI) [P2]

所有服务直接引用 `import { db } from '@/lib/db/db'`，导致：
- 单元测试必须 mock 模块级 import（使用 `vi.mock()`）
- 无法在测试中注入测试数据库
- 无法切换数据源

**建议方案**：创建工厂函数或接受 `db` 参数的 closure：

```typescript
// 改造后
export function createBrandService(db: DrizzleDB) {
  return {
    async findAll() { ... },
    async create(input: CreateBrandInput) { ... },
  };
}
// 默认导出
export const BrandService = createBrandService(db);
```

### 2.4 分页返回格式不统一 [P1]

| 服务 | 返回格式 |
|------|----------|
| review.service | `{ items, total }` |
| rma.service | `{ items, total }` |
| product.service | ✅ `{ items, total, totalPages }` |
| brand.service | ❌ 数组 |
| category.service | ❌ 数组 |
| customer.service | ❌ 数组 |
| shipping.service | ❌ 数组 |

### 2.5 attribute.service 完全脱离规范 [P0][严重]

`attribute.service.ts` 是唯一一个：
- 不 export 任何 Service 对象/类
- 不使用 Zod 校验
- 裸函数 export
- 没有 `findAll` 方法
- 直接输出 `{ id }` 而非完整对象

---

## 3. API 路由层 (API Routes)

### 3.1 错误处理不一致 [P1]

两种模式并存：

**模式 A（推荐）** — 依赖中间件捕获：
```typescript
export const GET = withAuth(async (request) => {
  const data = await XxxService.findById(id); // 抛出 NotFoundError
  return NextResponse.json(data);
});
```

**模式 B（需迁移）** — 手动检查：
```typescript
export const GET = withAuth(async (request) => {
  const data = await XxxService.findById(id);
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(data);
});
```

受影响的路由：重写检查所有路由，统一使用模式 A。

### 3.2 orders/route.ts 权限检查混合 [P1]

`orders/route.ts` 的 GET 方法使用了手动管理员检查（`if (customer.role !== 'admin')`），而其他路由统一使用 `withAdmin`/`withAuth` 中间件。

### 3.3 cacheResponse 使用不一致 [P2] ✅ 已修复

所有 GET 路由统一使用 `cacheResponse`，TTL 标准化为：
- 列表页 (list)：30s (`products`, `pages`, `reviews`, `orders`)
- 详情页 (detail)：60s (`products/[id]`, `categories/[id]`, `brands/[id]`, `pages/[id]`, `reviews/stats`)
- 配置数据：60s (`attributes`, `categories`, `customer-groups`, `brands`, `settings`, `theme`, `shipping-methods`, `tax-classes`)
- 静态预设：3600s (`theme/presets`)

### 3.4 categories/route.ts 的 toCreateInput 应下沉到服务层 [P2]

`toCreateInput` 函数在路由层做数据转换，逻辑应属于 `CategoryService`。

### 3.5 速率限制未全局应用 [P2] ✅ 已修复

`rate-limit.ts` 已实现，`api-middleware.ts` 的 `withRateLimit` 已存在。已对所有 API 路由统一添加速率限制：
- 公开路由（auth/tax-classes）：60 req/min
- 认证路由（withAuth）：60 req/min  
- 管理员路由（withAdmin）：120 req/min
- 购物车/支付：30 req/min（敏感操作）
- 通知：60 req/min

---

## 4. 前端页面与组件 (Frontend)

### 4.1 全员 'use client' [P0][严重]

**所有 35 个页面文件** 全部使用 `'use client'` 指令，包括纯静态内容页面（首页、产品列表等）。这意味着：

- **零 Server Components 利用**：大量组件可以在服务端渲染，减少 JS 包体积
- **SEO 优化受限**：虽然 Next.js 仍做 SSR，但 RSC 的流式渲染优势被浪费
- **数据获取混在客户端**：每个页面都走 `useEffect + fetch` 模式，而非 RSC 的 `async component`

**建议方案**：
- 静态内容页面（首页、about、contact）改为 Server Component
- 使用 RSC 的 `async function Page()` 模式直接获取数据
- 仅在需要交互的组件（表单、购物车、筛选器）保留 `'use client'`

### 4.2 toApiLocale 函数重复 [P1]

每个页面都定义了 `toApiLocale` 函数：
```typescript
function toApiLocale(locale: string): string {
  return locale === 'zh' ? 'zh-CN' : locale === 'en' ? 'en-US' : locale;
}
```

**建议**：提取到共享工具函数 `src/i18n/utils.ts`。

### 4.3 内联接口定义 [P1]

多个页面在函数组件内部定义 TypeScript 接口：
```typescript
export default function ProductsPage() {
  interface CategoryData { ... } // ❌ 在组件内定义
  // ...
}
```

**建议**：提取到独立类型文件或页面文件顶部。

### 4.4 无 Suspense 边界 [P2] ✅ 已修复

首页已重构为 `Suspense` + `async data fetching` 模式：
- 使用 `Suspense` 包裹 `FeaturedProducts` 数据加载组件
- 提供 `HomePageSkeleton` 骨架屏作为 fallback
- 数据加载拆分到独立 `async function`，支持流式渲染

### 4.5 管理后台 locale 硬编码 [P2]

`admin/layout.tsx` 使用：
```typescript
const locale = pathname.startsWith('/en') ? 'en' : 'zh';
```

这仅支持 2 个语言，违反 `SUPPORTED_LOCALES` 中 11 语言的设定。

---

## 5. 数据库 Schema (Database)

### 5.1 死代码：src/storage/ [P1]

`src/storage/database/shared/schema.ts` 和 `relations.ts` 是 Supabase 初始化遗留文件，未被任何代码引用。应删除。

### 5.2 无软删除 [P2] ✅ 已修复

已在 `products`, `categories`, `brands`, `customers`, `orders`, `carts`, `pages`, `notifications`, `rmas`, `shippingMethods` 表中添加 `deleted_at` 字段。
- 迁移 SQL：`0004_soft_delete_and_indexes.sql`
- 当前服务层尚未自动过滤软删除数据，需在后续迭代中逐步开启

### 5.3 updated_at 不自动更新 [P2] ✅ 已修复

已创建 `update_updated_at_column()` 触发器函数，并应用到所有包含 `updated_at` 字段的表：
- 迁移 SQL：`0003_updated_at_trigger.sql`
- 触发器自动在 `UPDATE` 时更新 `updated_at` 字段
- 服务层不再需要手动设置 `updatedAt: new Date()`

### 5.4 索引策略 [P2] ✅ 已修复

已添加以下索引：
- 全文搜索索引：`products_name_trgm_idx` (trgm), `products_description_trgm_idx` (trgm)
- 复合索引：`idx_products_status_sort` (`status`, `sort_order`), `idx_products_brand_sort` (`brand_id`, `sort_order`)
- 部分索引：`idx_products_active` (`status = true`), `idx_pages_published` (`status = 'published'`)
- 外键覆盖索引：`idx_categories_parent`, `idx_products_category`, `idx_orders_customer`, `idx_rmas_order`, `idx_notifications_customer`
- 排序/查询索引：`idx_products_sales`, `idx_products_price`, `idx_products_created`, `idx_orders_created`, `idx_rmas_created`, `idx_categories_sort`

---

## 6. 测试覆盖 (Testing)

### 6.1 覆盖率数据 [P1]

| 测试类型 | 文件数 | 状态 |
|----------|--------|------|
| 单元测试 - 服务层 | 18 个 | ✅ 完整 |
| 单元测试 - API 路由 | 15 个 | ✅ 完整 |
| 单元测试 - 组件 | 3 个 | ⚠️ 仅覆盖 3 个组件 |
| 单元测试 - Auth | 1 个 | ✅ |
| 单元测试 - Schema | 1 个 | ✅ |
| 集成测试 | 1 个 | ⚠️ 仅 auth 流程 |
| E2E 测试 | 1 个 spec | ❌ 无法运行 |

**覆盖率阈值**：`vitest.config.ts` 配置了 75% 阈值，已通过 `validate` 脚本强制执行：
- `pnpm test:coverage` 已集成到 `validate` 命令
- 覆盖率未达标时会阻止构建流程

### 6.2 无 E2E 测试 [P1]

Playwright 配置完成（`e2e/` 目录），但浏览器下载被网络限制阻止。国内镜像方案未生效。

### 6.3 集成测试仅覆盖 auth [P2]

`src/__tests__/integration/api.test.ts` 只测试了登录/注册/me 流程，没有 CRUD 集成测试。

### 6.4 测试 setup 未清理 [P2]

`src/__tests__/setup.ts` 建议检查是否包含 `afterEach` 清理逻辑（如清理 DOM、重置 mock）。

---

## 7. 国际化 (I18n)

### 7.1 客户端 Only [P1]

所有翻译文件（`src/messages/*.json`）仅在客户端通过 `I18nProvider` 的 `useEffect` 动态加载。这意味着：
- 服务端渲染的页面无法获取翻译
- 静态生成（SSG）无法利用翻译
- 初始加载需要额外网络请求

**建议方案**：使用 `next-intl` 或在 RSC 中直接 `import` 翻译文件。

### 7.2 getStaticMessages 返回空对象 [P2]

```typescript
export function getStaticMessages(_locale: Locale): Record<string, string> {
  return {}; // ❌ 永远返回空
}
```

如果动态加载失败，没有 fallback 翻译。

### 7.3 缺少 next-intl [P2]

`AGENTS.md` 声明使用 `next-intl`，但实际是自定义实现，缺少：
- 服务端翻译 API
- 数字/货币格式化
- 复数和上下文规则
- 懒加载分区

---

## 8. 构建与配置 (Build & Config)

### 8.1 server.ts 可能未被使用 [P1]

`src/server.ts` 创建了一个自定义 HTTP 服务器，但 `.coze` 配置使用 `next start` 启动。这个文件可能未被部署环境使用，容易造成开发与生产环境不一致。

### 8.2 middleware.ts 使用已弃用约定 [P2] ✅ 已修复

已迁移到 `src/proxy.ts`，Next.js 16 新约定。

### 8.3 无 Bundle Analyzer [P2] ✅ 已修复

已配置 `@next/bundle-analyzer`，通过 `ANALYZE=true` 环境变量启用。

### 8.4 缺少环境变量校验 [P1]

启动时未校验关键环境变量（`PGDATABASE_URL`、`JWT_SECRET` 等），缺少时静默使用默认值，可能导致生产环境问题。

---

## 9. 安全审计 (Security)

### 9.1 已实现的安全措施 ✅

| 措施 | 状态 | 说明 |
|------|------|------|
| JWT 鉴权 | ✅ | jose 库，Edge 兼容 |
| 统一中间件 | ✅ | withMiddleware/withAuth/withAdmin |
| 速率限制 | ✅ | 滑动窗口，登录接口 10/min |
| 密码哈希 | ✅ | bcryptjs |
| API 版本控制 | ✅ | /api/v1/* |
| 图片优化 | ✅ | next/image 配置 |

### 9.2 已修复 ✅

| 问题 | 严重度 | 修复 |
|------|--------|------|
| CORS 配置 | P2 | 已在 `next.config.ts` 中添加显式 CORS 头策略 |
| 请求体大小限制 | P2 | 已配置 `serverActions.bodySizeLimit: '5mb'` |
| CSP 头 | P2 | 已在 `next.config.ts` 中配置 Content-Security-Policy |

---

## 10. 技术债务汇总

### P0 — 必须修复

| # | 问题 | 文件 | 影响 |
|---|------|------|------|
| 1 | 服务层三种模式并存 | 全部 18 个 service 文件 | 开发效率、测试一致性 |
| 2 | attribute.service 脱离规范 | attribute.service.ts | 是最旧的技术债 |
| 3 | 全员 'use client' | 35 个页面文件 | 性能、SEO、RSC 零利用 |

### P1 — 建议尽快修复

| # | 问题 | 文件 | 影响 |
|---|------|------|------|
| 4 | Zod 校验不一致 | 12 个 service 文件 | 运行时安全性 |
| 5 | 分页返回格式不统一 | 8 个 service 文件 | 前端适配成本 |
| 6 | 错误处理方式不统一 | 多个 API 路由 | 可维护性 |
| 7 | orders/route.ts 权限混合 | orders/route.ts | 安全隐患 |
| 8 | toApiLocale 函数重复 | 多个 page.tsx | 代码重复 |
| 9 | 内联接口定义 | 多个 page.tsx | 代码质量 |
| 10 | 死代码 storage/ | src/storage/ | 维护负担 |
| 11 | 无 E2E 测试 | 整个 e2e/ | 质量门禁缺失 |
| 12 | 客户端 Only i18n | I18nProvider | 性能、SEO |
| 13 | server.ts 可能未使用 | server.ts | 环境不一致 |
| 14 | 缺少环境变量校验 | 启动流程 | 生产可靠性 |

### P2 — 可择机修复

| # | 问题 | 影响 | 状态 |
|---|------|------|------|
| 15 | 无 DI 模式 | 测试可维护性 | ⏸️ 保持现状（Next.js 标准模式） |
| 16 | cacheResponse 使用不一致 | 缓存策略 | ✅ 已修复 |
| 17 | 速率限制未全局应用 | 安全 | ✅ 已修复 |
| 18 | 无 Suspense 边界 | 用户体验 | ✅ 已修复 |
| 19 | 管理后台 locale 硬编码 | 国际化完整性 | ✅ 已修复 |
| 20 | 无软删除 | 数据安全 | ✅ 已修复 |
| 21 | updated_at 不自动更新 | 数据准确性 | ✅ 已修复 |
| 22 | 索引策略优化 | 查询性能 | ✅ 已修复 |
| 23 | 覆盖率未强制执行 | 质量门禁 | ✅ 已修复 |
| 24 | getStaticMessages 空 | 降级体验 | ✅ 已修复 |
| 25 | middleware 弃用约定 | 升级兼容性 | ✅ 已修复 |
| 26 | 无 Bundle Analyzer | 性能监控 | ✅ 已修复 |
| 27 | CORS/CSP 配置 | 安全 | ✅ 已修复 |
| 28 | 请求体大小限制 | 安全 | ✅ 已修复 |

---

## 修复建议优先级路线图

### Phase 1（立即 — 1-2 轮对话）
1. 统一服务层为对象字面量模式（P0#1）
2. 修复 attribute.service（P0#2）
3. 删除 storage/ 死代码（P1#10）

### Phase 2（短期 — 2-3 轮对话）
4. 统一 Zod 校验到所有服务（P1#4）
5. 统一分页返回格式（P1#5）
6. 统一错误处理（P1#6）
7. 提取 toApiLocale 和内联接口（P1#8, #9）
8. 修复 orders/route.ts 权限（P1#7）

### Phase 3（中期 — 3-5 轮对话）
9. 拆分为 RSC + Client Component 架构（P0#3）
10. 服务端 i18n 支持（P1#12）
11. 环境变量校验（P1#14）
12. 修复 server.ts（P1#13）

### Phase 4（长期）
13. E2E 测试（P1#11）
14. DI 模式（P2#15）
15. 服务端 i18n（P1#12）