import { I18nProvider } from '@/i18n/I18nProvider';
import { CurrencyProvider } from '@/i18n/CurrencyProvider';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SITE_URL = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://nodecoda.com';

function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <I18nProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </I18nProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

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
    <ClientProviders>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </ClientProviders>
  );
}