import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

const SITE_URL = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://nodecoda.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NodeCoda | 游乐设备制造商 — Amusement Ride Manufacturer',
    template: '%s | NodeCoda',
  },
  description:
    'NodeCoda — 专业游乐设备制造商，为全球主题乐园、景区、文旅项目提供高品质游乐设施与整体解决方案。Leading amusement ride manufacturer for theme parks and attractions worldwide.',
  keywords: [
    '游乐设备',
    '主题乐园',
    '游乐设施',
    '游乐设备制造商',
    'NodeCoda',
    'amusement rides',
    'theme park',
    'roller coaster',
    'water park',
  ],
  authors: [{ name: 'NodeCoda', url: SITE_URL }],
  creator: 'NodeCoda',
  publisher: 'NodeCoda',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'NodeCoda',
    title: 'NodeCoda | 游乐设备制造商',
    description:
      '专业游乐设备制造商，为全球主题乐园提供高品质游乐设施与整体解决方案。',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NodeCoda | 游乐设备制造与跨境电商平台',
    description:
      '专业游乐设备制造与跨境电商平台，为全球主题乐园提供高品质游乐设施。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    languages: {
      'zh': `${SITE_URL}/zh`,
      'en': `${SITE_URL}/en`,
      'x-default': `${SITE_URL}/zh`,
    },
  },
  icons: {
    icon: '/favicon.ico',
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