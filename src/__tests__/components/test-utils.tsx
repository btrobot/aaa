import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { CartContext } from '@/lib/cart-context';
import { CurrencyContext } from '@/i18n/CurrencyProvider';
import type { Currency } from '@/i18n/CurrencyProvider';

const defaultLocale = 'zh';
const defaultCurrency: Currency = 'CNY';

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
    wishlist: '收藏夹',
    search: '搜索产品...',
    language: '语言',
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
    customerService: '客户服务',
    contactInfo: '联系我们',
    helpCenter: '帮助中心',
    shippingInfo: '配送说明',
    returnPolicy: '退换政策',
    sizeGuide: '尺寸指南',
    address: '中国广东省广州市',
    phone: '+86 400-888-8888',
    email: 'info@nodecoda.com',
    copyright: '© 2026 NodeCoda. All rights reserved.',
    privacy: '隐私政策',
    terms: '服务条款',
  },
};

interface AllProvidersProps {
  children?: ReactNode;
  locale?: string;
  currency?: Currency;
  cartItems?: number;
  setLocale?: (locale: string) => void;
  setCurrency?: (currency: Currency) => void;
}

export function AllProviders({
  children,
  locale = defaultLocale,
  currency = defaultCurrency,
  cartItems = 0,
  setLocale = () => {},
  setCurrency = () => {},
}: AllProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={mockMessages} timeZone="Asia/Shanghai">
      <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice: (p: number | string) => `${p}`, convertPrice: (p: number | string) => typeof p === 'number' ? p : parseFloat(p), currencySymbol: '¥' }}>
        <CartContext.Provider
          value={{
            items: [],
            totalItems: cartItems,
            loading: false,
            refreshCart: async () => {},
          }}
        >
          {children}
        </CartContext.Provider>
      </CurrencyContext.Provider>
    </NextIntlClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'> & AllProvidersProps
) {
  const { locale, currency, cartItems, setLocale, setCurrency, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders
        locale={locale}
        currency={currency}
        cartItems={cartItems}
        setLocale={setLocale}
        setCurrency={setCurrency}
      >
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}