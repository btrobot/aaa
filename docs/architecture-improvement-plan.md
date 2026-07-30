# NodeCoda 架构改进计划

> 基于架构审查结论，按优先级排列的改进实施路线图

---

## 优先级说明

| 级别 | 含义 | 预期投入 |
|------|------|---------|
| P0 | 必须修复，影响线上稳定性/安全 | 紧急 |
| P1 | 高优先级，显著影响性能/可维护性 | 1~3 天 |
| P2 | 中优先级，按业务节奏推进 | 3~5 天 |
| P3 | 低优先级，常规迭代优化 | 按需 |

---

## P0 — 安全与稳定性

### 0.1 统一 API 鉴权中间件

**问题**：目前 API 路由各自处理鉴权，无统一中间件，部分 POST/PUT/DELETE 接口缺少登录态校验。

**方案**：在 `middleware.ts` 或创建 `api-auth.ts` 中间件，统一拦截 `/api/*` 的写操作：

```typescript
// src/middleware.ts 增强
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 写操作需鉴权
  if (pathname.startsWith('/api/') && !['GET', 'HEAD'].includes(request.method)) {
    const token = request.cookies.get('auth_token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

### 0.2 CSRF 保护

**问题**：所有 API 均无 CSRF Token 验证。

**方案**：在表单提交类页面嵌入 CSRF Token，服务端验证 Origin/Referer 头。

### 0.3 API 速率限制

**问题**：无防滥用保护，恶意请求可耗尽数据库连接。

**方案**：在中间件层实现内存令牌桶或使用 `express-rate-limit` 风格的限流。

---

## P1 — 性能优化（已部分完成）

### 1.1 ~ 1.4 ✅ 已完成
- 图片优化（`next/image` 全局替换）
- RSC 边界拆分（ShopLayoutClient）
- Context useMemo 优化
- API 缓存策略（Cache-Control）

### 1.5 服务层依赖注入（P1）

**问题**：15 个 Service 直接 `import { db }`，单元测试无法 mock 数据库，集成测试依赖真实 PostgreSQL。

**方案**：为每个 Service 构造函数注入 `db` 实例：

```typescript
// 当前
export class ProductService {
  async getById(id: number) {
    return db.select().from(products)... // 硬编码依赖
  }
}

// 改进
export class ProductService {
  constructor(private db: DrizzleClient) {}

  async getById(id: number) {
    return this.db.select().from(products)...
  }
}

// 使用
const productService = new ProductService(db);

// 测试
const mockDb = { select: vi.fn() };
const productService = new ProductService(mockDb as any);
```

**影响范围**：15 个 Service 文件，约 20 个 API 路由文件。

### 1.6 LCP 专项优化（P1）

**问题**：首页 Hero 图片、首屏产品图片未使用 `fetchpriority` 和 `preload`。

**方案**：
- 首页 Hero 区域：添加 `<link rel="preload">` 或 `ReactDOM.preload()`
- 产品列表首图：`<Image priority fetchPriority="high" />`
- 字体：`font-display: swap` + `size-adjust` 防止 CLS
- 字体文件 preload

### 1.7 Suspense + Streaming（P1）

**问题**：页面数据加载无 `Suspense` 边界，无法实现 Streaming SSR。

**方案**：对非首屏内容区域添加 `Suspense` 包裹：

```typescript
// 产品详情页 — 评价区域延迟加载
function ProductDetailPage({ params }) {
  return (
    <div>
      <ProductInfo id={params.id} /> {/* 首屏内容，直接加载 */}
      <Suspense fallback={<Skeleton />}>
        <ProductReviewsSection id={params.id} /> {/* 非首屏，流式加载 */}
      </Suspense>
    </div>
  );
}
```

---

## P2 — 架构可维护性

### 2.1 统一 API 错误处理

**问题**：每个 API 路由重复 try/catch 模板代码，错误格式不统一。

**方案**：创建 `withErrorHandler` 高阶函数：

```typescript
// src/lib/api-utils.ts
export function withErrorHandler(handler: ApiHandler) {
  return async (req: NextRequest, ctx: any) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      console.error(`[API Error] ${req.method} ${req.url}:`, error);
      if (error instanceof ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
```

**影响范围**：21+ API 路由文件，可减少约 30% 的样板代码。

### 2.2 查询结果名统一

**问题**：部分 Service 返回 Drizzle 原始行（snake_case），部分手动映射为 camelCase。

**方案**：创建通用 `toCamelCase` 转换工具，在 Service 层统一转换：

```typescript
// src/lib/utils.ts 增强
export function toCamelCase(rows: Record<string, any>[]): Record<string, any>[] {
  return rows.map(row => {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
    }
    return result;
  });
}
```

### 2.3 组件按模块分包

**问题**：`src/components/` 下 50+ 文件平铺，无模块划分。

**方案**：

```
src/components/
├── shop/          # 前台业务组件
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   └── ProductReviews.tsx
├── admin/         # 后台业务组件
│   ├── Sidebar.tsx
│   └── StatCard.tsx
├── shared/        # 共享组件
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── JsonLd.tsx
└── ui/            # shadcn/ui 组件库
```

### 2.4 翻译文件对齐

**问题**：`zh.json` 和 `en.json` 条目不一致，英文缺少 pages/shipping/attributes/theme 等翻译键。

**方案**：创建脚本 `scripts/check-translations.ts` 自动检测缺失翻译键，并补全缺失条目。

### 2.5 代码生成器

**问题**：创建新模块需手动创建 Service/API/AdminPage/翻译键，重复劳动多。

**方案**：创建 `scripts/generate-module.ts` 脚手架，支持：

```
pnpm generate:module --name reviews
# 自动创建：
# - src/lib/services/review.service.ts
# - src/app/api/reviews/route.ts
# - src/app/api/reviews/[id]/route.ts
# - src/app/[locale]/admin/reviews/page.tsx
# - 更新翻译文件
```

### 2.6 集成测试增强

**问题**：集成测试直接连真实数据库，无 MSW 隔离，影响测试速度和可靠性。

**方案**：
- 集成 MSW（Mock Service Worker）拦截 HTTP 请求
- 集成 Supertest 实现类型安全的 API 断言
- 数据库测试使用事务回滚，确保测试隔离性

---

## P3 — 长期演进

### 3.1 插件系统

**问题**：PLAN 中标记的 4.10/5.1 插件系统完全未实现，影响电商平台的可扩展性。

**方案**：参考 Laravel/BeikeShop 的插件架构，实现：
- 插件注册表（数据库）
- 插件生命周期（安装/启用/禁用/卸载）
- 插件钩子（Hook）系统
- 插件管理页面

### 3.2 税务管理页面

**问题**：`tax_classes`/`tax_rates`/`tax_rules` 表有 Schema 无管理页面。

**方案**：创建 `admin/taxes/` 管理页面，支持税率配置。

### 3.3 国家/区域地址选择

**问题**：`countries`/`zones` 表有 Schema，但地址选择使用自由文本输入。

**方案**：在结账地址表单中接入国家/省/市三级联动选择器。

### 3.4 关联商品管理

**问题**：`product_relations` 表有 Schema 无管理页面，产品详情页无关联推荐。

**方案**：在管理后台产品编辑页添加关联商品选择器，在前台产品详情页展示关联推荐。

### 3.5 文章分类管理

**问题**：`page_categories` 表有 Schema 无管理页面。

**方案**：创建 `admin/page-categories/` 管理页面，支持文章分类 CRUD。

### 3.6 订单发票/退款流程

**问题**：订单管理无发票生成和退款流程 UI。

**方案**：在订单详情页添加退款操作和发票下载功能。

### 3.7 E2E 测试

**问题**：Playwright 浏览器下载受阻，E2E 测试无法运行。

**方案**：尝试以下方案恢复：
1. 配置国内镜像源 `PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright`
2. 使用系统已安装的 Chromium（`apt-get install chromium-browser`）
3. 使用 Playwright 的 `--with-deps` 安装系统依赖

---

## 实施路线图

### 第一阶段（P0 — 安全加固）
```
[ ] 0.1 统一 API 鉴权中间件   → 预计 0.5 天
[ ] 0.2 CSRF 保护             → 预计 0.5 天
[ ] 0.3 API 速率限制          → 预计 0.5 天
```

### 第二阶段（P1 — 性能优化）
```
[✅] 1.1 图片优化              → 已完成
[✅] 1.2 RSC 边界拆分         → 已完成
[✅] 1.3 Context useMemo      → 已完成
[✅] 1.4 API 缓存策略         → 已完成
[ ] 1.5 服务层依赖注入        → 预计 1 天
[ ] 1.6 LCP 专项优化          → 预计 0.5 天
[ ] 1.7 Suspense + Streaming  → 预计 0.5 天
```

### 第三阶段（P2 — 可维护性）
```
[ ] 2.1 统一 API 错误处理     → 预计 0.5 天
[ ] 2.2 查询结果名统一        → 预计 0.5 天
[ ] 2.3 组件按模块分包        → 预计 1 天
[ ] 2.4 翻译文件对齐          → 预计 0.5 天
[ ] 2.5 代码生成器            → 预计 1 天
[ ] 2.6 集成测试增强          → 预计 1 天
```

### 第四阶段（P3 — 长期演进）
```
[ ] 3.1 插件系统              → 预计 3 天
[ ] 3.2 税务管理页面          → 预计 0.5 天
[ ] 3.3 国家/区域地址选择     → 预计 1 天
[ ] 3.4 关联商品管理          → 预计 1 天
[ ] 3.5 文章分类管理          → 预计 0.5 天
[ ] 3.6 订单发票/退款         → 预计 1 天
[ ] 3.7 E2E 测试              → 持续排查
```

---

## 当前工程状态摘要

| 指标 | 数值 |
|------|------|
| 总文件数 | ~204 |
| 数据库表 | 46 |
| API 路由 | 21+ |
| 服务层 | 15 个 Service |
| 单元测试 | 110 个（84 单元 + 15 集成 + 11 组件）|
| 测试覆盖率 | 语句 84.83% / 分支 65.07% / 函数 89.09% |
| TypeScript | strict 模式，零错误 |
| 语言 | 11 种 |
| 货币 | 6 种 |
| 主题预设 | 6 套 |