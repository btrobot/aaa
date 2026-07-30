import { describe, it, expect, vi, beforeEach } from 'vitest';

function createChainMock(resolvedValue: any) {
  const buildChain = (endValue: any) => {
    return new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: Function) => resolve(endValue);
        if (prop === 'catch') return (reject?: Function) => Promise.resolve(endValue);
        return () => buildChain(endValue);
      },
      apply(_, __, args) {
        return Promise.resolve(endValue);
      },
    });
  };
  return buildChain(resolvedValue);
}

const mockDb = {
  insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })),
  select: vi.fn(() => createChainMock([])),
  update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })) })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ rowCount: 1 })) })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

const { CartService } = await import('@/lib/services/cart.service');

describe('CartService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('addItem', () => {
    it('应能添加商品到购物车', async () => {
      mockDb.select.mockReturnValue(createChainMock([])); // 查询购物车中是否已有该商品

      const result = await CartService.addItem({ customerId: 1, productId: 1, skuId: 1, quantity: 2 });
      expect(result).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('应能更新已有商品数量', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ id: 1, quantity: 1 }])); // 购物车已有该商品

      const result = await CartService.addItem({ customerId: 1, productId: 1, quantity: 1 });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('getCart', () => {
    it('应返回用户的购物车列表', async () => {
      mockDb.select.mockReturnValue(createChainMock([
        { carts: { id: 1, productId: 1, quantity: 2, selected: true }, products: { id: 1, price: '99.99', status: true }, product_descriptions: { name: '测试商品', locale: 'zh_cn' } },
      ]));

      const items = await CartService.getCart(1, 'zh_cn');
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe('removeItem', () => {
    it('应能删除购物车项', async () => {
      const result = await CartService.removeItem(1, 1);
      expect(result).toBe(true);
    });
  });

  describe('clearCart', () => {
    it('应能清空用户购物车', async () => {
      await CartService.clearCart(1);
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    it('应能更新购物车商品数量', async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, quantity: 5, selected: true }])),
          })),
        })),
      }));

      const result = await CartService.updateQuantity(1, 5);
      expect(result).toHaveProperty('quantity', 5);
    });
  });

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