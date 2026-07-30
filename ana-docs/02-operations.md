# 操作矩阵 (Operations)

## 约定

每条操作记录为：
```
操作名: 输入 → 前置条件 → 后置条件 → 副作用
```

## 产品体系

### Product

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| list | locale, page, sort, categoryId, brandId | — | 返回分页产品列表 |
| detail | productId, locale | 产品存在 | 返回产品 + 描述 + 品牌 + 分类 |
| create | sku, price, status, descriptions[], brandId, categoryIds | SKU 唯一 | 产品创建 + 描述创建 + 分类关联 |
| update | productId, 字段 | 产品存在 | 产品更新 + 描述更新 |
| delete | productId | 产品存在 | 产品 + 描述 + 关联删除 |
| listByCategory | categoryId, locale, page | 分类存在 | 返回该分类下产品 |
| listByBrand | brandId, locale, page | 品牌存在 | 返回该品牌下产品 |

### Brand

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| list | locale | — | 品牌列表 |
| create | name, logo, status, sortOrder | 名称唯一 | 品牌创建 |
| detail | brandId | 品牌存在 | 品牌详情 |
| update | brandId, 字段 | 品牌存在 | 品牌更新 |
| delete | brandId | 无关联产品 | 品牌删除 |

### Category

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| list | locale | — | 分类树（含路径） |
| create | name, slug, parentId, image | parentId 存在（或 null） | 分类 + 路径创建 |
| detail | categoryId, locale | 分类存在 | 分类详情 |
| update | categoryId, 字段 | 分类存在 | 分类更新 |
| delete | categoryId | 无子分类 + 无关联产品 | 分类 + 路径删除 |

### Attribute

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| listGroups | — | — | 属性组树（含属性→属性值） |
| createGroup | name, sortOrder | 名称唯一 | 属性组创建 |
| updateGroup | groupId, 字段 | 属性组存在 | 属性组更新 |
| deleteGroup | groupId | 无关联属性 | 属性组删除 |
| createAttr | groupId, name, type | 属性组存在 | 属性创建 |
| updateAttr | attrId, 字段 | 属性存在 | 属性更新 |
| deleteAttr | attrId | 无关联属性值 | 属性删除 |
| createValue | attrId, name, value | 属性存在 | 属性值创建 |
| updateValue | valueId, 字段 | 属性值存在 | 属性值更新 |
| deleteValue | valueId | 无关联产品 | 属性值删除 |

## 客户体系

### Customer

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| register | email, password, name | 邮箱唯一 | 客户创建 + 返回 JWT |
| login | email, password | 客户存在 + 密码正确 | 返回 JWT + 更新 lastLogin |
| list | page, pageSize | 管理员 | 客户分页列表 |
| detail | customerId | 客户存在 | 客户详情 |
| updateProfile | customerId, name, phone, avatar | 客户存在 | 客户信息更新 |
| block | customerId | 客户存在 | status = false |
| addAddress | customerId, 地址字段 | 客户存在 | 地址创建 |
| getAddresses | customerId | 客户存在 | 地址列表 |
| deleteAddress | customerId, addressId | 地址存在 | 地址删除 |
| addToWishlist | customerId, productId | 产品存在 + 未收藏 | 收藏创建 |
| removeFromWishlist | customerId, productId | 已收藏 | 收藏删除 |
| getWishlist | customerId | — | 收藏列表 |

### CustomerGroup

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| list | — | — | 分组列表 |
| create | name, discount, description | 名称唯一 | 分组创建 |
| update | groupId, 字段 | 分组存在 | 分组更新 |
| delete | groupId | 无关联客户 | 分组删除 |

## 交易体系

### Cart

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| list | customerId | 客户存在 | 购物车列表（含产品信息） |
| addItem | customerId, productId, skuId, quantity | 产品存在 + 库存充足 | 购物车项创建/数量更新 |
| updateQty | customerId, itemId, quantity | 购物车项存在 + 库存充足 | 数量更新 |
| removeItem | customerId, itemId | 购物车项存在 | 购物车项删除 |
| clear | customerId | — | 购物车清空 |

### Order

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| create | customerId, items[], shippingMethodId, addressId | 购物车非空 + 库存充足 + 地址有效 | 订单创建 + 库存扣减 + 购物车清空 |
| list | customerId, status, page, pageSize | — | 订单分页列表 |
| detail | orderId | 订单存在 | 订单 + 商品 + 历史 + 配送 |
| listAll | status, page, pageSize | 管理员 | 全量订单列表 |
| updateStatus | orderId, newStatus | 状态转换合法 | 状态更新 + 历史记录 |
| cancel | orderId | status ∈ [pending, confirmed] | status = cancelled + 库存恢复 |
| ship | orderId, trackingNo, carrier | status = paid | status = shipped + 发货记录 |
| complete | orderId | status = shipped | status = completed |
| refund | orderId | status ∈ [paid, shipped] | paymentStatus = refunded |

### OrderProduct

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| 跟随 Order 创建 | orderId, items[] | 订单创建中 | 明细创建 |

### OrderHistory

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| 跟随 Order 状态变更 | orderId, fromStatus, toStatus, operator | 状态变更时 | 历史记录创建 |

### Payment

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| create | orderId, method | 订单存在 + 未支付 | 支付记录创建 |
| process | paymentId | 支付记录存在 | 调用网关 |
| callback | paymentId, status | 支付记录存在 | status + paidAt 更新 |
| refund | paymentId, amount | 已支付 | 退款处理 |

## 售后体系

### RMA (退换货)

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| create | customerId, orderProductId, reason, type, quantity | 订单已完成 + 未退货 | RMA 创建 |
| list | customerId, status | — | RMA 列表 |
| listAll | status, page, pageSize | 管理员 | 全量 RMA 列表 |
| approve | rmaId, adminNote | RMA 存在 + status = pending | status = approved |
| reject | rmaId, adminNote | RMA 存在 + status = pending | status = rejected |
| complete | rmaId | RMA 存在 + status = approved | status = completed |

### Review

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| list | productId, page, pageSize | 产品存在 | 评价分页列表 |
| stats | productId | 产品存在 | 平均分 + 分布统计 |
| create | productId, customerId, rating, content | 已购买 + 未评价 | 评价创建 |
| toggle | reviewId | 评价存在 | status 切换 |
| delete | reviewId | 评价存在 | 评价删除 |

## 配送体系

### ShippingMethod

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| list | locale | — | 配送方式列表 |
| detail | methodId, locale | 配送方式存在 | 详情 |
| create | code, baseFee, descriptions[], status | code 唯一 | 配送方式 + 描述创建 |
| update | methodId, 字段 | 配送方式存在 | 配送方式更新 |
| delete | methodId | 无关联订单 | 配送方式删除 |

## 内容体系

### Page (文章/页面)

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| list | locale, status, page, pageSize | — | 文章分页列表 |
| detail | pageId, locale | 文章存在 | 文章详情 |
| create | title, content, meta, locale, status | — | 文章 + 描述创建 |
| update | pageId, 字段 | 文章存在 | 文章更新 |
| delete | pageId | 文章存在 | 文章删除 |

### Notification

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| list | notifiableId, notifiableType, unreadOnly | — | 通知列表 + 未读计数 |
| create | type, data, notifiableId, notifiableType | — | 通知创建 |
| markAsRead | notificationId | 通知存在 | readAt 更新 |
| markAllAsRead | notifiableId, notifiableType | — | 批量已读 |
| delete | notificationId | 通知存在 | 通知删除 |
| deleteOld | days (default 30) | — | 过期通知清理 |

## 系统配置

### Settings

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| getAll | locale | — | 设置分组 |
| get | key, locale | — | 单值 |
| updateAll | settings {}, locale | — | 批量更新 |

### Theme

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| listPresets | — | — | 预设列表 |
| apply | presetName | 预设存在 | 保存到 settings |
| customize | cssVars {} | — | 保存到 settings |

### Tax

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| listClasses | — | — | 税类列表 |
| createClass | name, description | — | 税类创建 |
| createRate | classId, name, rate, type | 税类存在 | 税率创建 |
| createRule | rateId, basedOn, priority | 税率存在 | 税务规则创建 |

## 认证

| 操作 | 输入 | 前置条件 | 后置条件 |
|------|------|----------|----------|
| login | email, password | 客户存在 + 密码正确 | 返回 JWT + 客户信息 |
| register | email, password, name | 邮箱唯一 | 客户创建 + 返回 JWT |
| me | JWT Token | Token 有效 | 返回客户信息 |
| adminLogin | email, password | 管理员存在 + 密码正确 | 返回 JWT (admin role) |
| adminMe | JWT Token | Token 有效 + role=admin | 返回管理员信息 |