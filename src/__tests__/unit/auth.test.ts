// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCustomerService = {
  login: vi.fn(),
  register: vi.fn(),
};

vi.mock('@/lib/services/customer.service', () => ({ CustomerService: mockCustomerService }));
vi.mock('@/lib/db/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));
vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn(() => Promise.resolve(true)) },
}));

const auth = await import('@/lib/auth');

describe('Auth 模块', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('AuthError', () => {
    it('应有正确的 status 和 name', () => {
      const error = new auth.AuthError('测试', 403);
      expect(error.status).toBe(403);
      expect(error.name).toBe('AuthError');
      expect(error.message).toBe('测试');
    });

    it('默认 status 应为 401', () => {
      const error = new auth.AuthError('未登录');
      expect(error.status).toBe(401);
    });
  });

  describe('requireAuth', () => {
    const customer = { id: 1, email: 'a@b.com', name: 'A', role: 'customer' as const };
    const admin = { id: 2, email: 'admin@b.com', name: 'Admin', role: 'admin' as const };

    it('customer 访问 customer-only 路由应通过', () => {
      expect(() => auth.requireAuth(customer, ['customer'])).not.toThrow();
    });

    it('customer 访问 admin-only 路由应抛出 AuthError', () => {
      expect(() => auth.requireAuth(customer, ['admin'])).toThrow(auth.AuthError);
    });

    it('admin 访问 admin-only 路由应通过', () => {
      expect(() => auth.requireAuth(admin, ['admin'])).not.toThrow();
    });

    it('不限角色时所有人都通过', () => {
      expect(() => auth.requireAuth(customer)).not.toThrow();
      expect(() => auth.requireAuth(admin)).not.toThrow();
    });
  });

  describe('getTokenFromRequest', () => {
    it('应从 Authorization header 提取 token', () => {
      const req = new Request('http://localhost', {
        headers: { Authorization: 'Bearer test-token-123' },
      });
      expect(auth.getTokenFromRequest(req)).toBe('test-token-123');
    });

    it('无 token 时应返回 null', () => {
      const req = new Request('http://localhost');
      expect(auth.getTokenFromRequest(req)).toBeNull();
    });
  });

  describe('TOKEN_NAME', () => {
    it('应为 nodecoda_token', () => {
      expect(auth.TOKEN_NAME).toBe('nodecoda_token');
    });
  });
});

  // ─── signToken / verifyToken ────────────────────────────────────

  describe('signToken', () => {

  // ─── signToken / verifyToken ────────────────────────────────────

  describe('signToken', () => {
    it('应能签发 JWT token', async () => {
      const token = await auth.signToken({ id: 1, email: 'a@b.com', name: 'A', role: 'customer' });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('签发的 token 应能被 verifyToken 解析', async () => {
      const payload = { id: 5, email: 'test@x.com', name: 'Test', role: 'admin' as const };
      const token = await auth.signToken(payload);
      const decoded = await auth.verifyToken(token);
      expect(decoded.id).toBe(5);
      expect(decoded.email).toBe('test@x.com');
      expect(decoded.role).toBe('admin');
    });
  });

  describe('verifyToken', () => {
    it('无效 token 应抛出 AuthError', async () => {
      await expect(auth.verifyToken('invalid.token.here'))
        .rejects.toThrow(auth.AuthError);
    });

    it('篡改的 token 应抛出 AuthError', async () => {
      const token = await auth.signToken({ id: 1, email: 'a@b.com', name: 'A', role: 'customer' });
      const tampered = token.slice(0, -5) + 'XXXXX';
      await expect(auth.verifyToken(tampered))
        .rejects.toThrow(auth.AuthError);
    });
  });

  describe('authenticate', () => {
    it('有有效 token 的请求应返回 payload', async () => {
      const token = await auth.signToken({ id: 3, email: 'u@b.com', name: 'U', role: 'customer' });
      const req = new Request('http://localhost', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await auth.authenticate(req);
      expect(result.id).toBe(3);
      expect(result.role).toBe('customer');
    });

    it('无 token 的请求应抛出 AuthError(401)', async () => {
      const req = new Request('http://localhost');
      await expect(auth.authenticate(req))
        .rejects.toThrow(auth.AuthError);
    });

    it('无效 token 的请求应抛出 AuthError', async () => {
      const req = new Request('http://localhost', {
        headers: { Authorization: 'Bearer bad-token' },
      });
      await expect(auth.authenticate(req))
        .rejects.toThrow(auth.AuthError);
    });
  });
});
