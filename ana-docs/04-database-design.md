# 数据库设计

## 技术选型

- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM (0.45.1) + drizzle-zod (自动 Zod 校验)
- **迁移**: Drizzle Kit (3 次迁移)
- **连接池**: pg Pool (max: 20, idleTimeout: 30s)
- **Schema 位置**: `src/lib/db/schema/index.ts`

## 数据库表总览

### 商品体系 (7 张表)

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `brands` | 品牌 | name, logo, description, website, sortOrder, status |
| `categories` | 分类 (支持多级) | parentId (自引用), image, sortOrder, status |
| `category_descriptions` | 分类多语言描述 | categoryId (FK), locale, name, description, meta* |
| `category_paths` | 分类层级路径 | categoryId, pathId, level |
| `attribute_groups` | 属性组 | sortOrder |
| `attribute_group_descriptions` | 属性组多语言 | attributeGroupId (FK), locale, name |
| `attributes` | 属性定义 | attributeGroupId (FK), sortOrder |
| `attribute_descriptions` | 属性多语言 | attributeId (FK), locale, name |
| `attribute_values` | 属性值 | attributeId (FK), sortOrder |
| `attribute_value_descriptions` | 属性值多语言 | attributeValueId (FK), locale, name |
| `products` | 商品主表 | sku, brandId (FK), price, costPrice, weight, status, quantity, sales |
| `product_descriptions` | 商品多语言描述 | productId (FK), locale, name, description, meta* |
| `product_categories` | 商品-分类关联 | productId (FK), categoryId (FK) |
| `product_images` | 商品图片 | productId (FK), image, sortOrder |
| `product_skus` | 商品 SKU 变体 | productId (FK), sku, price, quantity, attributes (JSONB) |

### 订单体系 (4 张表)

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `orders` | 订单主表 | orderNumber, customerId (FK), status, totalAmount, shippingAddress (JSONB) |
| `order_products` | 订单商品快照 | orderId (FK), productId, name, price, quantity |
| `order_history` | 订单状态历史 | orderId (FK), status, comment |
| `order_totals` | 订单金额明细 | orderId (FK), code, title, value |

### 用户体系 (3 张表)

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `customers` | 客户 | email (unique), password (bcrypt), name, phone, status |
| `customer_addresses` | 收货地址 | customerId (FK), name, address1, city, country, postcode, isDefault |
| `customer_groups` | 客户分组 | name, description, discount |
| `customer_group_descriptions` | 分组多语言 | customerGroupId (FK), locale, name |

### 其他模块

| 表名 | 说明 |
|------|------|
| `reviews` | 商品评价 (productId, customerId, rating, content) |
| `rmas` | 退换货申请 (orderId, type, reason, status) |
| `wishlists` | 收藏夹 (customerId, productId) |
| `pages` / `page_descriptions` | 文章/页面 (CMS) |
| `page_categories` / `page_category_descriptions` | 文章分类 |
| `languages` | 语言配置 |
| `currencies` | 货币配置 |
| `countries` / `zones` | 国家/地区 |
| `settings` | 系统设置 (key-value) |
| `shipping_methods` / `shipping_method_descriptions` | 配送方式 |
| `admin_users` | 管理员账号 |
| `notifications` | 通知 (Polymorphic: notifiableId + notifiableType) |

## 多语言设计模式

项目采用 **描述表分离模式** 实现多语言：

```
主表 (products)          描述表 (product_descriptions)
├── id                   ├── id
├── sku                  ├── productId (FK)
├── price                ├── locale  ← 语言标识
├── quantity             ├── name
└── status               ├── description
                         ├── metaTitle
                         ├── metaDescription
                         └── metaKeywords
```

- 主表存储与语言无关的字段 (价格、库存、状态等)
- 描述表存储与语言相关的字段 (名称、描述、SEO 信息)
- 通过 `(entityId, locale)` 唯一索引确保每种语言只有一条描述

## 关键设计特点

1. **软删除**: 未采用，使用 `status: boolean` 控制启用/禁用
2. **时间戳**: 所有表包含 `createdAt` / `updatedAt`
3. **排序**: 大多数表包含 `sortOrder` 字段
4. **JSONB**: 订单地址 (`shippingAddress`)、SKU 属性 (`attributes`) 使用 JSONB
5. **级联删除**: 描述表通过 `onDelete: 'cascade'` 随主表删除
6. **索引策略**: 唯一索引用于 locale 约束，普通索引用于外键和常用查询
