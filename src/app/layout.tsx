import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'BeikeShop | 开源跨境电商平台',
    template: '%s | BeikeShop',
  },
  description:
    'BeikeShop - 开源跨境电商平台，支持多语言、多货币、多支付方式。Open-source cross-border e-commerce platform.',
  keywords: [
    '电商平台',
    '跨境电商',
    'BeikeShop',
    'e-commerce',
    'cross-border',
    'online store',
  ],
  authors: [{ name: 'BeikeShop' }],
  openGraph: {
    title: 'BeikeShop | 开源跨境电商平台',
    description:
      'BeikeShop - 开源跨境电商平台，支持多语言、多货币、多支付方式。',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}