import { I18nProvider } from '@/i18n/I18nProvider';
import { CartProvider } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <I18nProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </I18nProvider>
    </CartProvider>
  );
}