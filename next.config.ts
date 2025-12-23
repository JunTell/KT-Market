import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ktmarket.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'd2ilcqjaeymypa.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  // 실험적 기능
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'zustand'],
  },
};

export default nextConfig;
