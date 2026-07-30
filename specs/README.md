# NodeCoda 形式化规格说明书

## 概述

本目录包含 NodeCoda 电商平台所有业务模块的**形式化规格说明**，采用 YAML 格式描述。

每个规格文件是一个模块的**唯一真相源**，覆盖：
- **实体定义** — 字段、约束、关系
- **操作契约** — 输入/前置条件/后置条件/副作用
- **业务规则** — 不变量、状态机、约束条件
- **错误场景** — 预期的错误码和错误信息

## 模块清单

### Layer 0: 独立基础（无依赖）

| 模块 | 文件 | 状态 | 说明 |
|------|------|------|------|
| Settings | `settings.spec.yaml` | ✅ | 系统设置 KV 存储 |
| Auth | `auth.spec.yaml` | ✅ | JWT 登录/注册/鉴权 |
| Theme | `theme.spec.yaml` | ✅ | 6 套预设 + 自定义 |
| CustomerGroup | `customer-group.spec.yaml` | ✅ | 客户分组 |
| Tax | `tax.spec.yaml` | ✅ | 税务体系（税率类→税率→规则）|
| Shipping | `shipping.spec.yaml` | ✅ | 配送方式（多语言描述）|
| Notification | `notification.spec.yaml` | ✅ | 通知系统（多态）|

### Layer 1: 基础数据

| 模块 | 文件 | 状态 | 说明 |
|------|------|------|------|
| Brand | `brand.spec.yaml` | ✅ | 品牌管理 |
| Category | `category.spec.yaml` | ✅ | 分类体系（含路径）|
| Attribute | `attribute.spec.yaml` | ✅ | 属性体系（组→属性→值）|
| Page | `page.spec.yaml` | ✅ | 文章管理（含分类）|

### Layer 2: 产品体系

| 模块 | 文件 | 状态 | 说明 |
|------|------|------|------|
| Product | `product.spec.yaml` | ✅ | 产品（含SKU/图片/描述/关联）|

### Layer 3: 客户与交易

| 模块 | 文件 | 状态 | 说明 |
|------|------|------|------|
| Customer | `customer.spec.yaml` | ✅ | 客户（含地址/收藏夹）|
| Cart | `cart.spec.yaml` | ✅ | 购物车 |
| Order | `order.spec.yaml` | ✅ | 订单（含商品/历史/总计/发货/支付）|
| Payment | `payment.spec.yaml` | ✅ | 支付（模拟网关）|

### Layer 4: 售后

| 模块 | 文件 | 状态 | 说明 |
|------|------|------|------|
| Review | `review.spec.yaml` | ✅ | 评价系统 |
| RMA | `rma.spec.yaml` | ✅ | 退换货 |

## 规格文件结构

```yaml
module: 模块名
version: '1.0'

entities:
  EntityName:
    table: 表名
    fields:
      fieldName: { type: 类型, required: true/false, default: 值, ... }
    relations:
      relationName: { type: belongs_to/has_many/many_to_many, target: 目标, via: 外键 }
    state_machine:  # 可选
      initial: 初始状态
      transitions:
        - { from: 状态A, to: [状态B, 状态C] }

operations:
  操作名:
    method: GET/POST/PUT/DELETE
    path: /api/路径
    auth: public/required/admin
    input:  { 参数名: 约束 }
    pre:   "前置条件"
    post:  "后置条件"
    effect: "副作用"
    output: { 返回字段 }
    error:
      - { code: 状态码, condition: "触发条件", message: "错误信息" }

rules:
  - "业务规则描述"
```

## 使用方式

1. **开发参考** — 实现新功能时先看规格，确保覆盖所有操作和规则
2. **测试推导** — 从规格自动生成测试用例骨架
3. **回归验证** — 改代码后对照规格检查是否违反业务规则
4. **代码审查** — 审查实现是否与规格一致

## 依赖拓扑

```
Layer 0:  Settings, Auth, Theme, CustomerGroup, Tax, Shipping, Notification
Layer 1:  Brand, Category, Attribute, Page
Layer 2:  Product
Layer 3:  Customer, Cart, Order, Payment
Layer 4:  Review, RMA
```

## 状态机汇总

```
Order:
  pending → confirmed → paid → shipped → completed
     ↓           ↓                           ↓
  cancelled ←───┘                      returned

RMA:
  pending → approved → completed
     ↓           ↓
  rejected ←───┘

Payment:
  unpaid → paid → refunded
```

## 统计

| 维度 | 数量 |
|------|------|
| 模块数 | 18 |
| 实体数 | 46 (含子表) |
| 操作数 | 60+ |
| 业务规则 | 40+ |
| 状态机 | 3 (Order/RMA/Payment) |