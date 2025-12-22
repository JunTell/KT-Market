export interface Product {
  id: string
  name: string
  slug: string
  description: string
  longDescription?: string
  price: number
  originalPrice?: number
  currency: string
  category: string
  brand: string
  images: string[]
  thumbnail: string
  stock: number
  sku: string
  rating?: number
  reviewCount?: number
  specifications?: Record<string, string>
  features?: string[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  content: string
  images?: string[]
  helpful: number
  createdAt: string
  updatedAt: string
}
