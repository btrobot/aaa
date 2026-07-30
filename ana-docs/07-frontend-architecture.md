# 前端架构

## 渲染策略

项目采用 **CSR 为主 + SSR 外壳** 的混合策略：
- **Layout**: Server Component (Metadata、JsonLd、Provider 包裹)
- **Page**: Client Component (`'use client'`) — 通过 `useEffect` 加载数据
- **API**: 客户端通过 `api.ts` 调用 `/api/*` 获取数据

## Context Provider 层级

```
RootLayout (lang="zh")
  └── [locale]/(shop)/layout.tsx
        ├── CurrencyProvider    ← 货币上下文
        ├── CartProvider        ← 购物车上下文
        ├── I18nProvider        ← 国际化上下文
        └── ThemeProvider       ← 主题上下文
              ├── Navbar
              ├── {children}    ← 页面内容
              └── Footer
```

## 国际化 (i18n)

### 配置
- **支持语言**: zh, en, ja, ko, es, fr, de, ru, pt, ar, th (共 11 种)
- **默认语言**: zh (中文)
- **翻译文件**: `src/messages/{locale}.json`
- **实现方式**: 自定义 I18nProvider + `useTranslations` hook

### locale 路由
- 所有页面路由以 `/{locale}/...` 开头
- `middleware.ts` 自动重定向无 locale 的请求
- API 路由不受 locale 影响 (通过 query param 传递)

### 翻译使用
```tsx
const { locale, t } = useTranslations();
// t('home.heroTitle') → 从 messages/{locale}.json 取值
```

## 组件库

### shadcn/ui 组件 (60+ 个)
位于 `src/components/ui/`，基于 Radix UI 原语封装：
- 布局: accordion, collapsible, resizable, separator, scroll-area
- 表单: button, input, textarea, select, checkbox, radio-group, switch, slider, form, calendar, input-otp
- 反馈: alert, alert-dialog, dialog, drawer, sonner (toast), progress, spinner, skeleton
- 数据展示: table, card, badge, avatar, carousel, chart, pagination, empty
- 导航: navigation-menu, menubar, tabs, breadcrumb, dropdown-menu, context-menu, command
- 覆盖层: popover, hover-card, tooltip, sheet

### 业务组件
| 组件 | 功能 |
|------|------|
| `Navbar` | 响应式导航栏 (Logo + 菜单 + 搜索 + 购物车 + 用户) |
| `Footer` | 页脚 (品牌信息 + 链接 + 联系方式) |
| `ProductReviews` | 商品评价列表 + 评分统计 |
| `JsonLd` | 结构化数据 (SEO) |

## 主题系统

- **ThemeProvider**: 基于 `next-themes` 的主题切换
- **presets.ts**: 预设主题配置
- **Tailwind CSS 4**: 使用 CSS 变量实现主题色

## 状态管理

未使用 Redux/Zustand 等全局状态库，采用 React Context：
- `CartContext`: 购物车状态 (内存，非持久化)
- `I18nProvider`: 语言和翻译
- `CurrencyProvider`: 货币格式
- `ThemeProvider`: 主题切换

## SEO 优化

| 功能 | 实现 |
|------|------|
| Metadata | `generateMetadata` / 静态 metadata 对象 |
| robots.txt | `src/app/robots.ts` (禁止 /api/ /admin/) |
| sitemap.xml | `src/app/sitemap.ts` |
| JsonLd | Organization + Product 结构化数据 |
| OpenGraph | 完整 OG 标签 |
| Twitter Cards | summary_large_image |
| hreflang | alternates.languages 多语言声明 |
