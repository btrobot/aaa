# 会话检查点 — 2026-07-31

## 当前状态

| 指标 | 值 | 说明 |
|------|-----|------|
| Commit | `69617d1` | main 分支 |
| TS errors | 146 | Coze 遗留基线，未回归 |
| ESLint errors | 146 | 剩余 `no-explicit-any`，需逐个给准确类型 |
| ESLint warnings | 147 | `exhaustive-deps`(12) + `no-unused-vars`(135) |
| 测试 | 965/965 | 全部通过 |

## 已完成

1. ✅ 18 个模块 spec 合规测试（456 个检查点）
2. ✅ P0 安全加固（IDOR/JWT）
3. ✅ 前端认证架构重构
4. ✅ 错误体系（ServiceError/NotFoundError/BusinessRuleError）
5. ✅ UI/UX P0-P2 修复（品牌标识/面包屑/骨架屏/社交图标/焦点样式/动效）
6. ✅ ESLint 配置修正（排除工具目录 + `_` 前缀惯例）
7. ✅ catch 块 `any` → `unknown` + `instanceof Error` 类型收窄
8. ✅ `useAuth()` Invalid hook call 修复
9. ✅ `page.listCategories` 实现

## 未完成 — 下个会话继续

### 1. ESLint `no-explicit-any`（146 个 errors）

**根因**：Coze 生成的代码大量使用 `any`，丢失了类型信息。

**正确修法**（不是 `_` 前缀，不是批量 `unknown`）：

- **api.ts**（~30 个）：定义 Category/Brand/CartItem/Order/AuthResponse 等接口，替换 `request<any>`
- **admin 页面**（~20 个）：`useState<any[]>` → 具体类型（Product/Order/Page），需要 import 类型
- **test mock**（~40 个）：`createChainMock` 返回值类型需要精确化，不是 `any` 也不是 `unknown`
- **其他**（~50 个）：逐个分析上下文给准确类型

**原则**：每个 `any` 背后都有一个具体的类型，找到它。

### 2. `exhaustive-deps` warnings（12 个）

**根因**：useEffect 依赖缺失，可能导致闭包陷阱。

**正确修法**：
- 函数只在 effect 内用 → 移进 useEffect 内部
- 函数多处用 → `useCallback` 包裹 + 加入 deps
- `user`/`locale` 缺失 → 直接加入 deps（状态变化应触发重载）

### 3. 未使用变量（135 个 warnings）

**根因**：Coze 生成了不需要的代码。

**正确修法**：删掉，不是加 `_`。如果真的需要保留，加注释说明原因。

### 4. TS errors（146 个基线）

**根因**：schema 缺字段（slug/summary）、API 返回类型不匹配。

**正确修法**：补齐 schema 或修正 API 实现，不是 `as any`。

## 禁止的做法

- ❌ 批量 `any` → `unknown`（引入更多类型不兼容）
- ❌ `_` 前缀掩盖未使用变量（隐藏真正问题）
- ❌ `eslint-disable` 注释（绕开而非解决）
- ❌ 一次性改 37 个文件（连锁反应不可控）
