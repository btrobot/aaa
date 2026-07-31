# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **测试框架**: Vitest (单元/集成) + Playwright (E2E)
- **数据库**: PostgreSQL + Drizzle ORM
- **国际化**: next-intl

## 构建与测试命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm test` | 运行所有单元测试 (watch模式) |
| `pnpm test:run` | 运行所有单元测试 (单次) |
| `pnpm test:coverage` | 运行测试并生成覆盖率报告 |
| `pnpm test:integration` | 运行集成测试 |
| `pnpm test:e2e` | 运行 E2E 测试 (Playwright) |
| `pnpm test:e2e:ui` | 运行 E2E 测试 (UI模式) |
| `pnpm test:all` | 运行完整测试套件 |
| `pnpm lint` | ESLint 检查 |
| `pnpm ts-check` | TypeScript 类型检查 |
| `pnpm lint:build` | 构建前检查 (lint + ts-check) |

## 测试策略

详见 `TEST_PLAN.md`，核心原则：

- **测试金字塔**: 70% 单元测试 / 20% 集成测试 / 10% E2E 测试
- **覆盖率目标**: 服务层 statements ≥ 75%, branches ≥ 55%, functions ≥ 75%
- **TDD 流程**: Red → Green → Refactor
- **质量门禁**: 测试通过 + 覆盖率达标 + TS 无错误 + Lint 无错误

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 通用工具函数 (cn)
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 编码规范

> **详细规范见 [`CODING_STANDARDS.md`](./CODING_STANDARDS.md)**，以下为关键摘要。

- **Lint 哲学**：Lint error/warning 是质量信号，修根因而非绕过规则。禁止 `eslint-disable`、`as any`、`@ts-ignore`。
- **TypeScript**：strict 心智，禁止隐式 `any`，追溯数据来源定义具体类型，函数参数用明确签名而非 `Function`。
- **React / Next.js**：服务端组件为默认；客户端动态值必须 `useEffect` + `useState`；`exhaustive-deps` 补全依赖或 `useCallback` 稳定化。
- **next.config**：路径不写死绝对路径，使用 `import.meta.dirname` 或 `process.cwd()` 动态拼接。
- **Hydration**：严禁在 JSX 渲染中直接使用 `typeof window`、`Date.now()`、`Math.random()`；禁止 `<head>` 标签，用 metadata API。
- **组件**：shadcn/ui 为默认 UI 基础设施，除非用户指定其他方案。
- **API 路由**：使用 `withMiddleware`/`withAuth`/`withAdmin` 中间件；Service 层抛领域错误，中间件统一捕获映射 HTTP 响应。
- **服务层**：Zod schema 入口校验 + 静态方法类模式 + 领域错误继承体系。
- **测试**：70% 单元 / 20% 集成 / 10% E2E；Mock 用具体函数签名，不用 `Function`。
