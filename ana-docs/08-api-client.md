# API 客户端 (`src/lib/api.ts`)

## 设计概述

前端所有后端 API 调用统一封装在 `api.ts` 中，提供类型安全的接口。

## 核心函数

### `request<T>(url, options?)`
通用请求封装：
1. 自动附加 `Authorization: Bearer <token>` header (从 localStorage 读取)
2. 统一错误处理 (解析 JSON 错误响应)
3. 返回类型安全的响应数据

### Token 管理
- `getToken()`: 从 localStorage 读取 token
- `setToken(token)`: 存储 token
- 与 `auth.ts` 中的 `storeToken` / `getStoredToken` 功能一致

## API 模块

### `api.products`
```typescript
api.products.list(params?)   // GET /api/products?page=&category=&search=&locale=...
api.products.get(id)         // GET /api/products/:id
api.products.create(data)    // POST /api/products
api.products.update(id, data)// PUT /api/products/:id
api.products.delete(id)      // DELETE /api/products/:id
```

### `api.categories`
```typescript
api.categories.list(locale?) // GET /api/categories?locale=
api.categories.create(data)  // POST /api/categories
api.categories.update(id, data) // PUT /api/categories/:id
api.categories.delete(id)    // DELETE /api/categories/:id
```

### `api.brands`
```typescript
api.brands.list()            // GET /api/brands
api.brands.create(data)      // POST /api/brands
api.brands.update(id, data)  // PUT /api/brands/:id
api.brands.delete(id)        // DELETE /api/brands/:id
```

### `api.cart`
```typescript
api.cart.get(customerId, locale?) // GET /api/cart?customerId=&locale=
api.cart.add(customerId, productId, quantity) // POST /api/cart
api.cart.update(id, quantity) // PUT /api/cart/:id
api.cart.remove(id)          // DELETE /api/cart/:id
api.cart.clear(customerId)   // POST /api/cart/clear
```

### `api.orders`
```typescript
api.orders.list(customerId)  // GET /api/orders?customerId=
api.orders.getAll()          // GET /api/orders?admin=true
api.orders.getById(id)       // GET /api/orders/:id
api.orders.create(customerId, data?) // POST /api/orders
api.orders.updateStatus(id, status) // PUT /api/orders/:id
```

### `api.auth`
```typescript
api.auth.register({ email, password, name, locale? }) // POST /api/auth (action=register)
api.auth.login({ email, password })    // POST /api/auth (action=login)
```

### `api.customers`
```typescript
api.customers.get(id)        // GET /api/customers?id=
api.customers.getAll()       // GET /api/customers?admin=true
api.customers.wishlist(id, locale?) // GET /api/customers/wishlist?id=
api.customers.removeWishlist(customerId, productId) // DELETE /api/customers/wishlist
```

### `api.pages`
```typescript
api.pages.list(params?)      // GET /api/pages?locale=&status=
api.pages.getById(id)        // GET /api/pages/:id
api.pages.create(data)       // POST /api/pages
api.pages.update(id, data)   // PUT /api/pages/:id
api.pages.delete(id)         // DELETE /api/pages/:id
```

### `api.settings`
```typescript
api.settings.getAll(locale?) // GET /api/settings?locale=
api.settings.update({ settings, locale? }) // PUT /api/settings
```

### `api.attributes`
```typescript
api.attributes.list(locale)  // GET /api/attributes?locale=
api.attributes.create(type, data) // POST /api/attributes
api.attributes.update(type, id, data) // PUT /api/attributes
api.attributes.delete(type, id) // DELETE /api/attributes?type=&id=
```

### `api.shipping`
```typescript
api.shipping.list(locale?)   // GET /api/shipping-methods?locale=
```
