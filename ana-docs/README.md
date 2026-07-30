# NodeCoda 架构分析

> 本文档基于对项目源码（Schema + Service + API）的全面分析，以形式化方式描述系统的 ER、操作、依赖关系和业务规则，作为后续开发、测试和架构改进的**唯一真相源**。

## 文件清单

| 文件 | 内容 | 页数 |
|------|------|------|
| [01-er.md](./01-er.md) | 实体关系图 — 46 张表的完整定义与关系 | 46 实体 |
| [02-operations.md](./02-operations.md) | 操作矩阵 — 每个实体的 CRUD + 业务操作 | 60+ 操作 |
| [03-dependencies.md](./03-dependencies.md) | 依赖关系 — 拓扑排序 + 状态机 + 业务规则 | 6 层 |

## 项目规模

| 维度 | 数值 |
|------|------|
| 数据表 | 46 张 |
| 模块 | 18 个业务模块 |
| 操作 | 60+ 个业务操作 |
| API 路由 | 21 个端点 |
| Service 文件 | 15 个 |
| 状态机 | 3 个 (Order / RMA / Payment) |
| 测试 | 110 个 (84 单元 + 15 集成 + 11 组件) |
| 语言 | 11 种 |
| 货币 | 6 种 |

## 模块拓扑分层

```
Layer 0: 独立基础   →  Settings, Brand, Language, Currency, Country, Zone,
                      AdminUser, CustomerGroup, AttributeGroup, PageCategory,
                      Page, ShippingMethod, TaxClass, Notification

Layer 1: 基础数据   →  Attribute, TaxRate, TaxRule, Category,
                      Customer, ShippingMethodDescr, PageDescr, CategoryDescr

Layer 2: 产品体系   →  Product, ProductSku, ProductImage, ProductCategory,
                      ProductAttribute, ProductRelation, AttributeValue,
                      CustomerAddress, CustomerWishlist, Cart, CategoryPath

Layer 3: 交易体系   →  Order, OrderProduct, OrderHistory, OrderTotal,
                      OrderShipment, OrderPayment, Payment

Layer 4: 售后体系   →  RMA, Review
```

## 可用作

1. **开发指南** — 新功能开发时，按拓扑层顺序推进
2. **测试覆盖分析** — 对比操作矩阵，检查每个操作是否有对应测试
3. **回归检测** — 修改某一层时，检查所有依赖它的上层是否受影响
4. **新人上手** — 从 Layer 0 开始逐层深入，降低认知负荷