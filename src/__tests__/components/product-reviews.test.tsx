import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductReviews } from '@/components/ProductReviews';
import { renderWithProviders } from './test-utils';

const mockReviews = {
  items: [
    {
      id: 1,
      productId: 1,
      customerId: 1,
      rating: 5,
      content: '非常好用的产品！',
      status: true,
      createdAt: '2026-07-30T10:00:00.000Z',
      customerName: '张三',
    },
    {
      id: 2,
      productId: 1,
      customerId: 2,
      rating: 4,
      content: '质量不错，物流很快',
      status: true,
      createdAt: '2026-07-29T10:00:00.000Z',
      customerName: '李四',
    },
  ],
  total: 2,
};

const mockStats = {
  average: 4.5,
  total: 2,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
};

describe('ProductReviews', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state initially', () => {
    // 模拟 fetch 永不完结，捕捉 loading 状态
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise(() => {}) // 永不 resolve
    );

    renderWithProviders(<ProductReviews productId={1} locale="zh_cn" />);
    expect(screen.getByText('加载评价...')).toBeDefined();
  });

  it('should show empty state when no reviews', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }),
          { status: 200 }
        )
      );

    renderWithProviders(<ProductReviews productId={1} locale="zh_cn" />);

    await waitFor(() => {
      expect(screen.getByText('暂无评价')).toBeDefined();
    });
  });

  it('should render reviews list with stats', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockReviews), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockStats), { status: 200 })
      );

    renderWithProviders(<ProductReviews productId={1} locale="zh_cn" />);

    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeDefined();
      expect(screen.getByText('2 条评价')).toBeDefined();
      expect(screen.getByText('非常好用的产品！')).toBeDefined();
      expect(screen.getByText('质量不错，物流很快')).toBeDefined();
      expect(screen.getByText('张三')).toBeDefined();
      expect(screen.getByText('李四')).toBeDefined();
    });
  });

  it('should show error state on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    renderWithProviders(<ProductReviews productId={1} locale="zh_cn" />);

    await waitFor(() => {
      expect(screen.getByText('加载评价失败')).toBeDefined();
    });
  });

  it('should allow submitting a new review', async () => {
    const user = userEvent.setup();

    // 第一阶段：加载空数据
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }),
          { status: 200 }
        )
      );

    renderWithProviders(<ProductReviews productId={1} locale="zh_cn" />);

    await waitFor(() => {
      expect(screen.getByText('暂无评价')).toBeDefined();
    });

    // 模拟提交 POST 成功 + 重新加载数据
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 3 }), { status: 201 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockReviews), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockStats), { status: 200 })
      );

    // 写评价内容
    const textarea = screen.getByPlaceholderText('分享您的使用体验...');
    await user.type(textarea, '新评价内容');

    // 点击提交
    const submitBtn = screen.getByText('提交评价');
    await user.click(submitBtn);

    await waitFor(() => {
      // 提交成功后应该重新加载显示评价
      expect(screen.getByText('非常好用的产品！')).toBeDefined();
    });
  });

  it('should render with English locale', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }),
          { status: 200 }
        )
      );

    renderWithProviders(<ProductReviews productId={1} locale="en" />);

    await waitFor(() => {
      // 英文环境下的 placeholder
      expect(screen.getByPlaceholderText('Share your experience...')).toBeDefined();
      // 提交按钮英文
      expect(screen.getByText('Submit Review')).toBeDefined();
    });
  });
});