# NodeCoda 编码规范

> 本文件是项目编码的唯一权威参考。所有代码提交必须遵守。
> AGENTS.md 中的编码规范条目是对本文件的摘要引用，详细规则以本文件为准。

---

## 一、Lint 哲学

Lint error/warning 是**有价值的代码质量信号**，不是需要消除的噪音。

| 原则 | 要求 |
|------|------|
| **修根因** | 分析数据流和类型结构，从设计层面解决，不绕过规则 |
| **禁止掩盖** | 不用 `eslint-disable`、`@ts-ignore`、`@ts-expect-error`、`as any` 来压制问题 |
| **`_` 前缀** | 仅用于「有意忽略的函数参数」这一种场景，不用于掩盖未使用变量 |
| **验证闭环** | lint + 类型检查 + 测试全部通过才算完成 |

### 各类 Lint 信号的根因修复方式

| 信号 | 根因 | 正确做法 |
|------|------|---------|
| `no-explicit-any` | 缺少类型定义 | 追溯数据来源，定义具体 interface/type |
| `no-unsafe-function-type` | 用 `Function` 代替具体签名 | 定义明确的函数类型签名 |
| `no-unused-vars` | 声明了但未使用的代码 | 不需要就删除，需要就正确使用 |
| `exhaustive-deps` | useEffect 依赖不完整 | 补全依赖；用 `useCallback`/`useMemo` 稳定化引用 |
| `import/no-anonymous-default-export` | 匿名导出 | 赋给命名变量后导出 |

---

## 二、TypeScript 规范

### 2.1 基本原则

- tsconfig 已启用 `strict: true`，所有代码必须符合 strict 模式。
- 禁止隐式 `any` 和 `as any`。
- 优先复用当前作用域已声明的变量、函数、类型和导入。
- 清理未使用的变量和导入。

### 2.2 类型定义

```typescript
// ✅ 好：从数据结构推导，定义具体接口
interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: string;
  quantity: number;
}

// ❌ 坏：用 any 绕过类型检查
function getCart(): any[] { ... }

// ❌ 坏：用 Function 代替具体签名
type Handler = Function;

// ✅ 好：明确函数签名
type Handler = (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;
```

### 2.3 类型推导优先

```typescript
// ✅ 好：用 Zod schema 推导类型（本项目服务层标准模式）
const createBrandSchema = z.object({
  name: z.string().min(1).max(255),
  logo: z.string().max(500).optional().nullable(),
});
type CreateBrandInput = z.infer<typeof createBrandSchema>;

// ✅ 好：用 Drizzle 推导表类型
type Brand = typeof brands.$inferSelect;
type NewBrand = typeof brands.$inferInsert;
```

### 2.4 错误类型收窄

```typescript
// ✅ 好：先收窄再使用
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof ServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  // 未知错误不暴露细节
  return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
}

// ✅ 好：不需要错误信息时省略绑定
try {
  localStorage.removeItem('token');
} catch {
  // 安全忽略：SSR 或隐私模式下 localStorage 不可用
}

// ❌ 坏：绑定但不使用（触发 no-unused-vars）
try {
  await operation();
} catch (e) {
  // e 从未使用 ← 应改为 catch { ... }
}
```

---

## 三、React / Next.js 规范

### 3.1 App Router 路由约定

```
src/app/
├── [locale]/                    # 国际化动态段
│   ├── (shop)/                  # 前台商城路由组（共享 layout）
│   │   ├── products/
│   │   │   ├── page.tsx         # 产品列表
│   │   │   └── [id]/page.tsx   # 产品详情
│   │   └── layout.tsx           # 商城布局
│   └── admin/                   # 后台管理路由组
│       ├── products/
│       └── layout.tsx           # 管理后台布局
├── api/                         # API 路由（无 locale 前缀）
│   ├── brands/
│   │   ├── route.ts             # GET / POST
│   │   └── [id]/route.ts       # GET / PUT / DELETE
│   └── ...
├── layout.tsx                   # 根布局
└── globals.css
```

- **服务端组件为默认**：不加 `'use client'` 的组件是服务端组件。
- **客户端组件**：需要 `useState`、`useEffect`、事件处理、浏览器 API 时，在文件顶部声明 `'use client'`。
- **禁止在 JSX 中混用服务端/客户端动态值**：`typeof window`、`Date.now()`、`Math.random()` 等必须在 `useEffect` + `useState` 内处理。

### 3.2 Metadata

```typescript
// ✅ 好：使用 metadata API
export const metadata: Metadata = {
  title: '页面标题',
  description: '页面描述',
};

// ❌ 坏：使用 <head> 标签
// <head><title>...</title></head>  ← 禁止
```

- 三方 CSS/字体通过 `globals.css` 的 `@import` 或 `next/font` 引入。
- `preload`/`preconnect`/`dns-prefetch` 用 ReactDOM 的对应方法。
- JSON-LD 通过 `script` 标签的 `type="application/ld+json"` 实现。

### 3.3 Hooks 规范

```typescript
// ✅ 好：依赖数组完整
const loadData = useCallback(async () => {
  const data = await fetchData(locale);
  setData(data);
}, [locale]);  // locale 是依赖

useEffect(() => {
  loadData();
}, [loadData]);  // loadData 是稳定引用

// ❌ 坏：缺少依赖
useEffect(() => {
  fetchData(locale);  // locale 未声明为依赖
}, []);  // exhaustive-deps 警告
```

### 3.4 Hydration 安全

```typescript
// ✅ 好：客户端挂载后才渲染动态内容
function PriceDisplay({ price }: { price: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="animate-pulse">--</span>;
  return <span>{formatCurrency(price)}</span>;
}

// ❌ 坏：直接在渲染中使用动态值
function PriceDisplay({ price }: { price: number }) {
  return <span>{new Date().toLocaleDateString()}: {price}</span>;
}
```

### 3.5 HTML 嵌套

```tsx
// ❌ 坏：<p> 嵌套 <div>
<p><div>内容</div></p>

// ✅ 好：<div> 嵌套 <div>
<div><span>内容</span></div>
```

---

## 四、组件规范

### 4.1 shadcn/ui 优先

- 位于 `src/components/ui/` 的组件库是项目默认 UI 基础设施。
- 优先使用已有 shadcn/ui 组件，不自行实现相同功能。
- 新增 shadcn/ui 组件通过 `pnpm dlx shadcn@latest add <component>` 安装。

### 4.2 组件文件结构

```typescript
// 1. 'use client' 声明（如需要）
'use client';

// 2. 第三方导入
import { useState, useEffect } from 'react';

// 3. 内部导入
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

// 4. 类型/接口定义
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

// 5. 组件实现
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // hooks → 状态 → 副作用 → 事件处理 → 渲染
}
```

### 4.3 导入顺序

按以下顺序组织导入，各组之间空一行：

1. React / Next.js 内置模块
2. 第三方库（radix, lucide, date-fns 等）
3. `@/components/ui/*`
4. `@/components/*`（自定义组件）
5. `@/lib/*`（工具库、服务、API）
6. `@/hooks/*`
7. `@/i18n/*`
8. 相对路径导入

---

## 五、样式规范

### 5.1 Tailwind CSS

- 使用 Tailwind 工具类组合样式，不写自定义 CSS（除非不可避免）。
- 使用 `cn()` 工具函数（来自 `@/lib/utils`）合并条件类名：

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' ? 'primary-style' : 'secondary-style',
)} />
```

### 5.2 响应式设计

- 使用 Tailwind 的响应式前缀：`sm:`、`md:`、`lg:`、`xl:`。
- 移动优先：默认样式面向最小屏幕，逐步向上适配。

---

## 六、API 路由规范

### 6.1 路由处理模式

```typescript
// src/app/api/brands/route.ts
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';
// cacheResponse 实际定义在 @/lib/utils，api-middleware 做了 re-export

// 公开接口：带速率限制
export const GET = withMiddleware(async () => {
  const brands = await BrandService.findAll();
  return cacheResponse(NextResponse.json(brands), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

// 需要管理员认证
export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const brand = await BrandService.create(body);
  return NextResponse.json(brand, { status: 201 });
});
```

### 6.2 中间件选择

| 中间件 | 用途 | 认证 | 速率限制 |
|--------|------|------|---------|
| `withMiddleware(handler, config)` | 通用中间件 | 可选 | 可选 |
| `withAuth(handler)` | 需要登录 | ✅ customer/admin | ❌ |
| `withAdmin(handler)` | 需要管理员 | ✅ admin | ❌ |
| `withRateLimit(handler, config)` | 公开 + 限流 | ❌ | ✅ |

### 6.3 错误处理

API 路由**不需要**自行 try-catch——中间件层统一捕获 `ServiceError` 并映射为 HTTP 响应。

```typescript
// ✅ 好：直接抛出领域错误，中间件会处理
export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const brand = await BrandService.create(body);
  // ServiceError (NotFoundError, BusinessRuleError) 会被中间件捕获
  return NextResponse.json(brand, { status: 201 });
});
```

### 6.4 响应格式

```typescript
// 成功
{ data }                              // 直接返回数据
{ data, meta: { page, total } }       // 带分页

// 错误
{ error: string, code?: string }      // 错误信息 + 可选错误码
```

### 6.5 页面组件错误处理

页面组件调用 API 后需要处理加载和错误状态：

```typescript
'use client';
import { useState, useEffect, useCallback } from 'react';

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const items = await api.products.list();
      setData(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  return <ProductList products={data} />;
}
```

**catch 块规则**：
- 需要错误信息时：`catch (err)` + `err instanceof Error` 收窄
- 不需要错误信息时：`catch` 省略绑定（不写 `catch (e)` 再不用 `e`）

---

## 七、服务层规范

### 7.1 服务层模式

```typescript
// src/lib/services/brand.service.ts

// 1. Zod schema 定义输入校验
const createBrandSchema = z.object({
  name: z.string().min(1).max(255),
  logo: z.string().max(500).optional().nullable(),
});
type CreateBrandInput = z.infer<typeof createBrandSchema>;

// 2. 静态方法实现业务逻辑
export class BrandService {
  static async create(data: CreateBrandInput) {
    const validated = createBrandSchema.parse(data);
    // 业务规则校验
    // 数据库操作
    // 返回结果
  }
}
```

### 7.2 领域错误

使用 `src/lib/services/errors.ts` 中定义的错误类型：

| 错误类 | HTTP 状态码 | 用途 |
|--------|------------|------|
| `NotFoundError` | 404 | 资源不存在 |
| `BusinessRuleError` | 422 | 业务规则违反（重名、库存不足等） |
| `ServiceError` | 自定义 | 通用服务层错误 |

### 7.3 校验规则

- **输入校验**：使用 Zod schema 在 Service 入口处校验。
- **业务规则**：在 Service 方法内部用 `if + throw BusinessRuleError` 校验。
- **不信任客户端**：所有 `request.json()` 结果必须经过 Zod 校验后使用。

---

## 八、数据库 / Drizzle ORM 规范

### 8.1 Schema 定义

Schema 的 canonical 位置是 `src/lib/db/schema/index.ts`。`src/storage/` 下是 Drizzle 自动生成的 relations 文件，不要手动编辑。

```typescript
// src/lib/db/schema/index.ts
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  status: boolean('status').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 8.2 查询模式

```typescript
// ✅ 好：类型安全的查询
const result = await db
  .select({ id: brands.id, name: brands.name })
  .from(brands)
  .where(eq(brands.status, true));

// ✅ 好：使用 $inferSelect / $inferInsert 推导类型
type Brand = typeof brands.$inferSelect;
```

### 8.3 Schema 变更

- Schema 变更后运行 `pnpm drizzle-kit generate` 生成迁移。
- 不手动写 SQL 迁移文件。

---

## 九、国际化规范

### 9.1 路由结构

所有页面路由带 `[locale]` 动态段：`/[locale]/products`、`/[locale]/admin/orders`。
API 路由不带 locale 前缀：`/api/products`。

支持的 locale 列表定义在 `src/i18n/config.ts`（当前 11 种：zh/en/ja/ko/es/fr/de/ru/pt/ar/th）。

### 9.2 翻译使用

```typescript
// 客户端组件
'use client';
import { useTranslations } from '@/i18n/useTranslations';

function MyComponent() {
  const { t, locale } = useTranslations();
  return <h1>{t('products.title')}</h1>;
}
```

### 9.3 多语言数据

- 数据库中的多语言内容通过 `xxxDescriptions` 表存储（如 `productDescriptions`、`categoryDescriptions`）。
- 查询时通过 `locale` 参数过滤对应语言的描述。

---

## 十、测试规范

### 10.1 测试金字塔

| 层级 | 占比 | 工具 | 覆盖范围 |
|------|------|------|---------|
| 单元测试 | ~70% | Vitest + vi.mock | 服务层、工具函数、Schema |
| 组件测试 | ~15% | React Testing Library | UI 组件渲染 + 交互 |
| 集成测试 | ~10% | Vitest + MSW | API 路由、服务与 DB 集成 |
| E2E 测试 | ~5% | Playwright | 关键业务路径 |

### 10.2 覆盖率目标

| 模块 | statements | branches | functions |
|------|-----------|----------|-----------|
| 服务层 | ≥ 75% | ≥ 55% | ≥ 75% |
| 工具函数 | ≥ 95% | ≥ 80% | ≥ 95% |

### 10.3 文件约定

| 类型 | 位置 | 命名 |
|------|------|------|
| 单元测试 | `src/__tests__/unit/services/` | `{name}.service.test.ts` |
| 路由测试 | `src/__tests__/unit/api/` | `{name}.route.test.ts` |
| 集成测试 | `src/__tests__/integration/` | `api.test.ts` |
| E2E 测试 | `e2e/` | `{name}.spec.ts` |

### 10.4 测试编写规范

```typescript
describe('BrandService', () => {
  describe('create', () => {
    it('应该成功创建品牌', async () => {
      // Arrange
      const input = { name: 'Test Brand' };
      // Act
      const result = await BrandService.create(input);
      // Assert
      expect(result.name).toBe('Test Brand');
    });

    it('品牌名已存在时应抛出 BusinessRuleError', async () => {
      await expect(BrandService.create({ name: 'Existing' }))
        .rejects.toThrow(BusinessRuleError);
    });
  });
});
```

### 10.5 Mock 规范

```typescript
// ✅ 好：使用具体函数签名代替 Function
vi.mock('@/lib/api-middleware', async () => ({
  withAdmin: (
    handler: (req: NextRequest, ctx: Record<string, unknown>) => Promise<NextResponse> | NextResponse
  ) => async (req: NextRequest, ctx: Record<string, unknown>) => {
    try { return await handler(req, ctx); }
    catch (error) { return getErrorResponse(error); }
  },
}));

// ❌ 坏：用 Function 类型
vi.mock('@/lib/api-middleware', async () => ({
  withAdmin: (handler: Function) => async (req, ctx) => { ... },
}));
```

---

## 十一、路径别名

项目使用 `@/` 作为 `src/` 的路径别名：

```typescript
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useTranslations } from '@/i18n/useTranslations';
```

不使用相对路径穿越多层目录：`import { Button } from '../../../components/ui/button'`。

---

## 十二、包管理

- **仅允许 pnpm**，严禁 npm 或 yarn。
- `package.json` 中通过 `preinstall` 脚本 + `only-allow` 强制执行。
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`

---

## 十三、Git 提交

### 质量门禁

```bash
# 提交前检查（自动执行）
pnpm gate:commit  # validate + test
# 等价于：pnpm validate && pnpm test

# 部署前检查
pnpm gate:deploy  # test:coverage + test:e2e
# 等价于：pnpm test:coverage && pnpm test:e2e

# 手动分步检查
pnpm validate     # ts-check + lint:build + lint:style
pnpm test         # 单元测试
pnpm ts-check     # 仅类型检查
pnpm lint         # 仅 lint
```

### Commit Message

遵循 Conventional Commits：

```
feat: 新增品牌管理功能
fix: 修复购物车数量更新失败
refactor: 重构 api.ts 类型定义
test: 补充品牌服务单元测试
docs: 更新编码规范文档
```
