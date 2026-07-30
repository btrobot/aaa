# 测试策略

## 测试框架

| 类型 | 框架 | 配置文件 |
|------|------|----------|
| 单元测试 | Vitest (4.1.10) | `vitest.config.ts` |
| 集成测试 | Vitest | `vitest.integration.config.ts` |
| E2E 测试 | Playwright (1.62.0) | `e2e/playwright.config.ts` |

## 测试金字塔

```
        ╱╲
       ╱  ╲         E2E (10%)
      ╱────╲        Playwright - 端到端用户流程
     ╱      ╲
    ╱────────╲      集成测试 (20%)
   ╱          ╲     Vitest - API 路由 + 数据库交互
  ╱────────────╲
 ╱              ╲   单元测试 (70%)
╱────────────────╲  Vitest - Service / Schema / Component
```

## 测试目录结构

```
src/__tests__/
├── setup.ts                          # 全局测试配置
├── components/                       # 组件测试
│   ├── navbar.test.tsx
│   ├── footer.test.tsx
│   ├── product-reviews.test.tsx
│   └── test-utils.tsx                # 测试工具函数
├── unit/
│   ├── db/
│   │   └── schema.test.ts            # 数据库 Schema 测试
│   └── services/
│       ├── brand.service.test.ts
│       ├── cart.service.test.ts
│       ├── category.service.test.ts
│       ├── customer.service.test.ts
│       ├── order.service.test.ts
│       └── product.service.test.ts
└── integration/
    └── api.test.ts                   # API 集成测试
```

## 覆盖率目标

| 指标 | 目标 |
|------|------|
| Statements | ≥ 75% |
| Branches | ≥ 55% |
| Functions | ≥ 75% |

## 测试命令

```bash
pnpm test           # 运行所有单元测试 (watch 模式)
pnpm test:run       # 运行所有单元测试 (单次)
pnpm test:coverage  # 运行测试 + 覆盖率报告
pnpm test:integration # 集成测试
pnpm test:e2e       # E2E 测试 (Playwright)
pnpm test:e2e:ui    # E2E 测试 (UI 模式)
pnpm test:all       # 完整测试套件
```

## 质量门禁

### 提交门禁 (`gate:commit`)
```bash
pnpm validate && pnpm test
# = pnpm ts-check + pnpm lint:build + pnpm lint:style + pnpm test
```

### 部署门禁 (`gate:deploy`)
```bash
pnpm test:coverage && pnpm test:e2e
```

## TDD 流程

项目遵循 **Red → Green → Refactor** 循环：
1. **Red**: 先写失败的测试
2. **Green**: 写最少代码让测试通过
3. **Refactor**: 重构代码，保持测试通过

## 测试工具

| 工具 | 用途 |
|------|------|
| `@testing-library/react` | React 组件测试 |
| `@testing-library/user-event` | 用户交互模拟 |
| `@testing-library/jest-dom` | DOM 断言扩展 |
| `jsdom` | 浏览器环境模拟 |
| `msw` (Mock Service Worker) | API 请求拦截 |
| `@vitest/coverage-v8` | 代码覆盖率 |
