import { notFound } from 'next/navigation'

import { ProductDetail } from '@/src/features/product/components/ProductDetail'
import { generateProductSchema, generateBreadcrumbSchema } from '@/src/shared/lib/seo'
import type { Product } from '@/src/shared/types/product'

import type { Metadata } from 'next'

// 이것은 임시 데이터입니다. 실제로는 Supabase에서 가져와야 합니다.
async function getProduct(slug: string): Promise<Product | null> {
  // TODO: Supabase에서 상품 정보를 가져오는 로직
  // const { data, error } = await supabase
  //   .from('products')
  //   .select('*')
  //   .eq('slug', slug)
  //   .single()

  // 임시 데이터
  const mockProduct: Product = {
    id: '1',
    name: '프리미엄 무선 이어폰',
    slug: slug,
    description: '최고급 음질과 편안한 착용감을 자랑하는 프리미엄 무선 이어폰',
    longDescription: '이 프리미엄 무선 이어폰은 최신 블루투스 5.3 기술을 탑재하여 안정적인 연결과 뛰어난 음질을 제공합니다. 액티브 노이즈 캔슬링 기능으로 주변 소음을 효과적으로 차단하며, 최대 30시간의 재생 시간으로 장시간 사용이 가능합니다.',
    price: 149000,
    originalPrice: 199000,
    currency: 'KRW',
    category: '전자제품',
    brand: 'Premium Audio',
    images: [
      '/images/products/earphone-1.jpg',
      '/images/products/earphone-2.jpg',
      '/images/products/earphone-3.jpg',
    ],
    thumbnail: '/images/products/earphone-1.jpg',
    stock: 50,
    sku: 'PRD-001',
    rating: 4.5,
    reviewCount: 128,
    specifications: {
      '블루투스 버전': '5.3',
      '재생 시간': '최대 30시간',
      '충전 시간': '약 2시간',
      '무게': '50g',
      '방수 등급': 'IPX4',
    },
    features: [
      '액티브 노이즈 캔슬링',
      '블루투스 5.3',
      '30시간 재생',
      'IPX4 방수',
      '터치 컨트롤',
    ],
    tags: ['무선', '이어폰', '노이즈캔슬링', '블루투스'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return mockProduct
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: '상품을 찾을 수 없습니다',
    }
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.thumbnail,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.thumbnail],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const productSchema = generateProductSchema({
    name: product.name,
    description: product.description,
    image: product.thumbnail,
    price: product.price,
    currency: product.currency,
    sku: product.sku,
    brand: product.brand,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '홈', url: 'https://ktmarket.co.kr' },
    { name: product.category, url: `https://ktmarket.co.kr/products?category=${product.category}` },
    { name: product.name, url: `https://ktmarket.co.kr/products/${product.slug}` },
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <main className="flex-1">
        <ProductDetail product={product} />
      </main>
    </div>
  )
}
