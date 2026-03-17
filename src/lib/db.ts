import { blink } from '../blink/client'
import { Product, Category, Order, ProductVariant, Promotion } from '../types'

// --- helpers ---
function parseJSON<T>(val: unknown, fallback: T): T {
  if (typeof val === 'string') {
    try { return JSON.parse(val) as T } catch { return fallback }
  }
  if (Array.isArray(val)) return val as unknown as T
  return fallback
}

function toProduct(raw: Record<string, unknown>): Product {
  return {
    id: raw.id as string,
    name: raw.name as string,
    slug: raw.slug as string,
    description: raw.description as string | undefined,
    price: Number(raw.price),
    comparePrice: raw.comparePrice ? Number(raw.comparePrice) : undefined,
    categoryId: raw.categoryId as string | undefined,
    images: parseJSON<string[]>(raw.images, []),
    tags: parseJSON<string[]>(raw.tags, []),
    isFeatured: Number(raw.isFeatured) > 0,
    isActive: Number(raw.isActive) > 0,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

function toOrder(raw: Record<string, unknown>): Order {
  return {
    id: raw.id as string,
    orderNumber: raw.orderNumber as string,
    customerName: raw.customerName as string,
    customerPhone: raw.customerPhone as string,
    customerAddress: raw.customerAddress as string | undefined,
    deliveryMode: raw.deliveryMode as 'delivery' | 'pickup',
    items: parseJSON(raw.items, []),
    subtotal: Number(raw.subtotal),
    discount: Number(raw.discount),
    total: Number(raw.total),
    status: raw.status as Order['status'],
    notes: raw.notes as string | undefined,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

// --- Categories ---
export async function getCategories(): Promise<Category[]> {
  const rows = await blink.db.categories.list({ orderBy: { name: 'asc' } })
  return rows as unknown as Category[]
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
  const id = `cat_${Date.now()}`
  const row = await blink.db.categories.create({ id, ...data, createdAt: new Date().toISOString() })
  return row as unknown as Category
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  await blink.db.categories.update(id, data)
}

export async function deleteCategory(id: string): Promise<void> {
  await blink.db.categories.delete(id)
}

// --- Products ---
export async function getProducts(filters?: {
  categoryId?: string
  featured?: boolean
  active?: boolean
  search?: string
}): Promise<Product[]> {
  const whereConditions: Record<string, unknown>[] = []
  if (filters?.categoryId) whereConditions.push({ categoryId: filters.categoryId })
  if (filters?.featured !== undefined) whereConditions.push({ isFeatured: filters.featured ? '1' : '0' })
  if (filters?.active !== undefined) whereConditions.push({ isActive: filters.active ? '1' : '0' })

  const where = whereConditions.length === 1
    ? whereConditions[0]
    : whereConditions.length > 1
    ? { AND: whereConditions }
    : undefined

  const rows = await blink.db.products.list({
    where: where as Parameters<typeof blink.db.products.list>[0]['where'],
    orderBy: { createdAt: 'desc' },
  })
  return (rows as unknown as Record<string, unknown>[]).map(toProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await blink.db.products.list({ where: { slug } as Record<string, unknown> })
  const raw = (rows as unknown as Record<string, unknown>[])[0]
  return raw ? toProduct(raw) : null
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const rows = await blink.db.productVariants.list({ where: { productId } as Record<string, unknown>, orderBy: { size: 'asc' } })
  return rows as unknown as ProductVariant[]
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const id = `prod_${Date.now()}`
  const now = new Date().toISOString()
  const row = await blink.db.products.create({
    id,
    ...data,
    images: JSON.stringify(data.images),
    tags: JSON.stringify(data.tags),
    isFeatured: data.isFeatured ? 1 : 0,
    isActive: data.isActive ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  })
  return toProduct(row as unknown as Record<string, unknown>)
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date().toISOString() }
  if (data.images) updateData.images = JSON.stringify(data.images)
  if (data.tags) updateData.tags = JSON.stringify(data.tags)
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured ? 1 : 0
  if (data.isActive !== undefined) updateData.isActive = data.isActive ? 1 : 0
  await blink.db.products.update(id, updateData)
}

export async function deleteProduct(id: string): Promise<void> {
  await blink.db.products.delete(id)
}

export async function upsertProductVariants(productId: string, variants: { size: string; stock: number }[]): Promise<void> {
  for (const v of variants) {
    const id = `var_${productId}_${v.size.toLowerCase()}`
    await blink.db.productVariants.upsert({ id, productId, size: v.size, stock: v.stock, createdAt: new Date().toISOString() })
  }
}

// --- Orders ---
export async function getOrders(): Promise<Order[]> {
  const rows = await blink.db.orders.list({ orderBy: { createdAt: 'desc' } })
  return (rows as unknown as Record<string, unknown>[]).map(toOrder)
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const rows = await blink.db.orders.list({ where: { orderNumber } as Record<string, unknown> })
  const raw = (rows as unknown as Record<string, unknown>[])[0]
  return raw ? toOrder(raw) : null
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const id = `ord_${Date.now()}`
  const now = new Date().toISOString()
  const row = await blink.db.orders.create({
    id,
    ...data,
    items: JSON.stringify(data.items),
    createdAt: now,
    updatedAt: now,
  })
  return toOrder(row as unknown as Record<string, unknown>)
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  await blink.db.orders.update(id, { status, updatedAt: new Date().toISOString() })
}

// --- Promotions ---
export async function validatePromoCode(code: string): Promise<Promotion | null> {
  const rows = await blink.db.promotions.list({ where: { code: code.toUpperCase(), isActive: '1' } as Record<string, unknown> })
  const raw = (rows as unknown as Record<string, unknown>[])[0]
  if (!raw) return null
  return {
    id: raw.id as string,
    code: raw.code as string,
    discountType: raw.discountType as 'percent' | 'fixed',
    discountValue: Number(raw.discountValue),
    minOrder: Number(raw.minOrder),
    isActive: Number(raw.isActive) > 0,
    expiresAt: raw.expiresAt as string | undefined,
    createdAt: raw.createdAt as string,
  }
}

export function generateOrderNumber(): string {
  const date = new Date()
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 9000) + 1000)
  return `AW${yy}${mm}${dd}-${rand}`
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(price) + ' FCFA'
}

export function buildWhatsAppLink(orderNumber: string, customerName: string, items: { productName: string; size: string; quantity: number; price: number }[], total: number, deliveryMode: string, phone?: string): string {
  const itemsList = items.map(i => `• ${i.productName} (${i.size}) x${i.quantity} — ${formatPrice(i.price * i.quantity)}`).join('\n')
  const mode = deliveryMode === 'pickup' ? 'Retrait en boutique' : 'Livraison à domicile'
  const msg = `*Commande AfricWear #${orderNumber}*\n\nBonjour! Je souhaite confirmer ma commande:\n\n${itemsList}\n\n*Total: ${formatPrice(total)}*\n*Mode: ${mode}*\n\nNom: ${customerName}`
  const WHATSAPP = '22370000000'
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`
}
