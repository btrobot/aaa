import { describe, it, expect } from 'vitest';

const BASE = `http://localhost:${process.env.DEPLOY_RUN_PORT || 5000}`;

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

describe('产品 API 集成测试', () => {
  it('GET /api/products - 返回产品列表', async () => {
    const { status, body } = await api('/api/products?locale=zh_cn&pageSize=5');
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('sku');
    expect(body[0]).toHaveProperty('price');
    expect(body[0]).toHaveProperty('description');
  });

  it('GET /api/products?status=true - 只返回启用产品', async () => {
    const { status, body } = await api('/api/products?locale=zh_cn&status=true');
    expect(status).toBe(200);
    for (const p of body) {
      expect(p.status).toBe(true);
    }
  });

  it('POST /api/products - 创建新产品', async () => {
    const sku = `INTEG-${Date.now()}`;
    const { status, body } = await api('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        sku,
        price: '19999.00',
        status: true,
        quantity: 10,
        sortOrder: 0,
        descriptions: {
          zh_cn: { name: '集成测试产品' },
          en: { name: 'Integration Test Product' },
        },
      }),
    });
    expect(status).toBe(201);
    expect(body).toHaveProperty('id');
  });
});

describe('分类 API 集成测试', () => {
  it('GET /api/categories - 返回分类树', async () => {
    const { status, body } = await api('/api/categories');
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('name');
    expect(body[0]).toHaveProperty('children');
  });
});

describe('品牌 API 集成测试', () => {
  it('GET /api/brands - 返回品牌列表', async () => {
    const { status, body } = await api('/api/brands');
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('name');
  });
});

describe('认证 API 集成测试', () => {
  const testEmail = `integ-test-${Date.now()}@nodecoda.com`;
  let customerId: number;

  it('POST /api/auth - 注册新用户', async () => {
    const { status, body } = await api('/api/auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'register',
        email: testEmail,
        password: 'password123',
        name: '集成测试用户',
      }),
    });
    expect(status).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body.email).toBe(testEmail);
    customerId = body.id;
  });

  it('POST /api/auth - 登录已注册用户', async () => {
    const { status, body } = await api('/api/auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        email: testEmail,
        password: 'password123',
      }),
    });
    expect(status).toBe(200);
    expect(body).toHaveProperty('id');
    expect(body).not.toHaveProperty('password');
  });

  describe('客户 API 集成测试', () => {
    it('GET /api/customers?id=X - 获取客户信息', async () => {
      const { status, body } = await api(`/api/customers?id=${customerId}`);
      expect(status).toBe(200);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('email');
      expect(body).not.toHaveProperty('password');
    });
  });

  describe('收藏夹 API 集成测试', () => {
    it('POST /api/customers/wishlist - 添加收藏', async () => {
      const { status, body } = await api('/api/customers/wishlist', {
        method: 'POST',
        body: JSON.stringify({ customerId, productId: 1 }),
      });
      expect(status).toBe(201);
      expect(body).toHaveProperty('id');
    });

    it('GET /api/customers/wishlist?customerId=X - 获取收藏列表', async () => {
      const { status, body } = await api(`/api/customers/wishlist?customerId=${customerId}`);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('购物车 API 集成测试', () => {
    it('POST /api/cart - 添加商品到购物车', async () => {
      const { status, body } = await api('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ customerId, productId: 1, quantity: 2 }),
      });
      expect(status).toBe(201);
      expect(body).toHaveProperty('id');
      expect(body.quantity).toBe(2);
    });

    it('GET /api/cart - 获取购物车列表', async () => {
      const { status, body } = await api(`/api/cart?customerId=${customerId}&locale=zh_cn`);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('订单 API 集成测试', () => {
    it('POST /api/orders - 从购物车创建订单', async () => {
      const { status, body } = await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ customerId }),
      });
      expect(status).toBe(201);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('number');
      expect(body).toHaveProperty('status');
      expect(body.status).toBe('pending');
    });

    it('GET /api/orders?customerId=X - 获取客户订单', async () => {
      const { status, body } = await api(`/api/orders?customerId=${customerId}`);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('number');
    });

    it('GET /api/orders?admin=true - 获取所有订单', async () => {
      const { status, body } = await api('/api/orders?admin=true');
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });
});