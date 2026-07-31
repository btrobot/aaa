import { describe, it, expect, beforeAll } from 'vitest';

const BASE = `http://localhost:${process.env.DEPLOY_RUN_PORT || 5000}`;

async function api(path: string, options?: RequestInit & { token?: string }) {
  const { token, ...fetchOpts } = options ?? {};
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { headers, ...fetchOpts });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

// ── 全局：注册用户 + 获取 token ────────────────────────────────

let customerToken: string;
let customerId: number;
let adminToken: string;

beforeAll(async () => {
  // 注册测试用户
  const testEmail = `integ-${Date.now()}@nodecoda.com`;
  const reg = await api('/api/auth', {
    method: 'POST',
    body: JSON.stringify({
      action: 'register',
      email: testEmail,
      password: 'Test1234!',
      name: '集成测试用户',
    }),
  });
  if (reg.status === 201 && reg.body?.token) {
    customerToken = reg.body.token;
    customerId = reg.body.customer?.id;
  }

  // 登录管理员（种子数据中的 admin）
  const adminLogin = await api('/api/auth', {
    method: 'POST',
    body: JSON.stringify({
      action: 'login',
      email: 'admin@nodecoda.com',
      password: 'admin123',
    }),
  });
  if (adminLogin.status === 200 && adminLogin.body?.token) {
    adminToken = adminLogin.body.token;
  }
});

// ── 公开 API ──────────────────────────────────────────────────

describe('公开 API', () => {
  it('GET /api/products — 返回产品列表', async () => {
    const { status, body } = await api('/api/products?locale=zh_cn&pageSize=5');
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /api/categories — 返回分类树', async () => {
    const { status, body } = await api('/api/categories?locale=zh_cn');
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /api/brands — 返回品牌列表', async () => {
    const { status, body } = await api('/api/brands');
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });
});

// ── 认证 ──────────────────────────────────────────────────────

describe('认证 API', () => {
  it('POST /api/auth — 注册新用户', async () => {
    expect(customerToken).toBeDefined();
    expect(customerId).toBeDefined();
  });

  it('GET /api/auth/me — 获取当前用户信息', async () => {
    const { status, body } = await api('/api/auth/me', { token: customerToken });
    expect(status).toBe(200);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
  });

  it('GET /api/auth/me — 无 token 返回 401', async () => {
    const { status } = await api('/api/auth/me');
    expect(status).toBe(401);
  });
});

// ── 购物车（需认证）──────────────────────────────────────────

describe('购物车 API', () => {
  it('POST /api/cart — 添加商品到购物车', async () => {
    const { status, body } = await api('/api/cart', {
      method: 'POST',
      token: customerToken,
      body: JSON.stringify({ productId: 1, quantity: 2 }),
    });
    expect(status).toBe(201);
    expect(body).toHaveProperty('id');
  });

  it('GET /api/cart — 获取购物车', async () => {
    const { status, body } = await api('/api/cart?locale=zh_cn', { token: customerToken });
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it('POST /api/cart — 无 token 返回 401', async () => {
    const { status } = await api('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: 1, quantity: 1 }),
    });
    expect(status).toBe(401);
  });
});

// ── 收藏夹（需认证）──────────────────────────────────────────

describe('收藏夹 API', () => {
  it('POST /api/customers/wishlist — 添加收藏', async () => {
    const { status } = await api('/api/customers/wishlist', {
      method: 'POST',
      token: customerToken,
      body: JSON.stringify({ productId: 1 }),
    });
    expect(status).toBe(201);
  });

  it('GET /api/customers/wishlist — 获取收藏列表', async () => {
    const { status, body } = await api('/api/customers/wishlist', { token: customerToken });
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });
});

// ── 订单（需认证）────────────────────────────────────────────

describe('订单 API', () => {
  it('POST /api/orders — 从购物车创建订单', async () => {
    const { status } = await api('/api/orders', {
      method: 'POST',
      token: customerToken,
      body: JSON.stringify({}),
    });
    // 可能 201 或 422（购物车为空/库存不足）
    expect([201, 422]).toContain(status);
  });

  it('GET /api/orders — 获取客户订单', async () => {
    const { status, body } = await api('/api/orders', { token: customerToken });
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });
});

// ── 管理员 API ───────────────────────────────────────────────

describe('管理员 API', () => {
  it('POST /api/products — 管理员创建产品', async () => {
    const sku = `INTEG-${Date.now()}`;
    const { status, body } = await api('/api/products', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        sku,
        price: '999.00',
        status: true,
        quantity: 10,
        descriptions: { zh_cn: { name: '集成测试产品' } },
      }),
    });
    expect(status).toBe(201);
    expect(body).toHaveProperty('id');
  });

  it('POST /api/products — 无管理员权限返回 401/403', async () => {
    const { status } = await api('/api/products', {
      method: 'POST',
      token: customerToken,
      body: JSON.stringify({ sku: 'NO-AUTH', price: '1.00', descriptions: {} }),
    });
    expect([401, 403]).toContain(status);
  });
});
