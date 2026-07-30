import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, BusinessRuleError } from '@/lib/services/errors';

// ─── 通用 mock 工具 ───────────────────────────────────────────

function createChainMock(resolvedValue: unknown) {
  const buildChain = (endValue: unknown): unknown => {
    return new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: Function) => resolve(endValue);
        if (prop === 'catch') return () => Promise.resolve(endValue);
        return () => buildChain(endValue);
      },
      apply() {
        return Promise.resolve(endValue);
      },
    });
  };
  return buildChain(resolvedValue);
}

// ─── 数据库 mock ──────────────────────────────────────────────

const defaultCustomer = {
  id: 1, email: 'test@example.com', name: 'Test User',
  password: 'hashed_pwd', phone: null, avatar: null,
  groupId: null, status: true, newsletter: false,
  lastLogin: null, createdAt: new Date(), updatedAt: new Date(),
};

function makeInsertMock(returnValue: unknown) {
  return {
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([returnValue])),
    })),
  };
}

const mockDb = vi.hoisted(() => ({
  insert: vi.fn(() => makeInsertMock({ ...defaultCustomer })),
  select: vi.fn(() => createChainMock([])),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ ...defaultCustomer, name: 'Updated User' }])),
      })),
    })),
  })),
  delete: vi.fn(() => ({
    where: vi.fn(() => Promise.resolve(undefined)),
  })),
}));

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

vi.mock('bcryptjs', () => ({
  hash: vi.fn(() => Promise.resolve('hashed_password')),
  compare: vi.fn(() => Promise.resolve(true)),
  default: {
    hash: vi.fn(() => Promise.resolve('hashed_password')),
    compare: vi.fn(() => Promise.resolve(true)),
  },
}));

import { CustomerService } from '@/lib/services/customer.service';

// ─── 测试 ─────────────────────────────────────────────────────

describe('CustomerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnValue(createChainMock([]));
    mockDb.insert.mockReturnValue(makeInsertMock({ ...defaultCustomer }));
  });

  // ======== register ========
  describe('register', () => {
    it('正常注册 → 返回脱敏客户信息', async () => {
      const result = await CustomerService.register({
        email: 'new@example.com',
        password: 'password123',
        name: '新用户',
        newsletter: false,
      });

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).not.toHaveProperty('password');
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('邮箱已被注册 → 抛出 BusinessRuleError', async () => {
      mockDb.select.mockReturnValue(
        createChainMock([{ id: 1, email: 'dup@example.com' }])
      );

      await expect(
        CustomerService.register({
          email: 'dup@example.com',
          password: 'password123',
          name: '重复用户',
          newsletter: false,
        })
      ).rejects.toThrow(BusinessRuleError);

      await expect(
        CustomerService.register({
          email: 'dup@example.com',
          password: 'password123',
          name: '重复用户',
          newsletter: false,
        })
      ).rejects.toThrow('邮箱已被注册');
    });
  });

  // ======== login ========
  describe('login', () => {
    it('正确凭证 → 返回脱敏客户信息', async () => {
      mockDb.select.mockReturnValue(
        createChainMock([{ ...defaultCustomer, password: 'hashed_password' }])
      );

      const result = await CustomerService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('id', 1);
      expect(result).not.toHaveProperty('password');
    });

    it('邮箱不存在 → 抛出 BusinessRuleError', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(
        CustomerService.login({ email: 'noone@example.com', password: 'x' })
      ).rejects.toThrow(BusinessRuleError);

      await expect(
        CustomerService.login({ email: 'noone@example.com', password: 'x' })
      ).rejects.toThrow('邮箱或密码错误');
    });

    it('密码不正确 → 抛出 BusinessRuleError', async () => {
      const bcryptModule = await import('bcryptjs');
      // 使用 mockReturnValue 持续返回 false，而非 mockResolvedValueOnce
      (bcryptModule.default.compare as ReturnType<typeof vi.fn>).mockReturnValue(
        Promise.resolve(false)
      );

      mockDb.select.mockReturnValue(
        createChainMock([{ ...defaultCustomer, password: 'hashed_password' }])
      );

      await expect(
        CustomerService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow(BusinessRuleError);

      await expect(
        CustomerService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('邮箱或密码错误');
    });
  });

  // ======== findById ========
  describe('findById', () => {
    it('客户存在 → 返回脱敏信息', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ ...defaultCustomer }]));

      const result = await CustomerService.findById(1);

      expect(result).toHaveProperty('id', 1);
      expect(result).not.toHaveProperty('password');
    });

    it('客户不存在 → 抛出 NotFoundError', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(CustomerService.findById(999)).rejects.toThrow(NotFoundError);
      await expect(CustomerService.findById(999)).rejects.toThrow('客户不存在');
    });
  });

  // ======== updateProfile ========
  describe('updateProfile', () => {
    it('正常更新 → 返回更新后信息', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ id: 1 }]));

      const result = await CustomerService.updateProfile(1, {
        name: '更新用户',
        phone: '13800138000',
      });

      expect(result).toHaveProperty('name', 'Updated User');
    });

    it('客户不存在 → 抛出 NotFoundError', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(
        CustomerService.updateProfile(999, { name: '不存在' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ======== addAddress ========
  describe('addAddress', () => {
    const addressInput = {
      name: '家',
      phone: '13800138000',
      countryId: 1,
      address1: '北京市朝阳区',
      isDefault: false,
    };

    it('正常添加地址 → 返回地址信息', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ id: 1 }]));

      const result = await CustomerService.addAddress(1, addressInput);

      expect(result).toHaveProperty('id');
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('isDefault=true 时 → 先清除旧默认', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ id: 1 }]));

      await CustomerService.addAddress(1, { ...addressInput, isDefault: true });

      expect(mockDb.update).toHaveBeenCalled();
    });

    it('客户不存在 → 抛出 NotFoundError', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(
        CustomerService.addAddress(999, addressInput)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ======== addToWishlist ========
  describe('addToWishlist', () => {
    it('正常添加到收藏夹 → 返回收藏记录', async () => {
      const wishlistRecord = { customerId: 1, productId: 10, createdAt: new Date(), id: 1 };
      mockDb.insert.mockReturnValue(makeInsertMock(wishlistRecord));

      // 第一次 select: 产品存在; 第二次 select: 未收藏
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount <= 1) return createChainMock([{ id: 10 }]);
        return createChainMock([]);
      });

      const result = await CustomerService.addToWishlist(1, 10);

      expect(result).toHaveProperty('customerId', 1);
      expect(result).toHaveProperty('productId', 10);
    });

    it('重复添加 → 幂等返回已有记录', async () => {
      const existing = { customerId: 1, productId: 10, createdAt: new Date() };
      mockDb.select.mockReturnValue(createChainMock([existing]));

      const result = await CustomerService.addToWishlist(1, 10);

      expect(result).toEqual(existing);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('产品不存在 → 抛出 NotFoundError', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(
        CustomerService.addToWishlist(1, 999)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ======== removeFromWishlist ========
  describe('removeFromWishlist', () => {
    it('正常移除 → 返回 true', async () => {
      mockDb.select.mockReturnValue(
        createChainMock([{ customerId: 1, productId: 10 }])
      );

      const result = await CustomerService.removeFromWishlist(1, 10);

      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('收藏记录不存在 → 抛出 NotFoundError', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(
        CustomerService.removeFromWishlist(1, 999)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ======== deleteAddress ========
  describe('deleteAddress', () => {
    it('正常删除 → 返回 true', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ id: 1 }]));

      const result = await CustomerService.deleteAddress(1, 1);

      expect(result).toBe(true);
    });

    it('地址不存在 → 抛出 NotFoundError', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(
        CustomerService.deleteAddress(1, 999)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ======== findAll ========
  describe('findAll', () => {
    it('返回所有客户列表（脱敏）', async () => {
      mockDb.select.mockReturnValue(
        createChainMock([
          { ...defaultCustomer, id: 1 },
          { ...defaultCustomer, id: 2, email: 'user2@example.com' },
        ])
      );

      const result = await CustomerService.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  // ======== getAddresses ========
  describe('getAddresses', () => {
    it('返回客户地址列表', async () => {
      const mockAddresses = [
        { id: 1, customerId: 1, name: '家', address1: '地址1' },
        { id: 2, customerId: 1, name: '公司', address1: '地址2' },
      ];
      mockDb.select.mockReturnValue(createChainMock(mockAddresses));

      const result = await CustomerService.getAddresses(1);

      expect(result).toHaveLength(2);
    });
  });

  // ======== getWishlist ========
  describe('getWishlist', () => {
    it('返回收藏夹列表', async () => {
      mockDb.select.mockReturnValue(createChainMock([
        { customerId: 1, productId: 10, createdAt: new Date() },
      ]));

      const result = await CustomerService.getWishlist(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });
  });
});
