# 架构审查结论复核报告

> 复核日期: 2026-07-30
> 复核方式: 逐项验证原始报告中的关键发现，补充遗漏

---

## 复核方法

对 `10-architecture-review.md` 中的每个关键结论，通过 `grep`、文件读取、精确计数等方式验证其准确性。

---

## 一、P0 发现复核

### P0-1: API 写操作无鉴权 — ✅ 确认，实际情况更严重

**原始结论**: POST /api/products、/api/orders 等任何人可调用。

**复核结果**: 通过 `grep -rn "withMiddleware|withAuth|withRateLimit" src/app/api/` 验证：

**唯一使用了鉴权中间件的路由**:
```
src/app/api/auth/route.ts — withRateLimit (仅限流，非鉴权)
```

**全部 30 个 API route 文件中**，除 `auth/route.ts` 使用 `withRateLimit` 外，其余 29 个均无任何中间件包装。

**补充发现 — 比原始报告更严重**:

| 路由 | 问题 | 原始报告是否提及 |
|------|------|------------------|
| `GET /api/customers?admin=true` | 返回全部客户数据（含邮箱），无鉴权 | ❌ 遗漏 |
| `POST /api/cart` | 任何人可向任意 customerId 的购物车添加商品 | ❌ 遗漏 |
| `DELETE /api/cart/:id` | 任何人可删除他人购物车商品 | ❌ 遗漏 |
| `GET /api/customers/wishlist` | 任何人可查看任意用户的收藏夹 | ❌ 遗漏 |
| `GET /api/notifications` | 任何人可查看任意用户通知 | ❌ 遗漏 |

**结论**: 原始报告 P0-1 结论正确但**低估了严重性**。不仅是写操作，部分 GET 操作也存在数据泄露风险。

**额外发现 — auth/me 的第三种鉴权模式**:
```typescript
// src/app/api/auth/me/route.ts
const user = await authenticate(request);
requireAuth(user);  // 直接调用，未使用 withMiddleware
```
这是继 `withMiddleware` / `withRateLimit` / 无保护 之后的**第三种鉴权模式**，进一步佐证了原始报告中"鉴权方式不一致"的结论。

---

### P0-2: JWT 密钥硬编码 — ✅ 确认

**验证**:
```typescript
// src/lib/auth.ts:4
process.env.JWT_SECRET || 'nodecoda-jwt-secret-change-in-production'
```

结论完全准确。生产环境如果未配置 `JWT_SECRET`，攻击者可用默认密钥伪造任意用户 token。

---

### P0-3: 订单创建无事务保护 — ✅ 确认

**验证**: `grep -n "transaction" src/lib/services/order.service.ts` → 无结果

`OrderService.create()` 中依次执行：
1. 查询购物车
2. 计算总价
3. 插入 orders 表
4. 插入 orderProducts 表
5. 清空 carts 表

任何步骤失败都会导致数据不一致。结论准确。

---

### P0-4: 库存扣减无并发控制 — ✅ 确认

**验证**: `grep -n "FOR UPDATE\|version\|optimistic" src/lib/services/order.service.ts` → 无结果

订单创建时直接读取 `item.products?.quantity`，未做任何并发保护。结论准确。

---

## 二、P1 发现复核

### P1: 首页 CSR 白屏 — ✅ 确认

**验证**: `head -1 src/app/[locale]/(shop)/page.tsx` → `'use client'`

不仅是首页，商品列表页 (`products/page.tsx`) 同样是 `'use client'`。核心浏览路径全部 CSR。

---

### P1: middleware locale 不一致 — ✅ 确认

**验证**:
```typescript
// src/middleware.ts:4
const locales = ['zh', 'en'];  // 只有 2 种

// src/i18n/config.ts
export const locales: Locale[] = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'ar', 'th'];
// 11 种语言
```

用户访问 `/ja/products` 时，middleware 不会重定向（因为 `pathnameHasLocale` 检查会匹配），但 middleware 的默认重定向只会跳到 `/zh`，无法跳到用户偏好的语言。结论准确。

---

### P1: `as any` 计数 — ⚠️ 微小修正

**原始报告**: 6 处
**实际计数**: 7 处

| 位置 | 代码 |
|------|------|
| `customer.service.ts:204` | `(result as any).rowCount` |
| `customer.service.ts:234` | `(result as any).rowCount` |
| `product.service.ts:194` | `... as any` |
| `product.service.ts:195` | `... as any` |
| `cart.service.ts:32` | `undefined as any` |
| `brand.service.ts:117` | `(result as any).rowCount` |
| `auth/me/route.ts:17` | `(error as any).status` |

**修正**: 原始报告统计了 `src/lib/` 下的 6 处，遗漏了 `src/app/api/auth/me/route.ts` 中的 1 处。总计 **7 处**。

---

### P1: 购物车查询无分页 — ✅ 确认

**验证**: `CartService.getCart()` 执行 4 表 JOIN（carts + products + productDescriptions + productImages），无 `limit` / `offset`。结论准确。

---

### P1: 订单列表无分页 — ✅ 确认

**验证**:
```typescript
async getAll() {
  const rows = await db.select()
    .from(orders)
    .orderBy(orders.createdAt);
  return rows;  // 无分页
}
```
结论准确。

---

## 三、遗漏发现补充

### 遗漏 1: `auth/me` 错误处理中的类型断言

```typescript
// src/app/api/auth/me/route.ts:17
return NextResponse.json(
  { error: error.message },
  { status: (error as any).status }  // 使用 as any 访问 AuthError.status
);
```

`AuthError` 类已定义 `status` 属性，应使用类型收窄而非 `as any`：
```typescript
if (error instanceof AuthError) {
  return NextResponse.json({ error: error.message }, { status: error.status });
}
```

### 遗漏 2: 购物车 API 的 customerId 参数无鉴权校验

```typescript
// src/app/api/cart/route.ts
const customerId = Number(searchParams.get('customerId'));
const items = await CartService.getCart(customerId, locale);
// ⚠️ 任何人都可以通过传入任意 customerId 查看他人的购物车
```

这是一个**水平越权 (IDOR)** 漏洞，比原始报告中提到的"无鉴权"更具体。

### 遗漏 3: 客户数据泄露

```typescript
// src/app/api/customers/route.ts
if (searchParams.get('admin') === 'true') {
  const all = await CustomerService.findAll();
  return NextResponse.json(all);  // 返回所有客户数据
}
```

`GET /api/customers?admin=true` 无需任何鉴权即可返回全部客户列表。如果 `CustomerService.findAll()` 返回了密码哈希，则为严重数据泄露。

### 遗漏 4: OrderService.create 中 locale 硬编码

```typescript
// src/lib/services/order.service.ts
leftJoin(productDescriptions, and(
  eq(products.id, productDescriptions.productId),
  eq(productDescriptions.locale, 'zh_cn')  // ⚠️ 硬编码中文
))
```

订单创建时商品名称固定取中文，英文用户下单后订单商品名仍为中文。

### 遗漏 5: 订单号生成使用 Math.random

```typescript
// src/lib/services/order.service.ts
function generateOrderNumber(): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${y}${m}${d}-${rand}`;
}
```

`Math.random()` 不是密码学安全的随机数，理论上存在订单号碰撞风险。应使用 `crypto.randomUUID()` 或 `crypto.randomBytes()`。

---

## 四、原始报告评分修正

| 维度 | 原始评分 | 修正评分 | 理由 |
|------|----------|----------|------|
| 安全实现 | 4/10 | **3/10** | 遗漏了 IDOR 漏洞和客户数据泄露 |
| 架构设计 | 7/10 | 7/10 | 无修正 |
| 可维护性 | 6/10 | 6/10 | 无修正 |
| 测试覆盖 | 5/10 | 5/10 | 无修正 |

---

## 五、结论

原始架构审查报告的 **核心结论全部准确**，P0/P1/P2 分级合理。

**修正项**:
1. P0-1 严重性被低估 — 实际存在 IDOR 和数据泄露
2. `as any` 计数从 6 修正为 7
3. 补充 5 项遗漏发现（IDOR、客户数据泄露、locale 硬编码、Math.random、类型断言）

**修正后最高优先级建议**:
1. ~~为所有 API 添加 `withMiddleware` 鉴权~~ → 更准确地说：**修复所有 IDOR 漏洞 + 添加鉴权中间件**
2. JWT 密钥强制环境变量
3. 订单事务保护
4. 库存并发控制
