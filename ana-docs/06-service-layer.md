# 服务层 (Service Layer)

## 设计模式

服务层位于 `src/lib/services/`，每个服务对应一个业务领域，职责：
1. **输入校验**: Zod schema 验证请求数据
2. **业务逻辑**: 封装核心业务规则
3. **数据访问**: 通过 Drizzle ORM 操作数据库
4. **类型安全**: 导出 TypeScript 类型供 API 路由使用

## 服务清单

### 1. Product Service (`product.service.ts`)
- 商品 CRUD (创建/读取/更新/删除)
- 多语言描述管理
- 商品分类关联
- 图片管理
- SKU 变体管理
- 搜索/筛选/分页/排序
- Schema: `CreateProductSchema` / `UpdateProductSchema` / `ProductSearchSchema`

### 2. Category Service (`category.service.ts`)
- 分类 CRUD
- 多级分类树 (parentId 自引用)
- 分类路径 (categoryPaths)
- 多语言描述

### 3. Brand Service (`brand.service.ts`)
- 品牌 CRUD
- 多语言描述

### 4. Cart Service (`cart.service.ts`)
- 购物车增删改查
- 商品数量更新
- 清空购物车

### 5. Order Service (`order.service.ts`)
- 订单创建 (从购物车生成)
- 订单状态流转
- 订单历史记录
- 订单金额明细

### 6. Customer Service (`customer.service.ts`)
- 客户信息管理
- 收货地址管理
- 收藏夹 (Wishlist)

### 7. Customer Group Service (`customer-group.service.ts`)
- 客户分组 CRUD
- 分组折扣设置

### 8. Review Service (`review.service.ts`)
- 评价 CRUD
- 评价统计 (平均分/分布)
- 状态管理 (审核)

### 9. RMA Service (`rma.service.ts`)
- 退换货申请
- 状态流转 (pending → approved → completed)
- 管理员备注

### 10. Page Service (`page.service.ts`)
- 文章/页面 CMS
- 多语言内容
- 文章分类

### 11. Shipping Service (`shipping.service.ts`)
- 配送方式管理
- 免邮门槛设置

### 12. Payment Service (`payment.service.ts`)
- 支付处理

### 13. Settings Service (`settings.service.ts`)
- 系统设置 (key-value)
- 多语言设置值

### 14. Attribute Service (`attribute.service.ts`)
- 属性组/属性/属性值 CRUD
- 多语言描述

### 15. Notification Service (`notification.service.ts`)
- 通知 CRUD
- 已读/未读状态
- 批量标记已读

## 服务调用链

```
API Route (route.ts)
    │
    ▼
withMiddleware (鉴权 + 限流)
    │
    ▼
Service (xxx.service.ts)
    │
    ├─ Zod 校验输入
    ├─ 业务逻辑处理
    ▼
Drizzle ORM
    │
    ▼
PostgreSQL
```

## 典型服务示例 (Product Service)

```typescript
// 输入校验
export const CreateProductSchema = z.object({
  sku: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  descriptions: z.record(z.string(), z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  })),
  // ...
});

// 服务函数
export async function searchProducts(params: ProductSearchParams) {
  const validated = ProductSearchSchema.parse(params);
  // Drizzle 查询构建
  const results = await db.select()...
  return results;
}
```
