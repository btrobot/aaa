import { describe, it, expect, vi, beforeEach } from 'vitest';

function createChainMock(resolvedValue: unknown) {
  const buildChain = (endValue: unknown): unknown =>
    new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: (v: unknown) => unknown) => resolve(endValue);
        if (prop === 'catch') return () => Promise.resolve(endValue);
        return () => buildChain(endValue);
      },
      apply() { return Promise.resolve(endValue); },
    });
  return buildChain(resolvedValue);
}

const mockDb = {
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
    })),
  })),
  select: vi.fn(() => createChainMock([])),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve(undefined)),
    })),
  })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ rowCount: 1 })) })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

function mockSelect(data: unknown[]) {
  mockDb.select.mockReturnValue(createChainMock(data));
}

const { PaymentService, PaymentStateMachine } = await import('@/lib/services/payment.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

// ─── 辅助数据 ──────────────────────────────────────────────────

const confirmedUnpaidOrder = {
  id: 10,
  number: 'ORD-2024-0010',
  customerId: 1,
  status: 'confirmed',
  paymentStatus: 'unpaid',
  total: '299.00',
};

const paidOrder = { ...confirmedUnpaidOrder, paymentStatus: 'paid' };
const pendingOrder = { ...confirmedUnpaidOrder, status: 'pending' };
const otherCustomerOrder = { ...confirmedUnpaidOrder, customerId: 999 };

const pendingPayment = {
  id: 100,
  orderId: 10,
  paymentMethod: 'stripe',
  amount: '299.00',
  status: 'pending',
  transactionId: null,
  createdAt: new Date(),
};

// ═══════════════════════════════════════════════════════════════
// PaymentService
// ═══════════════════════════════════════════════════════════════

describe('PaymentService', () => {
  beforeEach(() => vi.clearAllMocks());

  // ─── createPayment ───────────────────────────────────────────

  describe('createPayment', () => {
    it('应能为已确认且未支付的订单创建支付', async () => {
      mockSelect([confirmedUnpaidOrder]);
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 100, status: 'success' }])),
        })),
      });

      const result = await PaymentService.createPayment(10, 'stripe', 1);

      expect(result.paymentId).toBe(100);
      expect(result.status).toBe('success');
    });

    it('订单不存在时应抛出 NotFoundError', async () => {
      mockSelect([]);

      await expect(
        PaymentService.createPayment(999, 'stripe', 1),
      ).rejects.toThrow(NotFoundError);
    });

    it('订单状态不是 confirmed 时应抛出 BusinessRuleError', async () => {
      mockSelect([pendingOrder]);

      await expect(
        PaymentService.createPayment(10, 'stripe', 1),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('订单已支付时应抛出 BusinessRuleError', async () => {
      mockSelect([paidOrder]);

      await expect(
        PaymentService.createPayment(10, 'stripe', 1),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('订单不属于当前客户时应抛出 BusinessRuleError', async () => {
      mockSelect([otherCustomerOrder]);

      await expect(
        PaymentService.createPayment(10, 'stripe', 1),
      ).rejects.toThrow(BusinessRuleError);
    });
  });

  // ─── callback ────────────────────────────────────────────────

  describe('callback', () => {
    it('应能将 pending 回调为 success 并更新订单', async () => {
      mockSelect([pendingPayment]);

      await PaymentService.callback(100, 'success');

      // update 调用两次：支付记录 + 订单
      expect(mockDb.update).toHaveBeenCalledTimes(2);
    });

    it('应能将 pending 回调为 failed（不更新订单）', async () => {
      mockSelect([{ ...pendingPayment, status: 'pending' }]);

      await PaymentService.callback(100, 'failed');

      // update 只调用一次：支付记录
      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });

    it('支付记录不存在时应抛出 NotFoundError', async () => {
      mockSelect([]);

      await expect(
        PaymentService.callback(999, 'success'),
      ).rejects.toThrow(NotFoundError);
    });

    it('非法转换 success→failed 应抛出 BusinessRuleError', async () => {
      mockSelect([{ ...pendingPayment, status: 'success' }]);

      await expect(
        PaymentService.callback(100, 'failed'),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('非法转换 failed→success 应抛出 BusinessRuleError', async () => {
      mockSelect([{ ...pendingPayment, status: 'failed' }]);

      await expect(
        PaymentService.callback(100, 'success'),
      ).rejects.toThrow(BusinessRuleError);
    });

    it('非法转换 refunded→success 应抛出 BusinessRuleError', async () => {
      mockSelect([{ ...pendingPayment, status: 'refunded' }]);

      await expect(
        PaymentService.callback(100, 'success'),
      ).rejects.toThrow(BusinessRuleError);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// PaymentStateMachine
// ═══════════════════════════════════════════════════════════════

describe('PaymentStateMachine', () => {
  const machine = new PaymentStateMachine();

  describe('合法转换', () => {
    it('pending 可转换到 success', () => {
      expect(machine.canTransition('pending', 'success')).toBe(true);
    });

    it('pending 可转换到 failed', () => {
      expect(machine.canTransition('pending', 'failed')).toBe(true);
    });

    it('success 可转换到 refunded', () => {
      expect(machine.canTransition('success', 'refunded')).toBe(true);
    });

    it('failed 可转换到 pending', () => {
      expect(machine.canTransition('failed', 'pending')).toBe(true);
    });
  });

  describe('非法转换', () => {
    it('success 不能转换到 failed', () => {
      expect(machine.canTransition('success', 'failed')).toBe(false);
    });

    it('failed 不能转换到 success', () => {
      expect(machine.canTransition('failed', 'success')).toBe(false);
    });

    it('refunded 不能转换到任何状态', () => {
      expect(machine.canTransition('refunded', 'pending')).toBe(false);
      expect(machine.canTransition('refunded', 'success')).toBe(false);
      expect(machine.canTransition('refunded', 'failed')).toBe(false);
    });

    it('pending 不能转换到 refunded', () => {
      expect(machine.canTransition('pending', 'refunded')).toBe(false);
    });
  });

  describe('getNextStatuses', () => {
    it('pending 的下一状态为 [success, failed]', () => {
      expect(machine.getNextStatuses('pending')).toEqual(['success', 'failed']);
    });

    it('success 的下一状态为 [refunded]', () => {
      expect(machine.getNextStatuses('success')).toEqual(['refunded']);
    });

    it('failed 的下一状态为 [pending]', () => {
      expect(machine.getNextStatuses('failed')).toEqual(['pending']);
    });

    it('refunded 没有下一状态', () => {
      expect(machine.getNextStatuses('refunded')).toEqual([]);
    });
  });
});
