# 系统架构

## 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端 (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Shop 前台    │  │  Admin 后台   │  │  API 客户端 (api.ts) │  │
│  │  (React CSR)  │  │  (React CSR)  │  │  fetch → /api/*      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│  ┌──────┴─────────────────┴──────────────────────┘              │
│  │  Context Providers (I18n / Currency / Cart / Theme)          │
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / WebSocket (HMR)
┌──────────────────────────┴──────────────────────────────────────┐
│                    Next.js 16 App Router                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ middleware.ts│  │ Route Groups │  │   API Routes           │ │
│  │ (i18n 重定向)│  │ (shop/admin) │  │  /api/* (route.ts)     │ │
│  └─────────────┘  └──────────────┘  └───────────┬────────────┘ │
│                                                  │              │
│  ┌───────────────────────────────────────────────┘              │
│  │  withMiddleware (鉴权 + 速率限制)                             │
│  │  ┌─────────────────────────────────────────────┐            │
│  │  │  Service Layer (services/*.service.ts)       │            │
│  │  │  Zod 校验 → Drizzle ORM → PostgreSQL        │            │
│  │  └─────────────────────────────────────────────┘            │
│  └──────────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                      PostgreSQL 数据库                            │
│  products / categories / orders / customers / reviews / ...     │
└─────────────────────────────────────────────────────────────────┘
```

## 请求流转路径

### 前台页面 (SSR + CSR 混合)
1. 用户访问 `/{locale}/...`
2. `middleware.ts` 检测 locale，缺失则重定向到 `/zh/...`
3. `shop layout.tsx` 包裹 I18nProvider / CurrencyProvider / CartProvider / ThemeProvider
4. 页面组件 (`page.tsx`) 使用 `'use client'`，通过 `api.ts` 客户端调用 `/api/*`
5. API Route → `withMiddleware` → Service → Drizzle ORM → PostgreSQL

### 后台管理
1. 访问 `/{locale}/admin/...`
2. `admin layout.tsx` 渲染侧边栏 + 顶栏
3. 页面通过 `api.ts` 调用受鉴权保护的 API

### API 路由
1. 请求到达 `/api/*` route.ts
2. `withMiddleware` 统一处理：
   - 速率限制 (`rateLimitMiddleware`)
   - JWT 鉴权 (`authenticate` + `requireAuth`)
3. 调用对应 Service 函数
4. Service 层使用 Zod 校验输入，Drizzle ORM 执行数据库操作

## 服务端入口

项目使用**自定义服务端** (`src/server.ts`)，而非标准 `next start`：
- 创建 HTTP Server，手动调用 `app.prepare()` + `server.listen()`
- 支持通过环境变量 `HOSTNAME` / `PORT` 配置监听地址
- `dev.sh` 脚本使用 `tsx watch` 实现热重载
