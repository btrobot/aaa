import { describe, it, expect, vi, beforeEach } from 'vitest';

function createChainMock(resolvedValue: unknown) {
  const buildChain = (endValue: unknown) =>
    new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: (value: unknown) => unknown) => resolve(endValue);
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
const { NotFoundError } = await import('@/lib/services/errors');

describe('NotificationService', () => {
  beforeEach(() => { vi.clearAllMocks(); callCount = 0; });

  describe('list', () => {
    it('应返回通知列表', async () => {
      mockSelectSequence(
        [{ id: 1, type: 'info', data: { summary: 'test' }, readAt: null }],
        [{ count: 1 }],
      );
      const result = await NotificationService.list({ notifiableId: 1, notifiableType: 'customer' });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('通知存在时应返回', async () => {
      mockSelectSequence([{ id: 1, type: 'info' }]);
      const result = await NotificationService.getById(1);
      expect(result).toHaveProperty('id', 1);
    });

    it('通知不存在时应返回 null', async () => {
      mockSelectSequence([]);
      const result = await NotificationService.getById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('应能创建通知（happy path）', async () => {
      const result = await NotificationService.create({ type: 'info', data: { summary: 'hello' }, notifiableId: 1, notifiableType: 'customer' });
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('markAsRead', () => {
    it('应能标记已读', async () => {
      mockSelectSequence([{ id: 1, readAt: new Date() }]);
      const result = await NotificationService.markAsRead(1, 1);
      expect(result).toHaveProperty('readAt');
    });
  });

  describe('delete', () => {
    it('应能删除通知', async () => {
      mockSelectSequence([{ id: 1, type: 'info' }]);
      const result = await NotificationService.delete(1, 1);
      expect(result).toHaveProperty('id', 1);
    });
  });
});