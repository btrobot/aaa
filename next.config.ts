import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.dev.coze.site', '175.178.17.101'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
