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
        // 카카오 프로필 이미지 CDN
        protocol: 'https',
        hostname: 'k.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 'img1.kakaocdn.net',
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
  // Turbopack 루트 명시 (workspace root 오탐 방지)
  turbopack: {
    root: __dirname,
  },
  // 실험적 기능
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'zustand'],
  },
};

export default nextConfig;
