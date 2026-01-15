'use client'

import Image from 'next/image'
import { useState } from 'react'

import type { Product } from '@/src/shared/types/product'

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    // TODO: 장바구니에 추가하는 로직 구현
    console.log('장바구니에 추가:', product.id, quantity)
  }

  const handleBuyNow = () => {
    // TODO: 바로 구매하는 로직 구현
    console.log('바로 구매:', product.id, quantity)
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <a href="/" className="text-label-700 hover:text-label-900">
              홈
            </a>
          </li>
          <li className="text-label-500">/</li>
          <li>
            <a
              href={`/products?category=${product.category}`}
              className="text-label-700 hover:text-label-900"
            >
              {product.category}
            </a>
          </li>
          <li className="text-label-500">/</li>
          <li className="text-label-900">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 이미지 갤러리 */}
        <div>
          <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-background-alt">
            <Image
              src={product.images[selectedImage] || product.thumbnail}
              alt={product.name}
              width={600}
              height={600}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden rounded-md border-2 ${selectedImage === index
                    ? 'border-primary'
                    : 'border-line-200 hover:border-line-400'
                  }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={150}
                  height={150}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-label-700">{product.brand}</span>
            {product.rating && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-label-900">★ {product.rating}</span>
                {product.reviewCount && (
                  <span className="text-sm text-label-500">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>

          <h1 className="mb-4 text-3xl font-bold text-label-900">
            {product.name}
          </h1>

          <p className="mb-6 text-label-700">{product.description}</p>

          {/* 가격 */}
          <div className="mb-6 border-y border-line-200 py-6">
            <div className="flex items-baseline gap-3">
              {product.originalPrice && (
                <>
                  <span className="text-2xl font-bold text-status-error">
                    {discountPercentage}%
                  </span>
                  <span className="text-sm text-label-500 line-through">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                </>
              )}
            </div>
            <div className="mt-2 text-3xl font-bold text-label-900">
              {product.price.toLocaleString()}원
            </div>
          </div>

          {/* 옵션 */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-label-700">수량</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-line-200 hover:bg-background-alt"
                >
                  -
                </button>
                <span className="w-12 text-center text-label-900">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-line-200 hover:bg-background-alt"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-label-700">재고</span>
              <span className="text-sm text-label-900">
                {product.stock > 0 ? `${product.stock}개 남음` : '품절'}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="mt-auto space-y-3">
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full rounded-md bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-secondary transition-colors disabled:bg-status-disable disabled:cursor-not-allowed"
            >
              바로 구매
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full rounded-md border border-primary px-6 py-3 text-base font-semibold text-primary hover:bg-tertiary/10 transition-colors disabled:border-status-disable disabled:text-status-disable disabled:cursor-not-allowed"
            >
              장바구니 담기
            </button>
          </div>
        </div>
      </div>

      {/* 상세 정보 탭 */}
      <div className="mt-16">
        <div className="border-b border-line-200">
          <div className="flex gap-8">
            <button className="border-b-2 border-primary px-4 py-4 text-sm font-semibold text-label-900">
              상세 정보
            </button>
            <button className="px-4 py-4 text-sm font-medium text-label-700 hover:text-label-900">
              리뷰 ({product.reviewCount || 0})
            </button>
            <button className="px-4 py-4 text-sm font-medium text-label-700 hover:text-label-900">
              배송/교환/반품
            </button>
          </div>
        </div>

        <div className="py-8">
          {/* 상세 설명 */}
          {product.longDescription && (
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-semibold text-label-900">
                제품 설명
              </h3>
              <p className="text-label-700 leading-relaxed whitespace-pre-line">
                {product.longDescription}
              </p>
            </div>
          )}

          {/* 주요 기능 */}
          {product.features && product.features.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-semibold text-label-900">
                주요 기능
              </h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-primary">✓</span>
                    <span className="text-label-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 제품 사양 */}
          {product.specifications && (
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-semibold text-label-900">
                제품 사양
              </h3>
              <div className="overflow-hidden rounded-lg border border-line-200">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specifications).map(
                      ([key, value], index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? 'bg-background-alt' : ''}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-label-700 w-1/3">
                            {key}
                          </td>
                          <td className="px-4 py-3 text-sm text-label-900">
                            {value}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
