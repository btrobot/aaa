import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { I18nContext } from '@/i18n/useTranslations';
import { CartContext } from '@/lib/cart-context';
import { CurrencyContext } from '@/i18n/CurrencyProvider';
import type { Locale } from '@/i18n/config';
import type { Currency } from '@/i18n/CurrencyProvider';

const defaultLocale: Locale = 'zh';
const defaultCurrency: Currency = 'CNY';

const mockT = (key: string) => {
  const map: Record<string, string> = {
    'nav.home': '首页',
    'nav.products': '产品中心',
    'nav.categories': '产品分类',
    'nav.brands': '品牌中心',
    'nav.news': '新闻资讯',
    'nav.about': '关于我们',
    'nav.account': '我的账户',
    'nav.orders': '我的订单',
    'nav.wishlist': '收藏夹',
    'nav.search': '搜索产品...',
    'nav.language': '语言',
    'site.title': 'NodeCoda',
    'product.writeReview': '写评价',
    'product.noReviews': '暂无评价',
    'writeReview': '写评价',
    'noReviews': '暂无评价',
    'footer.aboutDesc': '专业游乐设备制造商',
    'footer.quickLinks': '快速链接',
    'footer.customerService': '客户服务',
    'footer.contactInfo': '联系我们',
    'footer.helpCenter': '帮助中心',
    'footer.shippingInfo': '配送说明',
    'footer.returnPolicy': '退换政策',
    'footer.sizeGuide': '尺寸指南',
    'footer.address': '中国广东省广州市',
    'footer.phone': '+86 400-888-8888',
    'footer.email': 'info@nodecoda.com',
    'footer.copyright': '© 2026 NodeCoda. All rights reserved.',
    'footer.privacy': '隐私政策',
    'footer.terms': '服务条款',
  };
  return map[key] || key;
};

interface AllProvidersProps {
  children?: ReactNode;
  locale?: Locale;
  currency?: Currency;
  cartItems?: number;
  setLocale?: (locale: Locale) => void;
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
    <I18nContext.Provider value={{ locale, t: mockT, setLocale }}>
      <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice: (p: number | string) => `${p}`, convertPrice: (p: number | string) => typeof p === 'number' ? p : parseFloat(p), currencySymbol: '¥' }}>
        <CartContext.Provider
          value={{
            items: [],
            totalItems: cartItems,
            addItem: () => {},
            removeItem: () => {},
            updateQuantity: () => {},
            clearCart: () => {},
          }}
        >
          {children}
        </CartContext.Provider>
      </CurrencyContext.Provider>
    </I18nContext.Provider>
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