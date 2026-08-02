import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

const defaultLocale = 'zh';

const mockMessages = {
  nav: {
    home: '首页',
    products: '产品中心',
    categories: '产品分类',
    brands: '品牌中心',
    news: '新闻资讯',
    about: '关于我们',
    account: '我的账户',
    orders: '我的订单',
    search: '搜索产品...',
    language: '语言',
    inquiry: '询盘',
  },
  site: {
    title: 'NodeCoda',
  },
  product: {
    writeReview: '写评价',
    noReviews: '暂无评价',
  },
  writeReview: '写评价',
  noReviews: '暂无评价',
  footer: {
    aboutDesc: '专业游乐设备制造商',
    quickLinks: '快速链接',
    support: '支持',
    contactInfo: '联系我们',
    contactSales: '联系销售',
    technicalSupport: '技术支持',
    faq: '常见问题',
    address: '中国广东省广州市',
    phone: '+86 400-888-8888',
    email: 'sales@nodecoda.com',
    copyright: '© 2026 NodeCoda. All rights reserved.',
    privacy: '隐私政策',
    terms: '服务条款',
  },
};

interface AllProvidersProps {
  children?: ReactNode;
  locale?: string;
}

export function AllProviders({
  children,
  locale = defaultLocale,
}: AllProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={mockMessages} timeZone="Asia/Shanghai">
      {children}
    </NextIntlClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'> & { locale?: string }
) {
  const { locale, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders locale={locale}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}