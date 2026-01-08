// Google Analytics 4 (GA4) 및 Google Tag Manager (GTM) 설정

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''

// 페이지뷰 이벤트
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// 커스텀 이벤트
type GtagEvent = {
  action: string
  category: string
  label: string
  value?: number
}

export const event = ({ action, category, label, value }: GtagEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// E-commerce 이벤트
export const trackProductView = (product: {
  id: string
  name: string
  category: string
  price: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'KRW',
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
        },
      ],
    })
  }
}

export const trackAddToCart = (product: {
  id: string
  name: string
  category: string
  price: number
  quantity: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'KRW',
      value: product.price * product.quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: product.quantity,
        },
      ],
    })
  }
}

export const trackPurchase = (transaction: {
  transactionId: string
  value: number
  currency: string
  items: Array<{
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }>
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transaction.transactionId,
      value: transaction.value,
      currency: transaction.currency,
      items: transaction.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
      })),
    })
  }
}

export const trackSearch = (searchTerm: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
    })
  }
}

// GTM dataLayer push
export const pushToDataLayer = (data: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data)
  }
}

// TypeScript 타입 확장
declare global {
  interface Window {
    gtag: (
      type: 'config' | 'event' | 'js',
      id: string,
      config?: Record<string, unknown>
    ) => void
    dataLayer: Record<string, unknown>[]
  }
}
