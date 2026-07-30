import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '星乐游乐设备 | StarJoy Amusement Rides',
    template: '%s | 星乐游乐设备',
  },
  description:
    '全球领先的游乐设施制造商，专业从事游乐设施设计、研发、生产、销售与服务的综合性企业。Global leading amusement ride manufacturer.',
  keywords: [
    '游乐设施',
    '旋转木马',
    '过山车',
    '摩天轮',
    '碰碰车',
    '游乐设备',
    'amusement rides',
    'carousel',
    'roller coaster',
    'ferris wheel',
    'theme park equipment',
  ],
  authors: [{ name: 'StarJoy Amusement Rides' }],
  openGraph: {
    title: '星乐游乐设备 | 全球领先的游乐设施制造商',
    description:
      '专业设计、研发、生产各类游乐设施，为全球客户提供安全、创新、高品质的游乐体验',
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