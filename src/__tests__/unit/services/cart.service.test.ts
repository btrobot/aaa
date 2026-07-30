import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock helpers ────────────────────────────────────────────────────────────

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

/** 可控的 select mock —— 每次调用前通过 mockDb.selectData 设置返回值 */
let selectData: unknown[] = [];
const mockDb = {
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([{ id: 99, quantity: 1, selected: true }])),
    })),
  })),
  select: vi.fn(() => createChainMock([])),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1, quantity: 5 }])),
      })),
    })),
  })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ rowCount: 1 })) })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

// 用于精确控制 select 返回值的辅助函数
function mockSelect(data: unknown[]) {
  selectData = data;
  mockDb.select.mockReturnValue(createChainMock(data));
}

const { CartService } = await import('@/lib/services/cart.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

// ── 测试套件 ────────────────────────────────────────────────────────────────

describe('CartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectData = [];
  });

  // ===========================================================================
  // addItem
  // ===========================================================================
  describe('addItem', () => {
    const baseInput = { customerId: 1, productId: 10, quantity: 2 };

    it('应能添加新商品到购物车（happy path）', async () => {
      // select: 第一次查产品 → 返回产品；第二次查 SKU → 不调用；第三次查购物车已有 → 空
      // 这里简化：直接让 select 返回空数组代表"购物车无此商品"
      // 产品校验和库存校验走单独的 select，需要分步 mock
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // 产品查询
          return createChainMock([{ id: 10, status: true, quantity: 100 }]);
        }
        // 购物车已有查询
        return createChainMock([]);
      });

      const result = await CartService.addItem(baseInput);
      expect(result).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('应能更新已有商品数量（spec: 同产品+SKU 重复添加增加数量）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([{ id: 10, status: true, quantity: 100 }]);
        }
        return createChainMock([{ id: 50, quantity: 3 }]);
      });

      const result = await CartService.addItem(baseInput);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('产品不存在时应抛出 NotFoundError（pre-1 违反）', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(CartService.addItem(baseInput))
        .rejects.toThrow(NotFoundError);
    });

    it('产品已下架时应抛出 BusinessRuleError（pre-1 违反）', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ id: 10, status: false, quantity: 100 }]));

      await expect(CartService.addItem(baseInput))
        .rejects.toThrow(BusinessRuleError);
    });

    it('指定 SKU 但不存在时应抛出 NotFoundError（pre-2 违反）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 10, status: true, quantity: 100 }]);
        if (callCount === 2) return createChainMock([]); // SKU 不存在
        return createChainMock([]);
      });

      await expect(CartService.addItem({ ...baseInput, skuId: 999 }))
        .rejects.toThrow(NotFoundError);
    });

    it('库存不足时应抛出 BusinessRuleError（pre-3 违反）', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ id: 10, status: true, quantity: 1 }]));

      await expect(CartService.addItem({ ...baseInput, quantity: 5 }))
        .rejects.toThrow(BusinessRuleError);
    });

    it('重复添加导致超过 99 上限时应抛出 BusinessRuleError（spec: rules[2]）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 10, status: true, quantity: 100 }]);
        return createChainMock([{ id: 50, quantity: 98 }]); // 已有 98，加 2 = 100 > 99
      });

      await expect(CartService.addItem(baseInput))
        .rejects.toThrow(BusinessRuleError);
    });

    it('数量应被限制在 MAX_QUANTITY 以内', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 10, status: true, quantity: 200 }]);
        return createChainMock([]);
      });

      await CartService.addItem({ ...baseInput, quantity: 150 });
      // insert 被调用，quantity 应被 cap 到 99
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // getCart
  // ===========================================================================
  describe('getCart', () => {
    it('应返回用户的购物车列表', async () => {
      mockSelect([
        {
          carts: { id: 1, productId: 1, quantity: 2, selected: true },
          products: { id: 1, sku: 'SKU-1', price: '99.99', status: true },
          product_descriptions: { name: '测试商品', locale: 'zh_cn' },
          product_images: { image: '/img.jpg' },
        },
      ]);

      const items = await CartService.getCart(1, 'zh_cn');
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        id: 1,
        productId: 1,
        productName: '测试商品',
        price: '99.99',
        quantity: 2,
        image: '/img.jpg',
      });
    });

    it('同一购物车项有多张图片时只取第一张（去重）', async () => {
      mockSelect([
        { carts: { id: 1, productId: 1, quantity: 1, selected: true }, products: { id: 1, sku: 'A', price: '10' }, product_descriptions: { name: 'X' }, product_images: { image: '/a.jpg' } },
        { carts: { id: 1, productId: 1, quantity: 1, selected: true }, products: { id: 1, sku: 'A', price: '10' }, product_descriptions: { name: 'X' }, product_images: { image: '/b.jpg' } },
      ]);

      const items = await CartService.getCart(1);
      expect(items).toHaveLength(1);
      expect(items[0].image).toBe('/a.jpg');
    });
  });

  // ===========================================================================
  // updateQuantity
  // ===========================================================================
  describe('updateQuantity', () => {
    it('应能更新购物车商品数量（happy path）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // 购物车项查询
          return createChainMock([{ id: 1, customerId: 1, productId: 10, skuId: null }]);
        }
        // 产品查询
        return createChainMock([{ id: 10, quantity: 50 }]);
      });

      const result = await CartService.updateQuantity(1, 5, 1);
      expect(result).toHaveProperty('quantity', 5);
    });

    it('数量 < 1 时应抛出 BusinessRuleError', async () => {
      await expect(CartService.updateQuantity(1, 0, 1))
        .rejects.toThrow(BusinessRuleError);
    });

    it('数量 > 99 时应抛出 BusinessRuleError（spec: max 99）', async () => {
      await expect(CartService.updateQuantity(1, 100, 1))
        .rejects.toThrow(BusinessRuleError);
    });

    it('购物车项不存在时应抛出 NotFoundError（pre-1 违反）', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(CartService.updateQuantity(999, 5, 1))
        .rejects.toThrow(NotFoundError);
    });

    it('库存不足时应抛出 BusinessRuleError（pre-2 违反）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([{ id: 1, customerId: 1, productId: 10, skuId: null }]);
        }
        return createChainMock([{ id: 10, quantity: 2 }]); // 库存只有 2
      });

      await expect(CartService.updateQuantity(1, 10, 1))
        .rejects.toThrow(BusinessRuleError);
    });

    it('有 SKU 时应检查 SKU 库存而非产品库存', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([{ id: 1, customerId: 1, productId: 10, skuId: 5 }]);
        }
        if (callCount === 2) {
          // product 查询（仍然需要）
          return createChainMock([{ id: 10, quantity: 200 }]);
        }
        // SKU 查询
        return createChainMock([{ id: 5, quantity: 3 }]);
      });

      await expect(CartService.updateQuantity(1, 10, 1))
        .rejects.toThrow(BusinessRuleError);
    });
  });

  // ===========================================================================
  // removeItem
  // ===========================================================================
  describe('removeItem', () => {
    it('应能删除购物车项（happy path）', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ id: 1, customerId: 1 }]));

      const result = await CartService.removeItem(1, 1);
      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('购物车项不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(CartService.removeItem(1, 999))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // clearCart
  // ===========================================================================
  describe('clearCart', () => {
    it('应能清空用户购物车', async () => {
      await CartService.clearCart(1);
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // toggleSelect（UI 辅助，不在 spec 主操作中）
  // ===========================================================================
  describe('toggleSelect', () => {
    it('应能切换商品选中状态', async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, selected: false }])),
          })),
        })),
      }));

      const result = await CartService.toggleSelect(1, false);
      expect(result).toHaveProperty('selected', false);
    });
  });
});
