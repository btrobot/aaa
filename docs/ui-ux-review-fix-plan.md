# UI/UX 页面审查与修复计划

> 生成日期：2026-07-21
> 审查范围：首页、产品列表页、产品详情页、结账页、导航栏、页脚、管理后台
> 工具：ui-ux-pro-max（50 风格/97 色板/57 字体搭配）、web-design-guidelines（Vercel Web 界面规范）

---

## 🔴 P0 — 必须修复

### 1. 品牌标识错误

**问题**：Navbar 和 Footer 中仍使用橙色渐变的字母 "B" 作为 Logo，这是 BeikeShop 遗留标识，非 NodeCoda 品牌。

**涉及文件**：
- `src/components/Navbar.tsx`（约第 50-60 行）
- `src/components/Footer.tsx`（约第 10-20 行）

**修复方式**：

在 Navbar.tsx 中：
```tsx
// 替换
<Link href={`/${locale}`} className="flex items-center space-x-2">
  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-lg">B</span>
  </div>
  <span className="text-xl font-bold">NodeCoda</span>
</Link>

// 改为
<Link href={`/${locale}`} className="flex items-center space-x-2">
  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-lg">N</span>
  </div>
  <span className="text-xl font-bold text-gray-900">NodeCoda</span>
</Link>
```

在 Footer.tsx 中：
```tsx
// 替换 Logo 部分 (同上类似)
// 同时将 Footer 标题 "BeikeShop" 改为 "NodeCoda"
```

---

### 2. 添加面包屑导航

**问题**：所有页面缺少面包屑导航，影响用户导航和 SEO。

**涉及文件**：
- 新建 `src/components/Breadcrumb.tsx`
- `src/app/[locale]/(shop)/products/page.tsx`
- `src/app/[locale]/(shop)/products/[slug]/page.tsx`
- `src/app/[locale]/(shop)/checkout/page.tsx`

**新建 Breadcrumb 组件**：
```tsx
// src/components/Breadcrumb.tsx
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-1 text-sm text-gray-500">
        <li>
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center space-x-1">
            <ChevronRight className="w-4 h-4" />
            {item.href ? (
              <Link href={item.href} className="hover:text-blue-600">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

**使用方式**（示例：产品列表页）：
```tsx
<Breadcrumb items={[{ label: 'Products', href: '/products' }, { label: 'All Products' }]} />
```

---

### 3. 添加加载骨架屏

**问题**：异步加载数据的页面（首页、产品列表、产品详情、结账页、管理后台仪表盘）在数据未返回时直接显示空白或瞬间闪现内容，感知性能差。

**涉及文件**：
- `src/app/[locale]/(shop)/page.tsx`（首页产品列表）
- `src/app/[locale]/(shop)/products/page.tsx`（产品列表）
- `src/app/[locale]/(shop)/products/[slug]/page.tsx`（产品详情）
- `src/app/[locale]/(shop)/checkout/page.tsx`
- `src/app/[locale]/admin/page.tsx`

**新建 Skeleton 组件**（shadcn/ui 已预装，如未安装则创建）：
```tsx
// src/components/ui/skeleton.tsx (如果已存在则直接使用)
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}
export { Skeleton };
```

**使用方式**（示例：产品列表页 loading 状态）：
```tsx
{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="border rounded-lg p-4 space-y-3">
        <Skeleton className="w-full h-48 rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    ))}
  </div>
) : (
  // 实际内容
)}
```

---

## 🟡 P1 — 中等优先级

### 4. 修复社交图标为真实 SVG

**问题**：Footer 中社交媒体链接使用文字首字母（F, T, I, Y），而非标准图标。

**涉及文件**：
- `src/components/Footer.tsx`

**修复方式**：使用 Lucide 图标或 Simple Icons 替换文本。

```tsx
// 替换
<a href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">
  <span className="text-sm font-medium">F</span>
</a>

// 改为
<a href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors" aria-label="Facebook">
  <Facebook className="w-4 h-4" />
</a>
```

需要导入的图标：
```tsx
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
// 注意：Lucide 有 Facebook, Twitter, Instagram, Youtube 图标
```

---

### 5. 修复客户服务死链接

**问题**：Footer 中客户服务链接全部使用 `href="#"`。

**涉及文件**：
- `src/components/Footer.tsx`

**修复方式**：补充真实链接，若无则移除或改为 `span` 占位。

```tsx
// 将
<Link href="#" className="text-gray-600 hover:text-gray-900 text-sm">Help Center</Link>

// 改为
<Link href={`/${locale}/contact`} className="text-gray-600 hover:text-gray-900 text-sm">Help Center</Link>
```

如果路由不存在，可指向 `#` 并添加 `cursor-not-allowed` 样式表示暂不可用。

---

### 6. 添加焦点样式

**问题**：可交互元素缺少 `:focus-visible` 焦点环，键盘导航不可见。

**涉及文件**：
- `src/app/globals.css`（全局样式表）

**修复方式**：在 globals.css 中添加全局 focus-visible 样式：

```css
@layer base {
  *:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
    border-radius: 4px;
  }
  
  /* 鼠标点击时不要显示焦点环 */
  *:focus:not(:focus-visible) {
    outline: none;
  }
}
```

---

### 7. 添加光标样式

**问题**：可点击卡片（产品卡片、分类卡片）缺少 `cursor-pointer` 提示。

**涉及文件**：
- `src/app/[locale]/(shop)/products/page.tsx`（产品卡片）
- `src/app/[locale]/(shop)/page.tsx`（首页特色卡片、分类卡片）

**修复方式**：在可点击的卡片容器上添加 `className="cursor-pointer"`。

示例（产品列表页）：
```tsx
// 找到包裹 Link 的卡片 div，添加 className 中包含 cursor-pointer
<Link href={`/products/${product.slug}`} className="group block cursor-pointer">
```

---

## 🟢 P2 — 可优化项

### 8. 色彩系统优化（工业感增强）

**问题**：当前蓝色系偏通用，缺少工业/重型设备品牌的独特感。

**涉及文件**：
- `src/app/globals.css`（CSS 变量定义）
- `tailwind.config.ts`（或 tailwind 自定义配置）

**建议调整**：
```css
/* 当前 */
--primary: #2563eb;
--primary-dark: #1d4ed8;

/* 建议调整为更深的工业蓝 */
--primary: #1e40af;      /* blue-800 */
--primary-dark: #1e3a8a; /* blue-900 */
--primary-light: #dbeafe; /* blue-100 */

/* 主色偏冷，辅色使用橙色作为强调 */
--accent: #f97316;        /* orange-500 */
--accent-dark: #ea580c;   /* orange-600 */
```

---

### 9. 字体升级

**问题**：当前使用系统默认字体（PingFang SC / Microsoft YaHei），缺少品牌感。

**建议**：在 `globals.css` 中引入 Google Fonts：

```css
/* 在 globals.css 顶部 @import tailwindcss 之前 */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

/* 在 globals.css 中设置 */
:root {
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
```

在 tailwind 配置中扩展：
```ts
// tailwind.config.ts
fontFamily: {
  heading: ['Plus Jakarta Sans', 'sans-serif'],
  body: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
}
```

---

### 10. 微交互动效

**问题**：页面缺少精致微交互，体验偏平淡。

**涉及文件**：
- 全局（可统一在 CSS 中处理）

**建议添加**：

```css
/* 按钮点击反馈 */
.btn-press:active {
  transform: scale(0.97);
  transition: transform 0.1s;
}

/* 卡片 hover 提升 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-hover:hover {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 页面 fadeIn 动画 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}
```

---

### 11. 添加步骤进度指示器（结账页）

**问题**：结账页有多步骤流程，但没有视觉进度指示。

**涉及文件**：
- `src/app/[locale]/(shop)/checkout/page.tsx`

**建议**：在结账页面顶部添加步骤指示器：

```tsx
// 步骤指示器组件
const steps = [
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirm', label: 'Confirm', icon: CheckCircle },
];

// 当前步骤通过状态控制
<ol className="flex items-center mb-8">
  {steps.map((step, i) => (
    <li key={step.id} className="flex items-center flex-1">
      <div className={`flex items-center gap-2 ${step.id === currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
        <step.icon className="w-5 h-5" />
        <span className="text-sm font-medium">{step.label}</span>
      </div>
      {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-4" />}
    </li>
  ))}
</ol>
```

---

### 12. 支持 prefers-reduced-motion

**问题**：动画未考虑无障碍减动偏好设置。

**涉及文件**：
- `src/app/globals.css`

**修复方式**：
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 修复优先级汇总

| 优先级 | 编号 | 项目 | 估计工作量 | 依赖 |
|--------|------|------|-----------|------|
| 🔴 P0 | 1 | 修复品牌标识 | 0.5h | 无 |
| 🔴 P0 | 2 | 添加面包屑导航 | 1h | 新建组件 |
| 🔴 P0 | 3 | 添加加载骨架屏 | 1.5h | Skeleton 组件 |
| 🟡 P1 | 4 | 修复社交图标 | 0.5h | 无 |
| 🟡 P1 | 5 | 修复死链接 | 0.5h | 无 |
| 🟡 P1 | 6 | 添加焦点样式 | 0.3h | 无 |
| 🟡 P1 | 7 | 添加 cursor-pointer | 0.5h | 无 |
| 🟢 P2 | 8 | 色彩系统优化 | 1h | 全局 CSS |
| 🟢 P2 | 9 | 字体升级 | 1h | 无 |
| 🟢 P2 | 10 | 微交互动效 | 1.5h | 无 |
| 🟢 P2 | 11 | 步骤指示器 | 1h | 结账页 |
| 🟢 P2 | 12 | 减动偏好支持 | 0.3h | 无 |

**推荐执行顺序**：P0 → P1 → P2（按编号顺序，无跨任务依赖）

---

## 附录：推荐工具与方法

### 所用工具链

1. **ui-ux-pro-max** — 设计系统生成、风格推荐、UX 指南
2. **web-design-guidelines** — Vercel Web 界面规范（色彩对比度、触摸目标、焦点状态、语义化 HTML）
3. **shadcn/ui** — 组件库（Skeleton, Breadcrumb 等已预装）

### 验证标准

每个修复完成后，通过以下检查：

```
□ TypeScript 编译无错误  (pnpm ts-check)
□ ESLint 无错误          (pnpm lint)
□ 所有测试通过           (pnpm test:run)
□ 响应式布局正常         (移动端/平板/桌面)
□ 键盘导航可访问        (Tab 键遍历)
□ 构建通过              (pnpm build)
```