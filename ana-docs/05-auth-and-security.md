# 认证与安全

## JWT 认证体系

### 技术选型
- **JWT 库**: jose (6.2.5) — 纯 JS 实现，Edge Runtime 兼容
- **密码加密**: bcryptjs (3.0.3)
- **算法**: HS256
- **有效期**: 7 天
- **Token 名**: `nodecoda_token`

### Token 结构

```typescript
interface AuthPayload extends JWTPayload {
  id: number;        // 用户 ID
  email: string;     // 邮箱
  name: string;      // 姓名
  role: 'customer' | 'admin';  // 角色
}
```

### 认证流程

```
客户端                              服务端
  │                                   │
  ├─ POST /api/auth ─────────────────►│ (login)
  │  { email, password }              │
  │                                   ├─ 查询 customer by email
  │                                   ├─ bcryptjs.compare(password, hash)
  │                                   ├─ signToken(payload)
  │◄──────────────────────────────────┤ { token, user }
  │                                   │
  ├─ GET /api/xxx ───────────────────►│ (authenticated request)
  │  Authorization: Bearer <token>    │
  │  或 Cookie: nodecoda_token=xxx    │
  │                                   ├─ getTokenFromRequest()
  │                                   │  1. 检查 Authorization header
  │                                   │  2. 检查 Cookie
  │                                   ├─ verifyToken(token)
  │                                   ├─ requireAuth(user, roles?)
  │◄──────────────────────────────────┤ response
```

### Token 存储

- **客户端**: localStorage (`nodecoda_token`)
- **传输方式**: 
  - API 调用: `Authorization: Bearer <token>` header
  - SSR: Cookie `nodecoda_token`

## API 中间件 (`withMiddleware`)

所有 API 路由通过统一的高阶函数处理：

```typescript
withMiddleware(handler, {
  auth: true,           // 是否需要登录
  roles: ['admin'],     // 允许的角色
  rateLimit: {          // 速率限制
    maxRequests: 30,
    windowMs: 60000
  }
})
```

### 速率限制
- **实现**: 内存 Map 存储 (非分布式)
- **Key**: `{ip}:{route}`
- **默认**: 60 次/分钟
- **清理**: 每 5 分钟清理过期条目
- **响应**: 429 + `Retry-After` header

### 权限模型

| 角色 | 能力 |
|------|------|
| `customer` | 浏览商品、下单、评价、退换货、个人中心 |
| `admin` | 所有 customer 权限 + 后台管理全部功能 |

## 中间件 (middleware.ts)

Next.js 全局中间件负责：
1. 检测 URL 是否包含 locale 前缀
2. 缺失时重定向到 `/zh/...` (默认中文)
3. 排除路径: `_next`, `api`, `favicon`, `images`, `robots`, `sitemap`

## 安全措施

| 措施 | 实现 |
|------|------|
| 密码加密 | bcryptjs (hash 存储) |
| JWT 签名 | HS256 + 环境变量密钥 |
| 速率限制 | IP + 路由维度限流 |
| 鉴权中间件 | 统一 `withMiddleware` 封装 |
| CORS | `allowedDevOrigins` 配置 |
| robots.txt | 禁止爬取 /api/ /admin/ |
| 输入校验 | Zod schema 验证 |
| SQL 注入防护 | Drizzle ORM 参数化查询 |
