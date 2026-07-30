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
