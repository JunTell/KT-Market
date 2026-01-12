import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-tertiary/20 to-background py-20 sm:py-32">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-label-900 sm:text-6xl">
              프리미엄 상품을
              <br />
              합리적인 가격에
            </h1>
            <p className="mt-6 text-lg leading-8 text-label-700">
              KT Market에서 최고의 상품을 만나보세요.
              <br />
              다양한 카테고리의 엄선된 상품을 제공합니다.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/products"
                className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-secondary transition-colors"
              >
                상품 둘러보기
              </Link>
              <Link
                href="/about"
                className="text-sm font-semibold leading-6 text-label-900"
              >
                자세히 알아보기 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 카테고리 Section */}
      <section className="py-16 sm:py-24 bg-background-alt">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-label-900 sm:text-4xl">
              인기 카테고리
            </h2>
            <p className="mt-4 text-lg text-label-700">
              다양한 카테고리의 상품을 둘러보세요
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {['전자제품', '패션', '뷰티', '생활용품'].map((category) => (
              <Link
                key={category}
                href={`/products?category=${category}`}
                className="group relative overflow-hidden rounded-lg bg-background p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-label-900 group-hover:text-primary transition-colors">
                    {category}
                  </h3>
                  <p className="mt-2 text-sm text-label-700">
                    다양한 {category} 상품
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 특징 Section (기존과 동일하되 내부 div 구조 유지) */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <li>
              <FeatureItem
                title="품질 보장"
                desc="엄선된 프리미엄 상품만을 제공합니다"
                iconPath="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </li>
            <li>
              <FeatureItem
                title="빠른 배송"
                desc="신속하고 안전한 배송 서비스"
                iconPath="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </li>
            <li>
              <FeatureItem
                title="고객 지원"
                desc="24/7 고객 상담 서비스"
                iconPath="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
              />
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}

// 가독성을 위한 내부 컴포넌트 분리
function FeatureItem({ title, desc, iconPath }: { title: string, desc: string, iconPath: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-label-900">{title}</h3>
      <p className="mt-2 text-sm text-label-700">{desc}</p>
    </div>
  )
}