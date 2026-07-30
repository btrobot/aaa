# BeikeShop 现代版 — 测试策略规划

> 版本: v1.0
> 基于测试金字塔 + 质量门禁（Quality Gate）体系

---

## 一、测试金字塔策略

```
           ╱╲
          ╱  ╲          E2E 端到端测试         ~5%
         ╱    ╲         Playwright + MSW
        ╱──────╲
       ╱        ╲      集成测试 (API + 服务)    ~10%
      ╱          ╲     Supertest + MSW
     ╱────────────╲
    ╱              ╲   组件测试 (React)         ~15%
   ╱                ╲  React Testing Library
  ╱──────────────────╲
 ╱                    ╲ 单元测试 (纯逻辑 + DB)   ~70%
╱                      ╲ Vitest + Drizzle Mock
────────────────────────
```

| 层级 | 目标 | 速度 | 数量级 | 维护成本 |
|------|------|------|--------|----------|
| **单元测试** | 验证纯逻辑 / 服务层 / 工具函数 | 毫秒级 | 数百个 | 低 |
| **组件测试** | 验证 UI 组件渲染 + 交互 | 百毫秒级 | 数十个 | 中 |
| **集成测试** | 验证 API 路由 + 服务与 DB 集成 | 秒级 | 数十个 | 中高 |
| **E2E 测试** | 验证关键业务路径 | 分钟级 | 十余个 | 高 |

---

## 二、测试类型详解

### 2.1 单元测试 (Unit Tests) — 占比 70%

**目标**: 覆盖所有纯函数、服务层、工具函数、Schema 定义

**工具**: `Vitest` + `vi.mock` (链式调用 Mock)

**覆盖范围**:

| 模块 | 当前覆盖率 | 目标覆盖率 | 测试策略 |
|------|-----------|-----------|----------|
| **Services** | 77.73% 行 | **≥ 90%** 行, **≥ 80%** 分支 | 每个公有方法至少 1 个 happy path + 1 个 error case |
| **DB Schema** | 40.36% 行 | **≥ 80%** 行 | 表结构验证 + 关系验证 + 默认值验证 |
| **DB 连接** | 0% | **≥ 80%** 行 | 连接配置 + 环境变量加载 |
| **工具函数** | — | **≥ 95%** 行 | 输入输出边界测试 |
| **Zod Schema** | — | **≥ 100%** 行 | 有效数据通过 + 无效数据拒绝 |

**编写规范**:
```
src/__tests__/unit/
├── db/
│   └── schema.test.ts          # 表结构 + 关系 + 默认值
├── services/
│   ├── product.service.test.ts  # CRUD + 搜索 + 分页 + 边界
│   ├── category.service.test.ts # 树形 + 多语言 + 软删除
│   ├── brand.service.test.ts    # CRUD + 搜索
│   ├── cart.service.test.ts     # 增删改查 + 并发
│   ├── order.service.test.ts    # 创建 + 状态机 + 查询
│   └── customer.service.test.ts # 注册/登录/地址/收藏
├── validations/
│   └── *.test.ts                # Zod Schema 验证
└── utils/
    └── *.test.ts                # 工具函数
```

**命名规范**:
```typescript
describe('ProductService', () => {
  describe('create', () => {
    it('应能创建产品并返回完整信息', async () => { ... });
    it('SKU 重复时应抛出错误', async () => { ... });
    it('缺少必填字段时应抛出验证错误', async () => { ... });
  });
  describe('search', () => {
    it('应支持按关键词搜索', async () => { ... });
    it('应支持按分类筛选', async () => { ... });
    it('应支持分页返回', async () => { ... });
    it('空关键词应返回全部产品', async () => { ... });
  });
});
```

### 2.2 组件测试 (Component Tests) — 占比 15%

**目标**: 验证 React 组件渲染 + 用户交互

**工具**: `Vitest` + `@testing-library/react` + `@testing-library/user-event`

**覆盖范围**:

| 组件 | 优先级 | 测试要点 |
|------|--------|----------|
| Navbar | P0 | 渲染导航链接、语言切换、移动端汉堡菜单 |
| Footer | P0 | 渲染链接、响应式 |
| ProductCard | P0 | 渲染产品信息、hover 效果、点击跳转 |
| CartItem | P0 | 渲染商品、数量调整、删除 |
| SearchBar | P0 | 输入搜索、提交、清空 |
| AddressForm | P1 | 表单验证、提交、编辑 |
| AdminSidebar | P0 | 导航高亮、折叠展开 |
| DataTable | P0 | 数据渲染、排序、分页 |
| StatusBadge | P0 | 不同状态颜色渲染 |
| Pagination | P0 | 页码渲染、点击切换 |

**编写规范**:
```typescript
describe('ProductCard', () => {
  it('应渲染产品名称、价格和图片', () => { ... });
  it('点击应跳转到产品详情页', () => { ... });
  it('缺货时应显示"缺货"标签', () => { ... });
});
```

### 2.3 集成测试 (Integration Tests) — 占比 10%

**目标**: 验证 API 路由与服务的真实集成

**工具**: `Vitest` + `Supertest` + `MSW` (Mock Service Worker)

**覆盖范围**:

| 接口 | 优先级 | 测试要点 |
|------|--------|----------|
| `GET /api/products` | P0 | 列表返回 + 搜索 + 分页 + 筛选 |
| `GET /api/products/:id` | P0 | 详情返回 + 404 处理 |
| `POST /api/products` | P0 | 创建 + 验证 + 重复 SKU |
| `PUT /api/products/:id` | P0 | 更新 + 部分更新 |
| `DELETE /api/products/:id` | P0 | 删除 + 软删除 + 不存在 |
| `POST /api/auth/login` | P0 | 成功 + 密码错误 + 邮箱不存在 |
| `POST /api/auth/register` | P0 | 成功 + 邮箱重复 |
| `GET /api/orders` | P0 | 列表 + 状态筛选 |
| `POST /api/orders/:id/status` | P0 | 状态流转 + 非法流转拒绝 |
| `POST /api/cart` | P0 | 加购 + 更新 + 清空 |

**编写规范**:
```typescript
describe('POST /api/products', () => {
  it('创建产品成功应返回 201 + 产品数据', async () => { ... });
  it('SKU 重复应返回 409', async () => { ... });
  it('缺少必填字段应返回 422', async () => { ... });
});
```

### 2.4 E2E 测试 (End-to-End Tests) — 占比 5%

**目标**: 覆盖关键业务路径

**工具**: `Playwright` + `MSW` (Mock Service Worker)

**覆盖路径**:

| 路径 | 优先级 | 场景描述 |
|------|--------|----------|
| **用户注册 → 登录 → 浏览 → 购物车 → 结账** | P0 | 完整购物流程 |
| **产品搜索 → 筛选 → 详情 → 收藏** | P0 | 产品发现流程 |
| **后台登录 → 产品管理 → 订单处理** | P0 | 管理后台流程 |
| **多语言切换 → 浏览 → 购物车** | P1 | 国际化流程 |
| **响应式: 手机端汉堡菜单 → 浏览 → 购买** | P1 | 移动端流程 |
| **订单状态流转: 创建 → 发货 → 完成** | P1 | 订单全生命周期 |

**文件夹结构**:
```
e2e/
├── fixtures/
│   ├── auth.setup.ts       # 认证状态预置
│   └── products.setup.ts   # 产品数据预置
├── specs/
│   ├── checkout.spec.ts    # 购物结账流程
│   ├── search.spec.ts      # 搜索筛选流程
│   ├── admin.spec.ts       # 后台管理流程
│   └── i18n.spec.ts        # 国际化流程
├── helpers/
│   └── api.ts              # E2E 辅助函数
└── playwright.config.ts    # Playwright 配置
```

---

## 三、覆盖率目标 (Coverage Targets)

### 3.1 分模块目标

| 模块 | 语句 | 分支 | 函数 | 行 | 优先级 |
|------|------|------|------|-----|--------|
| **Services** | ≥ 90% | ≥ 80% | ≥ 90% | ≥ 90% | P0 |
| **DB Schema** | ≥ 80% | — | — | ≥ 80% | P0 |
| **DB 连接** | ≥ 80% | ≥ 80% | ≥ 100% | ≥ 80% | P0 |
| **工具函数** | ≥ 95% | ≥ 90% | ≥ 100% | ≥ 95% | P0 |
| **Zod Schema** | ≥ 100% | ≥ 100% | ≥ 100% | ≥ 100% | P0 |
| **API 路由** | ≥ 80% | ≥ 75% | ≥ 80% | ≥ 80% | P1 |
| **UI 组件** | ≥ 60% | ≥ 50% | ≥ 60% | ≥ 60% | P1 |
| **页面组件** | ≥ 30% | ≥ 25% | ≥ 30% | ≥ 30% | P2 |

### 3.2 整体目标

| 指标 | 当前 | 短期目标 (v1.0) | 长期目标 (v2.0) |
|------|------|-----------------|-----------------|
| **语句覆盖率** | 66.31% | **≥ 70%** | **≥ 80%** |
| **分支覆盖率** | 56.68% | **≥ 65%** | **≥ 75%** |
| **函数覆盖率** | 33.91% | **≥ 50%** | **≥ 70%** |
| **行覆盖率** | 66.85% | **≥ 70%** | **≥ 80%** |
| **测试总数** | 54 | **≥ 200** | **≥ 500** |

---

## 四、测试比例与数量规划

### 4.1 各类型比例

```
单元测试      70%  ########################################
组件测试      15%  #########
集成测试      10%  ######
E2E 测试       5%  ###
```

### 4.2 各阶段数量目标

| 阶段 | 单元测试 | 组件测试 | 集成测试 | E2E 测试 | 总计 |
|------|---------|---------|---------|---------|------|
| **当前** | 54 | 0 | 0 | 0 | 54 |
| **v1.0 短期** | 140 | 30 | 20 | 10 | 200 |
| **v1.5 中期** | 280 | 60 | 40 | 20 | 400 |
| **v2.0 长期** | 350 | 75 | 50 | 25 | 500 |

---

## 五、质量门禁 (Quality Gate)

### 5.1 提交前门禁 (Pre-commit Gate)

在 `package.json` 中配置：

```json
{
  "scripts": {
    "validate": "pnpm dlx concurrently --group --names lint-tsc,lint-build,lint-style,test \"pnpm ts-check\" \"pnpm lint:build\" \"pnpm lint:style\" \"pnpm test\"",
    "gate:commit": "pnpm validate",
    "gate:deploy": "pnpm test:coverage && pnpm test:e2e"
  }
}
```

**门禁规则**:

```
┌─────────────────────────────────────────────────────┐
│                    Pre-commit Gate                    │
│                                                       │
│  1. pnpm ts-check        → ❌ 不允许任何 TS 错误       │
│  2. pnpm lint:build      → ❌ 不允许任何 ESLint 错误    │
│  3. pnpm lint:style      → ❌ 不允许任何 Stylelint 错误 │
│  4. pnpm test            → ✅ 100% 通过                │
│                                                       │
│  全部通过 → ✅ 允许提交                                │
│  任一失败 → ❌ 禁止提交                                │
└─────────────────────────────────────────────────────┘
```

### 5.2 合并请求门禁 (PR Gate)

```
┌─────────────────────────────────────────────────────┐
│                    PR Merge Gate                      │
│                                                       │
│  🔴 必须通过:                                          │
│  ├─ ts-check: 零错误                                  │
│  ├─ lint: 零错误                                      │
│  ├─ test: 100% 通过                                   │
│  ├─ 新增代码覆盖率 ≥ 80%                              │
│  └─ 未引入新的覆盖率下降                               │
│                                                       │
│  🟡 警告但不阻塞:                                      │
│  ├─ 总覆盖率下降 ≥ 2%                                 │
│  └─ 测试文件缺失                                      │
│                                                       │
│  全部通过 → ✅ 允许合并                                │
│  任一 Red → ❌ 阻塞合并                                │
└─────────────────────────────────────────────────────┘
```

### 5.3 部署门禁 (Deploy Gate)

```
┌─────────────────────────────────────────────────────┐
│                    Deploy Gate                        │
│                                                       │
│  🔴 必须通过:                                          │
│  ├─ 所有 PR Gate 条件                                 │
│  ├─ 总覆盖率 ≥ 70% (短期) / ≥ 80% (长期)              │
│  ├─ E2E 关键路径 100% 通过                             │
│  └─ 无 P0/P1 级 Bug                                  │
│                                                       │
│  全部通过 → ✅ 允许部署                                │
│  任一失败 → ❌ 阻塞部署                                │
└─────────────────────────────────────────────────────┘
```

---

## 六、CI/CD 流水线

```yaml
# .github/workflows/test.yml
name: Test & Quality Gate
on: [push, pull_request]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'pnpm'

      - run: pnpm install

      # 静态检查
      - name: TypeScript Check
        run: pnpm ts-check
      - name: ESLint
        run: pnpm lint:build
      - name: Stylelint
        run: pnpm lint:style

      # 测试
      - name: Unit & Integration Tests
        run: pnpm test:coverage
      - name: Upload Coverage
        uses: codecov/codecov-action@v5
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

      # E2E
      - name: E2E Tests
        run: pnpm test:e2e

      # 覆盖率检查
      - name: Coverage Gate
        run: |
          # 检查覆盖率是否达标
          total=$(npx vitest run --coverage | grep "All files" | awk '{print $4}')
          if [ "$(echo "$total >= 70" | bc)" -eq 1 ]; then
            echo "✅ 覆盖率达标: $total%"
          else
            echo "❌ 覆盖率不达标: $total% < 70%"
            exit 1
          fi
```

---

## 七、基础设施与工具链

### 7.1 当前已有

| 工具 | 用途 | 已配置 |
|------|------|--------|
| **Vitest** | 测试运行器 | ✅ |
| **@testing-library/react** | 组件测试 | ✅ |
| **@testing-library/jest-dom** | DOM 断言 | ✅ |
| **@testing-library/user-event** | 用户交互模拟 | ✅ |
| **MSW** | Mock Service Worker | ✅ |
| **jsdom** | DOM 环境 | ✅ |
| **@vitejs/plugin-react** | Vite React 插件 | ✅ |
| **@vitest/coverage-v8** | 覆盖率报告 | ✅ |

### 7.2 需要补充

| 工具 | 用途 | 优先级 |
|------|------|--------|
| **Playwright** | E2E 测试 | P0 |
| **Supertest** | HTTP 集成测试 | P1 |
| **Husky** | Git hooks (pre-commit) | P1 |
| **lint-staged** | 仅对暂存文件运行 lint | P1 |
| **Codecov** | 覆盖率报告可视化 | P2 |
| **GitHub Actions** | CI/CD 流水线 | P0 |

### 7.3 安装命令

```bash
# E2E 测试
pnpm add -D @playwright/test
pnpm dlx playwright install chromium

# 集成测试
pnpm add -D supertest @types/supertest

# Git hooks
pnpm add -D husky lint-staged
pnpm dlx husky init
echo "pnpm validate" > .husky/pre-commit
```

---

## 八、Mock 策略

### 8.1 分层 Mock 体系

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mock 策略体系                              │
│                                                                   │
│  单元测试         链式调用 Mock (vi.mock + Proxy)                   │
│                  → 模拟 db 对象，返回预定数据                      │
│                  → 模拟 bcrypt 等外部依赖                          │
│                                                                   │
│  组件测试         MSW (Mock Service Worker)                       │
│                  → 模拟 API 请求响应                               │
│                  → 验证组件在不同数据状态下的渲染                  │
│                                                                   │
│  集成测试         MSW + 真实 Service 实例                         │
│                  → 模拟下游依赖 (支付/物流)                       │
│                  → 真实路由 + 真实 Controller                     │
│                                                                   │
│  E2E 测试         MSW (可选，用于支付/第三方)                     │
│                  → 端到端真实用户操作                              │
│                  → 关键路径使用真实数据库                          │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 链式调用 Mock 模板

```typescript
// src/__tests__/unit/helpers/mock-db.ts
import { vi } from 'vitest';

export function createMockDb() {
  const defaultInsertReturn = [{ id: 1 }];
  const defaultSelectReturn: any[] = [];

  const mockDb = {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve(defaultInsertReturn)),
      })),
    })),
    select: vi.fn(() => createChainMock(defaultSelectReturn)),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve(defaultInsertReturn)),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve(defaultInsertReturn)),
      })),
    })),
  };

  return mockDb;
}
```

---

## 九、测试数据管理

### 9.1 工厂模式

```typescript
// src/__tests__/factories/product.factory.ts
export function buildProduct(overrides = {}) {
  return {
    id: 1,
    sku: `SKU-${Date.now()}`,
    price: '99.99',
    quantity: 100,
    status: true,
    sortOrder: 0,
    brandId: 1,
    descriptions: {
      zh_cn: { name: '测试产品', description: '测试描述' },
      en: { name: 'Test Product', description: 'Test description' },
    },
    images: [],
    ...overrides,
  };
}

export function buildProductList(count: number) {
  return Array.from({ length: count }, (_, i) => buildProduct({ id: i + 1 }));
}
```

### 9.2 数据隔离

- 每个测试用例使用独立的数据
- 测试间不共享状态
- 使用 `beforeEach` 重置 Mock
- 避免测试间的时序依赖

---

## 十、最佳实践清单

### 10.1 通用规则

- [ ] 每个测试只测一个行为（Single Responsibility）
- [ ] 测试命名使用中文描述业务场景（`应能...` / `当...时应...`）
- [ ] 遵循 AAA 模式：Arrange → Act → Assert
- [ ] 不测试框架/库本身的行为
- [ ] 不测试私有方法（通过公有方法间接测试）
- [ ] 避免 Mock 过度（Mock 边界，测试内部）
- [ ] 快照测试仅在必要时使用（UI 组件）

### 10.2 服务层测试规则

- [ ] Mock 数据库层，测试业务逻辑
- [ ] 覆盖所有公有方法
- [ ] 每个方法至少 1 个 happy path + 1 个 error case
- [ ] 覆盖边界条件（空数据、极限值、重复值）
- [ ] 状态机测试：验证所有合法流转 + 非法流转拒绝

### 10.3 组件测试规则

- [ ] 使用 `@testing-library/user-event` 模拟用户交互
- [ ] 优先测试用户可见行为（渲染/交互）
- [ ] 避免测试实现细节（内部状态/DOM 结构）
- [ ] 测试无障碍（aria-label、role）

### 10.4 API 测试规则

- [ ] 测试 HTTP 状态码（200/201/400/401/404/409/422/500）
- [ ] 测试响应体结构
- [ ] 测试错误消息内容
- [ ] 测试认证与权限

### 10.5 E2E 测试规则

- [ ] 覆盖核心用户旅程（Happy Path）
- [ ] 使用 Page Object 模式
- [ ] 避免测试静态页面（那是集成测试的职责）
- [ ] 保持测试数量少而精（关键路径 > 边缘场景）

---

## 十一、红线与降级策略

### 11.1 红线 (Red Lines)

| 规则 | 严重级别 | 说明 |
|------|---------|------|
| 不允许有 `any` 类型绕过 | 🔴 阻塞 | 禁止 `as any` 或 `// @ts-ignore` 跳过测试 |
| 不允许 Mock 真实 HTTP 请求 | 🔴 阻塞 | 必须使用 MSW 或 vi.mock |
| 不允许测试间共享可变状态 | 🔴 阻塞 | 每个测试用例必须独立 |
| 不允许跳过失败测试 | 🔴 阻塞 | 禁止 `test.skip` 或 `xit` |
| 不允许覆盖 < 70% 部署 | 🔴 阻塞 | 低于阈值禁止部署 |

### 11.2 降级策略

| 场景 | 处理方式 |
|------|----------|
| 紧急修复需要跳过测试 | 需团队审批 + 48 小时内补测 |
| 覆盖率暂时下降 | 记录 TODO + 下个迭代修复 |
| 第三方依赖不稳定 | 使用 MSW 模拟 + 标记集成测试为可选 |
| E2E 环境不可用 | 回退到集成测试覆盖关键路径 |

---

## 十二、监控与度量

### 12.1 持续追踪指标

- 测试通过率（目标: 100%）
- 测试覆盖率（目标: 持续上升）
- 测试执行时间（目标: 单次 < 5 分钟）
- 测试与代码行数比（目标: 1:3 ~ 1:5）
- 失败测试修复时间（目标: < 2 小时）

### 12.2 报告

```bash
# 生成覆盖率报告
pnpm test:coverage
# 输出: coverage/index.html (可视化报告)
# 输出: coverage/coverage-summary.json (机器可读数据)

# 生成 JUnit 格式报告（CI 集成）
pnpm test -- --reporter=junit --outputFile=test-results.xml
```