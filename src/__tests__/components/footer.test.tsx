import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Footer from '@/components/Footer';
import { renderWithProviders } from './test-utils';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Footer', () => {
  it('should render company logo and name', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('NodeCoda')).toBeDefined();
    expect(screen.getByText('N')).toBeDefined(); // Logo letter
  });

  it('should render company description', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('专业游乐设备制造商')).toBeDefined();
  });

  it('should render quick links section', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('快速链接')).toBeDefined();
    expect(screen.getByText('首页')).toBeDefined();
    expect(screen.getByText('产品中心')).toBeDefined();
    expect(screen.getByText('产品分类')).toBeDefined();
    expect(screen.getByText('品牌中心')).toBeDefined();
  });

  it('should render customer service section', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('客户服务')).toBeDefined();
    expect(screen.getByText('帮助中心')).toBeDefined();
    expect(screen.getByText('配送说明')).toBeDefined();
    expect(screen.getByText('退换政策')).toBeDefined();
    expect(screen.getByText('尺寸指南')).toBeDefined();
  });

  it('should render contact information', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('联系我们')).toBeDefined();
    expect(screen.getByText('中国广东省广州市')).toBeDefined();
    expect(screen.getByText('+86 400-888-8888')).toBeDefined();
    expect(screen.getByText('info@nodecoda.com')).toBeDefined();
  });

  it('should render social media links', () => {
    renderWithProviders(<Footer />);
    // Social media icons use first letter: F, T, I, Y
    expect(screen.getByLabelText('Facebook')).toBeDefined();
    expect(screen.getByLabelText('Twitter')).toBeDefined();
    expect(screen.getByLabelText('Instagram')).toBeDefined();
    expect(screen.getByLabelText('YouTube')).toBeDefined();
  });

  it('should render copyright and legal links', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/© 2026 NodeCoda/)).toBeDefined();
    expect(screen.getByText('隐私政策')).toBeDefined();
    expect(screen.getByText('服务条款')).toBeDefined();
  });

  it('should render all section headings', () => {
    renderWithProviders(<Footer />);
    const headings = ['快速链接', '客户服务', '联系我们'];
    headings.forEach((heading) => {
      expect(screen.getByText(heading)).toBeDefined();
    });
  });

  it('should have correct responsive grid layout', () => {
    const { container } = renderWithProviders(<Footer />);
    // 检查 grid 容器
    const grid = container.querySelector('.grid');
    expect(grid).toBeDefined();
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-4');
  });
});