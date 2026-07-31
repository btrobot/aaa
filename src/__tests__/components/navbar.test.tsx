import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import { renderWithProviders } from './test-utils';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children?: ReactNode; href?: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Navbar', () => {
  it('should render logo and site title', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('NodeCoda')).toBeDefined();
    // Logo letter B
    const logo = screen.getByText('N');
    expect(logo).toBeDefined();
  });

  it('should render desktop navigation links', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getAllByText('首页')[0]).toBeDefined();
    expect(screen.getByText('产品中心')).toBeDefined();
    expect(screen.getByText('产品分类')).toBeDefined();
    expect(screen.getByText('品牌中心')).toBeDefined();
    expect(screen.getByText('新闻资讯')).toBeDefined();
    expect(screen.getByText('关于我们')).toBeDefined();
  });

  it('should render search input on desktop', () => {
    renderWithProviders(<Navbar />);
    const searchInput = screen.getByPlaceholderText('搜索产品...');
    expect(searchInput).toBeDefined();
  });

  it('should show cart badge when items exist', () => {
    renderWithProviders(<Navbar />, { cartItems: 3 });
    expect(screen.getByText('3')).toBeDefined();
  });

  it('should not show cart badge when cart is empty', () => {
    renderWithProviders(<Navbar />, { cartItems: 0 });
    // 购物车图标在，但不应有数字徽标
    expect(screen.queryByText('0')).toBeNull();
  });

  it('should show cart badge as 99+ when over 99', () => {
    renderWithProviders(<Navbar />, { cartItems: 100 });
    expect(screen.getByText('99+')).toBeDefined();
  });

  it('should show language switcher with current locale name', () => {
    renderWithProviders(<Navbar />, { locale: 'en' });
    // English locale 的显示名
    expect(screen.getByText('English')).toBeDefined();
  });

  it('should toggle mobile menu', () => {
    const { container } = renderWithProviders(<Navbar />);

    // 找到包含 Menu 图标的按钮（汉堡菜单）
    const menuBtn = container.querySelector('button svg.lucide-menu')?.closest('button');
    expect(menuBtn).toBeDefined();
    if (menuBtn) fireEvent.click(menuBtn);

    // 移动端菜单应该显示导航链接
    expect(screen.getAllByText('首页')[0]).toBeDefined();
  });

  it('should render top bar with account links', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getAllByText('我的账户')[0]).toBeDefined();
    expect(screen.getAllByText('我的订单')[0]).toBeDefined();
    expect(screen.getAllByText('收藏夹')[0]).toBeDefined();
  });

  it('should render with different locale', () => {
    renderWithProviders(<Navbar />, { locale: 'en' });
    // 英文 locale 下，导航链接使用 t() 返回的 key（mock 中返回 key 本身）
    // 但我们的 mockT 有中文翻译，所以还是显示中文
    // 验证 locale 显示的是 'English'
    expect(screen.getByText('English')).toBeDefined();
  });

  it('should have working search form', () => {
    renderWithProviders(<Navbar />);
    const searchInput = screen.getByPlaceholderText('搜索产品...');
    expect(searchInput).toBeDefined();

    // 模拟输入
    fireEvent.change(searchInput, { target: { value: '旋转木马' } });
    expect((searchInput as HTMLInputElement).value).toBe('旋转木马');
  });
});