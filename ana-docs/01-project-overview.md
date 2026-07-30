# NodeCoda 项目总览

## 项目定位

NodeCoda 是一个**游乐设备制造与跨境电商平台**，为全球主题乐园提供高品质游乐设施的在线展示、销售和管理能力。

## 核心技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.1.1 |
| UI | React + React DOM | 19.2.3 |
| 语言 | TypeScript (strict) | 5.9.3 |
| 组件库 | shadcn/ui (Radix UI) | latest |
| 样式 | Tailwind CSS | 4.1.18 |
| ORM | Drizzle ORM + drizzle-zod | 0.45.1 |
| 数据库 | PostgreSQL (pg driver) | 8.17.2 |
| 认证 | jose (JWT) + bcryptjs | 6.2.5 / 3.0.3 |
| 国际化 | next-intl + 自定义 i18n | 4.13.4 |
| 测试 | Vitest + Playwright | 4.1.10 / 1.62.0 |
| 包管理 | pnpm (≥9.0.0) | — |

## 项目性质

- **全栈电商系统**：同时包含前台商城 (Shop) 和后台管理 (Admin) 两大模块
- **多语言支持**：支持 11 种语言 (zh/en/ja/ko/es/fr/de/ru/pt/ar/th)
- **多货币支持**：内置货币上下文 Provider
- **SEO 友好**：内置 robots.ts、sitemap.ts、JsonLd 结构化数据
- **自定义服务端入口**：通过 `src/server.ts` 启动，非标准 `next start`

## 品牌名称

项目对外品牌名为 **NodeCoda**，数据库名 `nodecoda`，JWT token 名 `nodecoda_token`。
