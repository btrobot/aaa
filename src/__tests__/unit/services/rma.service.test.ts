import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock helpers ──────────────────────────────────────────────

function createChainMock(resolvedValue: unknown) {
  const buildChain = (endValue: unknown): any =>
    new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: Function) => resolve(endValue);
        if (prop === 'catch') return () => Promise.resolve(endValue);
        return () => buildChain(endValue);
      },
      apply() { return Promise.resolve(endValue); },
    });
  return buildChain(resolvedValue);
}

const NOW = new Date();

const mockDb = {
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

function mockSelect(data: unknown[]) {
  mockDb.select.mockReturnValue(createChainMock(data));
}

// ── Dynamic imports after mock ────────────────────────────────

const { RmaService } = await import('@/lib/services/rma.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

describe('RmaService', () => {
  beforeEach(() => vi.clearAllMocks());

  // ===========================================================================
  // create
  // ===========================================================================
  describe('create', () => {
    const validInput = {
      orderProductId: 10,
      type: 'refund' as const,
      reason: '商品有质量问题',
      quantity: 1,
    };

    const mockOrderProduct = {
      order_products: { id: 10, orderId: 1, quantity: 3, name: '测试商品' },
      orders: { id: 1, status: 'completed' },
    };

    function setupCreateMocks(opts?: { existingRma?: boolean }) {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        // 1st call: 查 orderProduct+order
        if (callCount === 1) return createChainMock([mockOrderProduct]);
        // 2nd call: 查 existing rma
        if (callCount === 2) return createChainMock(opts?.existingRma ? [{ id: 99 }] : []);
        return createChainMock([]);
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{
            id: 1,
            orderProductId: 10,
            orderId: 1,
            customerId: 100,
            type: 'refund',
            reason: '商品有质量问题',
            quantity: 1,
            comment: null,
            status: 'pending',
            adminNote: null,
            createdAt: NOW,
            updatedAt: NOW,
          }])),
        })),
      });
    }

    it('应能创建退换货申请（happy path）', async () => {
      setupCreateMocks();

      const result = await RmaService.create(100, validInput);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('status', 'pending');
      expect(result).toHaveProperty('customerId', 100);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('订单产品不存在时应抛出 NotFoundError', async () => {
      mockSelect([]); // orderProduct 不存在

      await expect(RmaService.create(100, validInput))
        .rejects.toThrow(NotFoundError);
    });

    it('订单未完成时应抛出 BusinessRuleError（pre 违反）', async () => {
      mockDb.select.mockReturnValue(createChainMock([{
        order_products: { id: 10, orderId: 1, quantity: 3, name: '商品' },
        orders: { id: 1, status: 'pending' },
      }]));

      await expect(RmaService.create(100, validInput))
        .rejects.toThrow(BusinessRuleError);
    });

    it('退换货数量超过购买数量时应抛出 BusinessRuleError', async () => {
      mockDb.select.mockReturnValue(createChainMock([{
        order_products: { id: 10, orderId: 1, quantity: 1, name: '商品' },
        orders: { id: 1, status: 'completed' },
      }]));

      await expect(RmaService.create(100, { ...validInput, quantity: 5 }))
        .rejects.toThrow(BusinessRuleError);
    });

    it('该订单产品已申请过退换货时应抛出 BusinessRuleError', async () => {
      setupCreateMocks({ existingRma: true });

      await expect(RmaService.create(100, validInput))
        .rejects.toThrow(BusinessRuleError);
    });

    it('应校验 zod schema — reason 为空字符串', async () => {
      await expect(RmaService.create(100, { ...validInput, reason: '' }))
        .rejects.toThrow();
    });
  });

  // ===========================================================================
  // findById
  // ===========================================================================
  describe('findById', () => {
    it('应能找到退换货单（happy path）', async () => {
      mockSelect([{
        rmas: { id: 1, customerId: 100, status: 'pending', orderProductId: 10 },
        orders: { id: 1 },
        customers: { name: '张三' },
        order_products: { name: '测试商品' },
      }]);

      const result = await RmaService.findById(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('customerName', '张三');
      expect(result).toHaveProperty('productName', '测试商品');
    });

    it('退换货单不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(RmaService.findById(999))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // getByCustomerId
  // ===========================================================================
  describe('getByCustomerId', () => {
    it('应返回客户的退换货列表', async () => {
      mockSelect([
        { rmas: { id: 1, customerId: 100, status: 'pending' }, orders: { id: 1 } },
        { rmas: { id: 2, customerId: 100, status: 'approved' }, orders: { id: 2 } },
      ]);

      const result = await RmaService.getByCustomerId(100);
      expect(result).toHaveLength(2);
    });

    it('应支持按 status 筛选', async () => {
      mockSelect([
        { rmas: { id: 1, customerId: 100, status: 'pending' }, orders: { id: 1 } },
      ]);

      const result = await RmaService.getByCustomerId(100, 'pending');
      expect(result).toHaveLength(1);
    });
  });

  // ===========================================================================
  // getAll
  // ===========================================================================
  describe('getAll', () => {
    it('应返回全部退换货列表（含分页）', async () => {
      mockDb.select.mockImplementation(() => {
        return createChainMock([
          { rmas: { id: 1, status: 'pending' }, orders: { id: 1 }, customers: { name: '张三' } },
        ]);
      });

      const result = await RmaService.getAll({ page: 1, pageSize: 20 });
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
    });
  });

  // ===========================================================================
  // updateStatus — 状态机
  // ===========================================================================
  describe('updateStatus', () => {
    const baseRma = { id: 1, status: 'pending', adminNote: null };

    function setupExistingRma(status: string) {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ ...baseRma, status }]);
        return createChainMock([]);
      });

      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{
              ...baseRma,
              status: 'approved',
              adminNote: '同意',
              updatedAt: NOW,
            }])),
          })),
        })),
      });
    }

    // ── happy path ─────────────────────────────────────────

    it('pending → approved 应成功', async () => {
      setupExistingRma('pending');

      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{
              ...baseRma, status: 'approved', adminNote: '同意', updatedAt: NOW,
            }])),
          })),
        })),
      });

      const result = await RmaService.updateStatus(1, { status: 'approved', adminNote: '同意' });
      expect(result.status).toBe('approved');
    });

    it('pending → rejected 应成功（有 adminNote）', async () => {
      setupExistingRma('pending');

      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{
              ...baseRma, status: 'rejected', adminNote: '不符合条件', updatedAt: NOW,
            }])),
          })),
        })),
      });

      const result = await RmaService.updateStatus(1, { status: 'rejected', adminNote: '不符合条件' });
      expect(result.status).toBe('rejected');
    });

    it('approved → completed 应成功', async () => {
      setupExistingRma('approved');

      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{
              ...baseRma, status: 'completed', adminNote: null, updatedAt: NOW,
            }])),
          })),
        })),
      });

      const result = await RmaService.updateStatus(1, { status: 'completed' });
      expect(result.status).toBe('completed');
    });

    it('approved → rejected 应成功', async () => {
      setupExistingRma('approved');

      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{
              ...baseRma, status: 'rejected', adminNote: '审核不通过', updatedAt: NOW,
            }])),
          })),
        })),
      });

      const result = await RmaService.updateStatus(1, { status: 'rejected', adminNote: '审核不通过' });
      expect(result.status).toBe('rejected');
    });

    // ── pre 违反：不存在 ──────────────────────────────────

    it('退换货单不存在时应抛出 NotFoundError', async () => {
      mockSelect([]);

      await expect(RmaService.updateStatus(999, { status: 'approved' }))
        .rejects.toThrow(NotFoundError);
    });

    // ── 状态机转换非法 ─────────────────────────────────────

    it('pending → completed 应抛出 BusinessRuleError（非法转换）', async () => {
      setupExistingRma('pending');

      await expect(RmaService.updateStatus(1, { status: 'completed' }))
        .rejects.toThrow(BusinessRuleError);
    });

    it('rejected → approved 应抛出 BusinessRuleError（终态不可变）', async () => {
      mockSelect([{ ...baseRma, status: 'rejected' }]);

      await expect(RmaService.updateStatus(1, { status: 'approved' }))
        .rejects.toThrow(BusinessRuleError);
    });

    it('completed → approved 应抛出 BusinessRuleError（终态不可变）', async () => {
      mockSelect([{ ...baseRma, status: 'completed' }]);

      await expect(RmaService.updateStatus(1, { status: 'approved' }))
        .rejects.toThrow(BusinessRuleError);
    });

    // ── 拒绝时必须填写 adminNote ──────────────────────────

    it('拒绝时未填写 adminNote 应抛出 BusinessRuleError', async () => {
      setupExistingRma('pending');

      await expect(RmaService.updateStatus(1, { status: 'rejected' }))
        .rejects.toThrow(BusinessRuleError);
    });
  });

  // ===========================================================================
  // getNextStatuses
  // ===========================================================================
  describe('getNextStatuses', () => {
    it('pending 可转为 approved 和 rejected', () => {
      expect(RmaService.getNextStatuses('pending')).toEqual(['approved', 'rejected']);
    });

    it('approved 可转为 completed 和 rejected', () => {
      expect(RmaService.getNextStatuses('approved')).toEqual(['completed', 'rejected']);
    });

    it('rejected 为终态，无后续', () => {
      expect(RmaService.getNextStatuses('rejected')).toEqual([]);
    });

    it('completed 为终态，无后续', () => {
      expect(RmaService.getNextStatuses('completed')).toEqual([]);
    });
  });
});
