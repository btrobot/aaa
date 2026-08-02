import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SITE_URL = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://nodecoda.com';

async function ClientProviders({ children, locale }: { children: React.ReactNode; locale: string }) {
  const messages = await getMessages();

  return (
    <AuthProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </AuthProvider>
  );
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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
    <ClientProviders locale={locale}>
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