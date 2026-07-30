import { describe, it, expect, vi, beforeEach } from 'vitest';

function createChainMock(resolvedValue: unknown) {
  const buildChain = (endValue: unknown): Record<string, unknown> =>
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

let callCount = 0;
const mockDb = {
  insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1, type: 'info', data: { summary: 'test' }, readAt: null }])) })) })),
  select: vi.fn(() => createChainMock([])),
  update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1, readAt: new Date() }])) })) })) })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ rowCount: 1 })) })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

function mockSelectSequence(...results: unknown[][]) {
  callCount = 0;
  mockDb.select.mockImplementation(() => {
    const data = results[Math.min(callCount, results.length - 1)];
    callCount++;
    return createChainMock(data);
  });
}

const { NotificationService } = await import('@/lib/services/notification.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

describe('NotificationService', () => {
  let svc: InstanceType<typeof NotificationService>;
  beforeEach(() => { vi.clearAllMocks(); callCount = 0; svc = new NotificationService(); });

  describe('list', () => {
    it('应返回通知列表和未读数', async () => {
      mockSelectSequence(
        [{ id: 1, type: 'info', data: { summary: 'test' }, readAt: null }],
        [{ id: 1 }],
      );
      const result = await svc.list({ notifiableId: 1, notifiableType: 'customer' });
      expect(result.items).toHaveLength(1);
      expect(result.unreadCount).toBe(1);
    });
  });

  describe('getById', () => {
    it('通知存在时应返回', async () => {
      mockSelectSequence([{ id: 1, type: 'info' }]);
      const result = await svc.getById(1);
      expect(result).toHaveProperty('id', 1);
    });

    it('通知不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);
      await expect(svc.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('应能创建通知（happy path）', async () => {
      const result = await svc.create({ type: 'info', data: { summary: 'hello' } });
      expect(result).toHaveProperty('id', 1);
    });

    it('type 为空时应抛出 BusinessRuleError', async () => {
      await expect(svc.create({ type: '', data: { summary: 'x' } }))
        .rejects.toThrow(BusinessRuleError);
    });

    it('data 缺少 summary 时应抛出 BusinessRuleError', async () => {
      await expect(svc.create({ type: 'info', data: {} }))
        .rejects.toThrow(BusinessRuleError);
    });
  });

  describe('markAsRead', () => {
    it('应能标记已读', async () => {
      mockSelectSequence([{ id: 1, notifiableId: 1, notifiableType: 'customer', readAt: null }]);
      const result = await svc.markAsRead(1, 1, 'customer');
      expect(result).toHaveProperty('readAt');
    });

    it('通知不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);
      await expect(svc.markAsRead(999)).rejects.toThrow(NotFoundError);
    });

    it('无权操作他人通知时应抛出 BusinessRuleError', async () => {
      mockSelectSequence([{ id: 1, notifiableId: 2, notifiableType: 'customer' }]);
      await expect(svc.markAsRead(1, 1, 'customer')).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('delete', () => {
    it('应能删除通知', async () => {
      mockSelectSequence([{ id: 1, notifiableId: 1, notifiableType: 'customer' }]);
      const result = await svc.delete(1, 1, 'customer');
      expect(result).toBe(true);
    });

    it('通知不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);
      await expect(svc.delete(999)).rejects.toThrow(NotFoundError);
    });
  });
});
