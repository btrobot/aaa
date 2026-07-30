import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, BusinessRuleError } from '@/lib/services/errors';

// ─── 链式 Mock 工厂 ──────────────────────────────────────────
function createChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  chain.from = vi.fn(() => chain);
  chain.where = vi.fn(() => chain);
  chain.leftJoin = vi.fn(() => chain);
  chain.innerJoin = vi.fn(() => chain);
  chain.orderBy = vi.fn(() => chain);
  chain.limit = vi.fn(() => chain);
  chain.offset = vi.fn(() => chain);
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(resolvedValue).then(resolve);
  return chain;
}

// ─── 可配置序列 db mock ──────────────────────────────────────
function createSequenceDb() {
  const selectResults: unknown[] = [];
  let selectIdx = 0;

  const mockDb = {
    select: vi.fn(() => {
      const result = selectResults[selectIdx] ?? [];
      selectIdx++;
      return createChain(result);
    }),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1, productId: 1, customerId: 1, rating: 5, content: '好评', status: true, createdAt: new Date() }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  };

  return {
    mockDb,
    mockSelectSequence(...results: unknown[]) {
      selectResults.length = 0;
      selectResults.push(...results);
      selectIdx = 0;
    },
    resetAll() {
      vi.clearAllMocks();
      selectResults.length = 0;
      selectIdx = 0;
    },
  };
}

const { mockDb, mockSelectSequence, resetAll } = createSequenceDb();

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

const { ReviewService } = await import('@/lib/services/review.service');

// ============================================================

describe('ReviewService', () => {
  beforeEach(() => resetAll());

  // ─── create ────────────────────────────────────────────────
  describe('create', () => {
    const baseInput = { productId: 1, customerId: 1, rating: 5, content: '好评' };

    it('应能创建评价并返回评价记录', async () => {
      // select: product存在, 已购买, 未评价过
      mockSelectSequence([{ id: 1 }], [{ id: 100 }], []);

      const result = await ReviewService.create(baseInput);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('产品不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);

      const err = await ReviewService.create(baseInput).catch(e => e);
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toMatch(/产品.*不存在/);
    });

    it('客户未购买该产品时应抛出 BusinessRuleError', async () => {
      // select: product存在, 未购买
      mockSelectSequence([{ id: 1 }], []);

      const err = await ReviewService.create(baseInput).catch(e => e);
      expect(err).toBeInstanceOf(BusinessRuleError);
      expect(err.message).toMatch(/已购买/);
    });

    it('客户已评价过该产品时应抛出 BusinessRuleError', async () => {
      // select: product存在, 已购买, 已评价
      mockSelectSequence([{ id: 1 }], [{ id: 100 }], [{ id: 99 }]);

      const err = await ReviewService.create(baseInput).catch(e => e);
      expect(err).toBeInstanceOf(BusinessRuleError);
      expect(err.message).toMatch(/已经评价过/);
    });
  });

  // ─── findById ──────────────────────────────────────────────
  describe('findById', () => {
    it('评价不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);

      await expect(ReviewService.findById(999))
        .rejects.toThrow(NotFoundError);
    });

    it('评价存在时应返回带客户名的评价详情', async () => {
      const mockRow = {
        reviews: { id: 1, productId: 1, customerId: 1, rating: 5, content: '好评', status: true },
        customers: { id: 1, name: '张三' },
      };
      mockSelectSequence([mockRow]);

      const result = await ReviewService.findById(1);
      expect(result.id).toBe(1);
      expect(result.customerName).toBe('张三');
    });

    it('客户记录缺失时应返回默认客户名', async () => {
      const mockRow = {
        reviews: { id: 1, productId: 1, customerId: 1, rating: 5, content: '好评', status: true },
        customers: null,
      };
      mockSelectSequence([mockRow]);

      const result = await ReviewService.findById(1);
      expect(result.customerName).toBe('未知用户');
    });
  });

  // ─── update ────────────────────────────────────────────────
  describe('update', () => {
    it('评价不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);

      await expect(ReviewService.update(999, { status: false }))
        .rejects.toThrow(NotFoundError);
    });

    it('评价存在时应正常更新并返回 id', async () => {
      mockSelectSequence([{ id: 1 }]);

      const result = await ReviewService.update(1, { status: false });
      expect(result).toEqual({ id: 1 });
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('空输入时不应调用数据库更新', async () => {
      mockSelectSequence([{ id: 1 }]);

      const result = await ReviewService.update(1, {});
      expect(result).toEqual({ id: 1 });
      // update 不应被调用，因为 updateData 为空
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  // ─── delete ────────────────────────────────────────────────
  describe('delete', () => {
    it('评价不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);

      await expect(ReviewService.delete(999))
        .rejects.toThrow(NotFoundError);
    });

    it('评价存在时应正常删除并返回 success', async () => {
      mockSelectSequence([{ id: 1 }]);

      const result = await ReviewService.delete(1);
      expect(result).toEqual({ success: true });
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  // ─── list ──────────────────────────────────────────────────
  describe('list', () => {
    it('应返回分页评价列表', async () => {
      // select: main query, count query
      mockSelectSequence(
        [{ reviews: { id: 1, rating: 5, content: '好' }, customers: { name: '张三' } }],
        [{ count: 1 }],
      );

      const result = await ReviewService.list({ page: 1, pageSize: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('指定 productId 时应返回含统计信息的列表', async () => {
      // select: main query, count query, distribution query
      mockSelectSequence(
        [{ reviews: { id: 1, rating: 5, content: '好', status: true }, customers: { name: '张三' } }],
        [{ count: 2 }],
        [
          { id: 1, productId: 1, rating: 5, status: true },
          { id: 2, productId: 1, rating: 3, status: true },
        ],
      );

      const result = await ReviewService.list({ productId: 1, page: 1, pageSize: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.average).toBe(4);
      expect(result.distribution).toEqual({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 });
    });
  });

  // ─── getStats ──────────────────────────────────────────────
  describe('getStats', () => {
    it('产品不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);

      await expect(ReviewService.getStats(999))
        .rejects.toThrow(NotFoundError);
    });

    it('无评价时应返回全零统计', async () => {
      mockSelectSequence([{ id: 1 }], []);

      const result = await ReviewService.getStats(1);
      expect(result).toEqual({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    });

    it('有评价时应返回正确的统计分布', async () => {
      mockSelectSequence(
        [{ id: 1 }],
        [
          { id: 1, productId: 1, rating: 5, status: true },
          { id: 2, productId: 1, rating: 5, status: true },
          { id: 3, productId: 1, rating: 3, status: true },
        ],
      );

      const result = await ReviewService.getStats(1);
      expect(result.total).toBe(3);
      expect(result.average).toBe(4.3);
      expect(result.distribution).toEqual({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 });
    });
  });
});
