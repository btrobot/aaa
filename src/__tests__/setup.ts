import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 自动清理每个测试后的 DOM
afterEach(() => {
  cleanup();
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next-intl
vi.mock('next-intl', () => {
  const tMap: Record<string, string> = {
    'noReviews': '暂无评价',
    'writeReview': '写评价',
    'submitReview': '提交评价',
    'yourRating': '您的评分',
    'yourReview': '您的评价内容',
    'loginToReview': '请登录后评价',
    'reviewSubmitted': '评价提交成功',
    'reviewError': '评价提交失败',
    'averageRating': '平均评分',
    'totalReviews': '总评价数',
    'reviewLoading': '加载中...',
    'reviewEmpty': '暂无评价',
    'reviewSuccess': '评价已提交',
  };
  return {
    useTranslations: () => (key: string) => tMap[key] || key,
    useLocale: () => 'zh',
  };
});

vi.mock('next-intl/server', () => ({
  getTranslations: () => async (key: string) => key,
  getLocale: () => 'zh',
}));