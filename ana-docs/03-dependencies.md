# 依赖关系与拓扑排序

## 模块依赖矩阵

```
模块                    依赖关系（→ 指向被依赖方）
──────────────────────────────────────────────────────────────────
Product                 → Brand, Category, AttributeGroup
ProductDescription      → Product
ProductSku              → Product
ProductImage            → Product
ProductCategory         → Product, Category
ProductAttribute        → Product, AttributeValue
ProductRelation         → Product (自引用)
Category                → CategoryPath (自引用树)
CategoryDescription     → Category
CategoryPath            → Category (自引用)
Brand                   → (独立)
AttributeGroup          → (独立)
Attribute               → AttributeGroup
AttributeValue          → Attribute
Customer                → CustomerGroup
CustomerAddress         → Customer
CustomerWishlist        → Customer, Product
Cart                    → Customer, Product
Order                   → Customer, ShippingMethod
OrderProduct            → Order, Product, ProductSku
OrderHistory            → Order
OrderTotal              → Order
OrderShipment           → Order
OrderPayment            → Order
Payment                 → Order (内嵌于 orders)
RMA                     → Customer, OrderProduct
Review                  → Customer, Product
Page                    → (独立)
PageDescription         → Page
PageCategory            → (独立)
PageCategoryDescription → PageCategory
ShippingMethod          → (独立)
ShippingMethodDescr     → ShippingMethod
Notification            → (多态: Customer/Order)
TaxClass                → (独立)
TaxRate                 → TaxClass
TaxRule                 → TaxRate
Settings                → (独立)
Language                → (独立)
Currency                → (独立)
Country                 → (独立)
Zone                    → Country
AdminUser               → (独立)
CustomerGroup           → (独立)
```

## 拓扑排序（开发/构建顺序）

### Layer 0：独立基础层
```
无依赖模块
├── Settings
├── Language
├── Currency
├── Country
├── Zone (→ Country)
├── AdminUser
├── CustomerGroup
├── Brand
├── AttributeGroup
├── PageCategory
├── Page
├── ShippingMethod
├── TaxClass
└── Notification
```

### Layer 1：基础数据层
```
依赖 Layer 0 的模块
├── Attribute         → AttributeGroup
├── TaxRate           → TaxClass
├── TaxRule           → TaxRate
├── ShippingMethodDescr → ShippingMethod
├── PageDescription   → Page
├── PageCategoryDescr → PageCategory
├── Category          → (自引用)
├── CategoryDescription → Category
├── CategoryPath      → Category
└── Customer          → CustomerGroup
```

### Layer 2：产品体系层
```
依赖 Layer 0 + Layer 1 的模块
├── Product           → Brand, Category
├── ProductDescription  → Product
├── ProductSku        → Product
├── ProductImage      → Product
├── ProductCategory   → Product, Category
├── ProductAttribute  → Product, AttributeValue
├── ProductRelation   → Product
├── AttributeValue    → Attribute
├── CustomerAddress   → Customer
├── CustomerWishlist  → Customer, Product
└── Cart              → Customer, Product
```

### Layer 3：交易体系层
```
依赖 Layer 2 的模块
├── Order             → Customer, ShippingMethod
├── OrderProduct      → Order, Product, ProductSku
├── OrderHistory      → Order
├── OrderTotal        → Order
├── OrderShipment     → Order
├── OrderPayment      → Order
└── Payment           → Order
```

### Layer 4：售后体系层
```
依赖 Layer 3 的模块
├── RMA               → Customer, OrderProduct
├── Review            → Customer, Product
└── Notification      → Customer, Order (多态)
```

## 依赖拓扑图（DAG）

```
Layer 0     Layer 1       Layer 2        Layer 3        Layer 4
──────────────────────────────────────────────────────────────────
Settings ──┐
Language ──┤
Currency ──┤
Country ───┤
Zone ──────┤
AdminUser ─┤
CustGroup ─┤──────── CustomerAddress ──┐
           │                │          │
Brand ─────┤─────────────── Product ───┤
           │                │  │  │    │
Category ──┤─────────────── ProductCat ┘
           │                │
AttrGroup ─┤── Attribute ──┤── ProductAttr
           │       │       │
           │  AttributeValue ┘
           │
PageCat ───┤── PageCatDescr
           │
Page ──────┤── PageDescr
           │
ShipMethod ┤── ShipMethodDescr
           │
TaxClass ──┤── TaxRate ── TaxRule
           │
Customer ──┤── Cart ─────────────────── Order ────┐
           │                           │  │  │    │
           │                   OrderProduct ┘  │    │
           │                   OrderHistory ───┘    │
           │                   OrderTotal ──────────┘
           │                   OrderShipment
           │                   OrderPayment
           │
           └────────────────── Review ──────────────┘
                               RMA ──────────────────┘
                               Notification ─────────┘
```

## 状态机

### Order 状态机

```
                  ┌─────────────────────────────────────┐
                  │             拒绝操作                  │
                  │  ┌──→ cancelled  ←──┐               │
                  │  │                  │                │
    pending ──→ confirmed ──→ paid ──→ shipped ──→ completed
       │            │          │                      │
       └────×───────┘          │                      │
                               └────────── returned ──┘

合法转换:
  pending    → [confirmed, cancelled]
  confirmed  → [paid, cancelled]
  paid       → [shipped, refunded]
  shipped    → [completed]
  completed  → [returned]
  cancelled  → [×]
  returned   → [×]
  refunded   → [×]

状态说明:
  pending    待确认（初始状态）
  confirmed  已确认 - 库存已扣减
  paid       已支付 - 待发货
  shipped    已发货 - 待收货
  completed  已完成
  cancelled  已取消 - 库存已恢复
  returned   已退货 - 退款处理
  refunded   已退款
```

### RMA 状态机

```
                     ┌──→ approved ──→ completed
  pending ─────→────┤
                     └──→ rejected

合法转换:
  pending    → [approved, rejected]
  approved   → [completed]
  rejected   → [×]
  completed  → [×]

状态说明:
  pending    待审核（初始状态）
  approved   审核通过 - 待处理
  rejected   驳回
  completed  已完成
```

### Payment 状态机

```
  unpaid ──→ paid ──→ refunded

合法转换:
  unpaid    → [paid]
  paid      → [refunded]
  refunded  → [×]

状态说明:
  unpaid    未支付（初始状态）
  paid      已支付
  refunded  已退款
```

## 业务规则汇总

### 产品规则
1. SKU 全局唯一
2. 价格必须 ≥ 0
3. 活跃产品必须至少有一个描述（任一 locale）
4. 产品名称在至少一个 locale 中非空
5. 删除产品时，需检查是否有未完成的订单关联

### 订单规则
1. total = sum(order_items.price * quantity) + shippingFee
2. 订单创建时自动扣减库存
3. 订单取消时自动恢复库存
4. 状态转换必须遵循状态机定义
5. 已支付订单不可取消
6. 已完成订单不可修改

### 客户规则
1. 邮箱全局唯一
2. 密码使用 bcrypt 哈希存储
3. 删除客户时需保留订单历史

### 退换货规则
1. 只能在订单完成后发起退换货
2. 同一商品不可重复退换货
3. 退换货通过后自动恢复库存

### 评价规则
1. 只能评价已购买的商品
2. 同一客户同一商品只能评价一次
3. 评价可被管理员隐藏/显示