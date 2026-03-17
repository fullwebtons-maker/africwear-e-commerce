export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  createdAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  size: string
  stock: number
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  categoryId?: string
  images: string[]
  tags: string[]
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Joined
  category?: Category
  variants?: ProductVariant[]
}

export interface CartItem {
  productId: string
  productName: string
  productImage: string
  price: number
  size: string
  quantity: number
}

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  price: number
  size: string
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  deliveryMode: 'delivery' | 'pickup'
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Promotion {
  id: string
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  minOrder: number
  isActive: boolean
  expiresAt?: string
  createdAt: string
}

export const SIZES = ['S', 'M', 'L', 'XL'] as const
export type Size = typeof SIZES[number]

export const ORDER_STATUS = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
} as const

// WhatsApp number for the store
export const WHATSAPP_NUMBER = '22370000000' // Replace with real number
export const STORE_NAME = 'AfricWear'
export const STORE_ADDRESS = 'Bamako, Mali'
