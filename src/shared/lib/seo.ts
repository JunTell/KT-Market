import type { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  metadataBase: new URL('https://ktmarket.co.kr'),
  title: {
    default: 'KT Market - 프리미엄 상품 마켓플레이스',
    template: '%s | KT Market',
  },
  description:
    'KT Market에서 최고의 상품을 만나보세요. 다양한 카테고리의 프리미엄 상품을 합리적인 가격에 제공합니다.',
  keywords: ['KT Market', 'KT마켓', '온라인 쇼핑', '마켓플레이스', '프리미엄 상품'],
  authors: [{ name: 'KT Market' }],
  creator: 'KT Market',
  publisher: 'KT Market',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://ktmarket.co.kr',
    title: 'KT Market - 프리미엄 상품 마켓플레이스',
    description:
      'KT Market에서 최고의 상품을 만나보세요. 다양한 카테고리의 프리미엄 상품을 합리적인 가격에 제공합니다.',
    siteName: 'KT Market',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KT Market',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KT Market - 프리미엄 상품 마켓플레이스',
    description:
      'KT Market에서 최고의 상품을 만나보세요. 다양한 카테고리의 프리미엄 상품을 합리적인 가격에 제공합니다.',
    images: ['/og-image.png'],
    creator: '@ktmarket',
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
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

// JSON-LD 스키마 생성 헬퍼
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KT Market',
    url: 'https://ktmarket.co.kr',
    logo: 'https://ktmarket.co.kr/logo.png',
    description: 'KT Market - 프리미엄 상품 마켓플레이스',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+82-1234-5678',
      contactType: 'Customer Service',
      areaServed: 'KR',
      availableLanguage: 'Korean',
    },
    sameAs: [
      'https://www.facebook.com/ktmarket',
      'https://www.instagram.com/ktmarket',
      'https://twitter.com/ktmarket',
    ],
  }
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KT Market',
    url: 'https://ktmarket.co.kr',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://ktmarket.co.kr/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateProductSchema(product: {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  availability?: string
  sku?: string
  brand?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku || '',
    brand: {
      '@type': 'Brand',
      name: product.brand || 'KT Market',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'KRW',
      availability: product.availability || 'https://schema.org/InStock',
      url: `https://ktmarket.co.kr/products/${product.sku}`,
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
