import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isDev = process.env.NODE_ENV === 'development';

const withNextIntl = createNextIntlPlugin();

let nextConfig: NextConfig = {
  allowedDevOrigins: ['*.dev.coze.site', '175.178.17.101'],
  serverExternalPackages: ['sharp'],
  images: {
    unoptimized: isDev,
    remotePatterns: isDev ? undefined : [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 安全头配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  // 请求体大小限制
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default withNextIntl(nextConfig);
