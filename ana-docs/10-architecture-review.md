# NodeCoda 架构审查报告

> 审查日期: 2026-07-30
> 审查范围: 全项目源码 (src/ 目录)
> 审查人: Architect Agent

---

## 一、整体架构评估

### 1.1 架构分层

```
┌─────────────────────────────────────────────┐
│  Presentation Layer                         │
│  src/app/[locale]/(shop)/*   前台页面       │
│  src/app/[locale]/admin/*   后台页面        │
│  src/components/ui/*         UI 组件库      │
├─────────────────────────────────────────────┤
│  API Layer                                  │
│  src/app/api/*/route.ts      REST API       │
│  src/lib/api-middleware.ts   中间件 HOF      │
├─────────────────────────────────────────────┤
│  Service Layer                              │
│  src/lib/services/*.service.ts  业务逻辑     │
├─────────────────────────────────────────────┤
│  Data Access Layer                          │
│  src/lib/db/db.ts            连接池         │
│  src/lib/db/schema/index.ts  Drizzle Schema │
├─────────────────────────────────────────────┤
│  Infrastructure                             │
│  src/lib/auth.ts             认证           │
│  src/lib/rate-limit.ts      限流            │
│  src/i18n/*                 国际化           │
└─────────────────────────────────────────────┘
```

**评价**: 分层基本合理，职责边界清晰。Service 层封装了核心业务逻辑，API 层负责 HTTP 协议转换，Schema 层定义数据模型。

### 1.2 优点

| 方面 | 亮点 |
|------|------|
| 中间件抽象 | `withMiddleware` HOF 统一了鉴权和限流，代码复用度高 |
| 多语言设计 | 描述表分离模式，扩展性好，支持 11 种语言 |
| 订单状态机 | `OrderStateMachine` 封装了状态流转规则，防止非法状态变更 |
| 输入校验 | 服务层使用 Zod schema 校验，类型安全 |
| 缓存策略 | `cacheResponse` 工具函数统一管理 HTTP 缓存头 |

### 1.3 关键问题

**问题 1: API 层鉴权不一致**
```typescript
// src/app/api/products/route.ts — POST 无鉴权保护！
export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = await ProductService.create(body);  // 任何人都能创建商品
}

// 而 src/app/api/auth/route.ts 正确使用了 withRateLimit
export const POST = withRateLimit(async (request: Request) => { ... });
```

多个 API 路由 (products, orders, categories 等) 未使用 `withMiddleware` 包裹，写操作缺少鉴权保护。

**问题 2: Service 层风格不统一**
```typescript
// CustomerService — class 风格，静态方法
export class CustomerService {
  static async register(data: RegisterInput) { ... }
}

// CartService — 对象字面量风格
export const CartService = {
  async addItem(input: AddCartItemInput) { ... }
}

// OrderService — 混合风格
export const OrderService = {
  async create(input: CreateOrderInput) { ... }
}
```

14 个服务混用了 `class` 和 `const object` 两种风格，增加了认知负担。

---

## 二、数据流审查

### 2.1 正常数据流

```
Browser → api.ts (fetch) → /api/* route.ts → withMiddleware → Service → Drizzle → PostgreSQL
```

### 2.2 问题

**P0: 订单创建缺少事务保护**

```typescript
// src/lib/services/order.service.ts
async create(input: CreateOrderInput) {
  // 1. 查询购物车
  const cartItems = await db.select()...
  // 2. 计算总价 (在应用层)
  // 3. 插入订单
  const [order] = await db.insert(orders).values(...)...
  // 4. 插入订单商品
  await db.insert(orderProducts).values(...)...
  // 5. 清空购物车
  await db.delete(carts)...
  // ⚠️ 如果步骤 3 或 4 失败，数据不一致！
}
```

应使用 `db.transaction()` 包裹整个创建流程。

**P1: 购物车查询存在 N+1 隐患**

```typescript
// src/lib/services/cart.service.ts
async getCart(customerId, locale) {
  const rows = await db.select()
    .from(carts)
    .leftJoin(products, ...)
    .leftJoin(productDescriptions, ...)
    .leftJoin(productImages, ...)  // 多表 JOIN，但未分页
    .where(eq(carts.customerId, customerId));
  // 如果用户购物车有 100 个商品，返回大量数据
}
```

缺少分页和数量上限。

**P1: 商品列表查询未使用 withMiddleware**

```typescript
// src/app/api/products/route.ts
export async function GET(request: NextRequest) {
  // 直接解析参数，未走 withMiddleware
  // 虽然 cacheResponse 添加了缓存头，但缺少速率限制
}
```

### 2.3 数据一致性

| 场景 | 风险 | 建议 |
|------|------|------|
| 订单创建 | 高 — 无事务 | 使用 `db.transaction()` |
| 库存扣减 | 高 — 无并发控制 | 使用乐观锁或 `SELECT ... FOR UPDATE` |
| 购物车→订单 | 中 — locale 硬编码 | 从请求参数获取 locale |
| 价格计算 | 中 — 应用层浮点 | 使用 decimal 字符串运算 |

---

## 三、安全性审查

### 3.1 认证与授权

| 问题 | 严重度 | 说明 |
|------|--------|------|
| POST /api/products 无鉴权 | **P0** | 任何人可创建商品 |
| POST /api/orders 无鉴权 | **P0** | 任何人可创建订单 |
| PUT /api/orders 无鉴权 | **P0** | 任何人可修改订单状态 |
| PUT /api/settings 无鉴权 | **P0** | 任何人可修改系统设置 |
| GET /api/orders?admin=true 无鉴权 | **P1** | 任何人可查看所有订单 |

**根本原因**: 多个 API 路由未使用 `withMiddleware` 或 `withAuth` 包裹。

### 3.2 输入校验

**P1: API 路由层缺少输入校验**

```typescript
// src/app/api/orders/route.ts — POST
export async function POST(request: NextRequest) {
  const body = await request.json();
  const order = await OrderService.create(body);  // 直接传递，未校验
}
```

虽然 Service 层有 Zod 校验，但 API 层应有基本的请求体校验，避免恶意 JSON 直接进入业务层。

### 3.3 XSS 防护

```typescript
// src/app/[locale]/(shop)/layout.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(organizationJsonLd),  // ✅ 静态数据，安全
  }}
/>
```

JsonLd 使用静态数据，风险可控。但需注意商品描述等内容如果直接渲染可能存在 XSS 风险。

### 3.4 CSRF 防护

**P1: 无 CSRF 防护**

当前 API 仅依赖 `Authorization: Bearer` header 或 Cookie。如果使用 Cookie 认证，缺少 CSRF token 机制。

### 3.5 JWT 安全

```typescript
// src/lib/auth.ts
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nodecoda-jwt-secret-change-in-production'
  // ⚠️ 硬编码默认密钥！生产环境如果忘记配置 JWT_SECRET，所有 token 可被伪造
);
```

**P0: JWT 密钥硬编码默认值** — 生产环境必须强制配置。

### 3.6 密码安全

```typescript
// src/lib/services/customer.service.ts
const hashedPassword = await bcrypt.hash(validated.password, 10);  // ✅ salt rounds=10，合理
```

密码加密实现正确。

---

## 四、性能瓶颈

### 4.1 数据库层

| 问题 | 严重度 | 说明 |
|------|--------|------|
| 商品列表无缓存层 | P1 | 每次请求直接查库，无 Redis/内存缓存 |
| 购物车全表 JOIN | P1 | 4 表 JOIN 无分页，大购物车性能差 |
| 订单查询无分页 | P1 | `OrderService.getAll()` 返回全部订单 |
| 分类路径查询 | P2 | `categoryPaths` 表无递归查询优化 |
| 缺少数据库连接健康检查 | P2 | 连接池异常时无降级策略 |

### 4.2 前端层

| 问题 | 严重度 | 说明 |
|------|--------|------|
| 首页全 CSR | P1 | `'use client'` + `useEffect` 加载，首屏白屏 |
| 无代码分割 | P2 | Admin 和 Shop 共享同一 bundle |
| 图片未优化 | P2 | `<Image>` 组件使用了 Next.js Image，但 `remotePatterns` 允许所有域名 |
| 无骨架屏 | P2 | 加载状态仅有 `loading` 文本，无 Skeleton |

### 4.3 SSR/CSR 策略

```typescript
// src/app/[locale]/(shop)/page.tsx
'use client';  // ⚠️ 整个首页是客户端渲染

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    async function load() {
      const [prods, cats] = await Promise.all([
        api.products.list(...),
        api.categories.list(...),
      ]);
    }
    load();
  }, [locale]);
}
```

首页、商品列表等核心页面应使用 Server Component + `fetch` 实现 SSR，提升首屏性能和 SEO。

---

## 五、可维护性

### 5.1 代码组织

| 方面 | 评价 |
|------|------|
| 目录结构 | ✅ 清晰的 feature-based 组织 |
| 文件命名 | ✅ 一致的 kebab-case + `.service.ts` 后缀 |
| 导入别名 | ✅ `@/` 路径别名简化导入 |
| 类型安全 | ⚠️ 存在 6 处 `as any` 强制类型转换 |

### 5.2 `as any` 使用

```typescript
// src/lib/services/cart.service.ts:32
input.skuId ? eq(carts.skuId, input.skuId) : undefined as any
// ⚠️ 应使用条件过滤或 Drizzle 的 and() 接受 undefined

// src/lib/services/product.service.ts:194-195
desc(products[validated.sortBy as keyof typeof products] as any)
// ⚠️ 应建立字段映射表避免双重断言

// src/lib/services/customer.service.ts:204, 234
return (result as any).rowCount > 0;
// ⚠️ Drizzle 的 .returning() 已返回数据，无需 rowCount
```

### 5.3 错误处理

```typescript
// src/app/api/products/route.ts
catch (error) {
  console.error('GET /api/products error:', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : '获取产品列表失败' },
    { status: 500 }
  );
}
```

**问题**: 
- 错误信息直接暴露给客户端 (`error.message`)，可能泄露内部实现
- 无统一的错误码体系
- `console.error` 输出无结构化日志

### 5.4 国际化硬编码

```typescript
// src/app/api/auth/route.ts
return NextResponse.json({ error: '请提供邮箱和密码' }, { status: 400 });
// API 层错误信息硬编码中文，应使用错误码

// src/lib/services/order.service.ts
throw new Error('购物车为空');  // 服务层硬编码中文
```

API 错误消息硬编码中文，不支持多语言，且与前端 i18n 体系割裂。

---

## 六、可扩展性

### 6.1 国际化

| 方面 | 评价 |
|------|------|
| 语言覆盖 | ✅ 11 种语言，覆盖主要市场 |
| 翻译文件 | ✅ 独立 JSON 文件，易于维护 |
| 多语言 Schema | ✅ 描述表分离模式，扩展性好 |
| API 层 i18n | ❌ 错误消息硬编码中文 |
| 动态 locale | ⚠️ middleware 只支持 `zh` / `en` 两种重定向 |

```typescript
// src/middleware.ts
const locales = ['zh', 'en'];  // ⚠️ 只有 2 种，但 i18n/config.ts 定义了 11 种
```

### 6.2 多货币

`CurrencyProvider` 已实现，但：
- 价格字段使用 `decimal` 字符串，未关联货币代码
- 订单创建时 `currency` 参数未被使用
- 无汇率转换逻辑

### 6.3 主题系统

`ThemeProvider` + `presets.ts` 已实现基础主题切换，但：
- 仅支持明暗模式
- 无自定义品牌色能力
- Admin 和 Shop 主题未统一管理

### 6.4 缺失的关键能力

| 能力 | 状态 | 影响 |
|------|------|------|
| 文件上传 (S3) | 依赖 `@aws-sdk/client-s3` 但未见上传 API | 商品图片管理受限 |
| 支付集成 | `payment.service.ts` 存在但实现不完整 | 无法实际收款 |
| 邮件通知 | 无实现 | 注册/订单状态变更无通知 |
| 库存管理 | 无独立服务 | 无库存预警、无预留机制 |
| 搜索引擎 | 无 Elasticsearch/全文搜索 | 商品搜索仅靠 SQL LIKE |
| 缓存层 | 无 Redis | 高并发下性能受限 |

---

## 七、测试覆盖

### 7.1 现有测试

| 测试类型 | 文件数 | 覆盖模块 |
|----------|--------|----------|
| 组件测试 | 3 | Navbar, Footer, ProductReviews |
| 服务层测试 | 6 | Product, Category, Brand, Cart, Order, Customer |
| Schema 测试 | 1 | 数据库 Schema |
| 集成测试 | 1 | API 集成 |
| E2E 测试 | 1 | 基础购物流程 |

### 7.2 覆盖率配置

```typescript
// vitest.config.ts
coverage: {
  include: ['src/lib/services/**'],  // 只覆盖服务层
  thresholds: {
    statements: 75,
    branches: 55,
    functions: 75,
    lines: 75,
  },
}
```

### 7.3 测试缺口

| 模块 | 缺失测试 | 严重度 |
|------|----------|--------|
| API 路由层 | 无鉴权测试 | P0 |
| auth.ts | 无 JWT 签发/验证测试 | P0 |
| api-middleware.ts | 无中间件组合测试 | P1 |
| rate-limit.ts | 无限流测试 | P1 |
| i18n 模块 | 无翻译完整性测试 | P2 |
| 前端页面 | 无页面级集成测试 | P2 |

---

## 八、改进建议 (按优先级)

### P0 — 必须立即修复

| # | 问题 | 建议 | 影响范围 |
|---|------|------|----------|
| 1 | API 写操作无鉴权 | 为所有 POST/PUT/DELETE 路由添加 `withMiddleware({ auth: true, roles: ['admin'] })` | 所有 API 路由 |
| 2 | JWT 密钥硬编码 | 启动时检查 `JWT_SECRET` 环境变量，缺失则拒绝启动 | `src/lib/auth.ts` |
| 3 | 订单创建无事务 | 使用 `db.transaction()` 包裹订单创建流程 | `order.service.ts` |
| 4 | 库存扣减无并发控制 | 添加乐观锁 (`version` 字段) 或 `SELECT ... FOR UPDATE` | `order.service.ts` |

### P1 — 近期优化

| # | 问题 | 建议 | 影响范围 |
|---|------|------|----------|
| 5 | 首页 CSR 白屏 | 改用 Server Component + `fetch`，实现 SSR | `(shop)/page.tsx` |
| 6 | Service 层风格不一致 | 统一为 `class` 或 `const object`，推荐 class | 所有 service 文件 |
| 7 | 错误信息泄露内部实现 | 建立错误码体系，客户端只显示错误码映射的用户友好消息 | API 路由 + Service |
| 8 | API 层硬编码中文 | 错误消息改为错误码 (如 `ERR_AUTH_CREDENTIALS_REQUIRED`) | API 路由 |
| 9 | 购物车查询无分页 | 添加 `limit` 和 `offset` 参数 | `cart.service.ts` |
| 10 | 订单列表无分页 | `getAll()` 添加分页参数 | `order.service.ts` |
| 11 | 消除 `as any` | 使用 Drizzle 条件过滤 `and(condition, ...)` 替代 `undefined as any` | 6 处 |
| 12 | middleware locale 不一致 | `middleware.ts` 的 `locales` 数组与 `i18n/config.ts` 同步 | `middleware.ts` |
| 13 | 添加 Redis 缓存 | 商品列表、分类树等热点数据添加缓存层 | 新增依赖 |

### P2 — 中长期改进

| # | 问题 | 建议 | 影响范围 |
|---|------|------|----------|
| 14 | 无全文搜索 | 集成 PostgreSQL `tsvector` 或 Elasticsearch | 商品搜索 |
| 15 | 无文件上传 API | 封装 S3 上传服务，提供 `/api/upload` 端点 | 图片管理 |
| 16 | 支付集成不完整 | 完成支付回调、退款等流程 | `payment.service.ts` |
| 17 | 无邮件通知 | 集成邮件服务 (如 Resend/SendGrid) | 新增模块 |
| 18 | Admin/Shop 代码分割 | 使用 `next/dynamic` 或独立 entry 实现按需加载 | 前端构建 |
| 19 | 结构化日志 | 替换 `console.error` 为 Pino/Winston 等日志库 | 全局 |
| 20 | API 限流仅内存 | 生产环境应使用 Redis 存储限流状态 | `rate-limit.ts` |
| 21 | 无健康检查端点 | 添加 `/api/health` 检查 DB 连接和关键服务状态 | 新增端点 |
| 22 | 测试覆盖不足 | 补充 auth 中间件、API 鉴权、限流等测试 | 测试目录 |
| 23 | 无 API 文档 | 添加 OpenAPI/Swagger 文档生成 | 新增模块 |

---

## 九、架构改进路线图

### 阶段一: 安全加固 (1-2 周)
- 修复所有 API 鉴权缺口
- 强制 JWT_SECRET 环境变量
- 订单创建事务保护
- 库存并发控制

### 阶段二: 性能优化 (2-3 周)
- 核心页面 SSR 改造
- 添加 Redis 缓存层
- 查询分页优化
- 消除 `as any`

### 阶段三: 功能完善 (3-4 周)
- 文件上传服务
- 支付集成完善
- 邮件通知系统
- 错误码体系

### 阶段四: 运维加固 (持续)
- 结构化日志
- 健康检查
- API 文档
- 测试覆盖率提升

---

## 十、总结

NodeCoda 作为跨境电商平台，**基础架构设计合理**，分层清晰、多语言支持完善、Schema 设计规范。但存在**严重的安全缺口** (API 鉴权缺失、JWT 密钥硬编码) 和**数据一致性风险** (无事务保护)。

**最高优先级**: 立即修复 P0 安全问题，然后逐步推进性能优化和功能完善。

整体代码质量: **中等偏上** — 架构设计 7/10，安全实现 4/10，可维护性 6/10，测试覆盖 5/10。
