import { I18nProvider } from '@/i18n/I18nProvider';
import { CurrencyProvider } from '@/i18n/CurrencyProvider';
import { CartProvider } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SITE_URL = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://nodecoda.com';

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NodeCoda',
    url: SITE_URL,
    description: '游乐设备制造与跨境电商平台. Amusement ride manufacturing and cross-border e-commerce platform.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+86-400-888-9999',
      contactType: 'customer service',
      availableLanguage: ['Chinese', 'English'],
    },
  };

  return (
    <CurrencyProvider>
      <CartProvider>
        <I18nProvider>
          {/* JSON-LD 结构化数据 */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd),
            }}
          />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </CartProvider>
    </CurrencyProvider>
  );
}