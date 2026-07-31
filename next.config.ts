import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.dev.coze.site', '175.178.17.101'],
  images: {
    // 仅在开发环境禁用图片优化，生产环境启用优化以提升 LCP 和带宽
    unoptimized: isDev,
    // 生产环境配置远程图片域名白名单（按需添加）
    remotePatterns: isDev ? undefined : [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
