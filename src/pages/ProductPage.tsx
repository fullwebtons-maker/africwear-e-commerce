import { useEffect, useState } from 'react'
import { ArrowLeft, ShoppingBag, Check, ChevronLeft, ChevronRight, Star, Truck, Store } from 'lucide-react'
import { Product, ProductVariant, SIZES } from '../types'
import { getProductBySlug, getProductVariants, formatPrice } from '../lib/db'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

interface ProductPageProps {
  slug: string
  onNavigate: (page: string, params?: Record<string, string>) => void
}

export default function ProductPage({ slug, onNavigate }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [added, setAdded] = useState(false)

  const { addItem, openCart } = useCartStore()

  useEffect(() => {
    async function load() {
      try {
        const [prod, vars] = await Promise.all([
          getProductBySlug(slug),
          getProductBySlug(slug).then(p => p ? getProductVariants(p.id) : []),
        ])
        setProduct(prod)
        setVariants(vars)
        if (vars.length > 0) {
          const inStock = vars.find(v => v.stock > 0)
          if (inStock) setSelectedSize(inStock.size)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-muted rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground">Produit introuvable.</p>
        <button onClick={() => onNavigate('catalog')} className="mt-4 text-accent underline">Retour au catalogue</button>
      </div>
    )
  }

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80']

  const selectedVariant = variants.find(v => v.size === selectedSize)
  const stockCount = selectedVariant?.stock ?? 0
  const hasDiscount = product.comparePrice && product.comparePrice > product.price

  function handleAddToCart() {
    if (!selectedSize) {
      toast.error('Veuillez sélectionner une taille')
      return
    }
    if (stockCount === 0) {
      toast.error('Taille épuisée')
      return
    }
    addItem({
      productId: product!.id,
      productName: product!.name,
      productImage: images[0],
      price: product!.price,
      size: selectedSize,
      quantity,
    })
    setAdded(true)
    toast.success('Ajouté au panier !')
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/5] bg-secondary rounded-2xl overflow-hidden">
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 rounded-full flex items-center justify-center shadow hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 rounded-full flex items-center justify-center shadow hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-full">
                  -{Math.round((1 - product.price / product.comparePrice!) * 100)}%
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-accent' : 'border-border'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {product.isFeatured && (
              <div className="inline-flex items-center gap-1.5 bg-accent/15 text-accent text-sm font-medium px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-current" /> Coup de coeur
              </div>
            )}
            <h1 className="font-serif text-3xl font-bold leading-tight">{product.name}</h1>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.comparePrice!)}</span>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm">Taille</span>
                {selectedSize && <span className="text-sm text-muted-foreground">Sélectionnée: {selectedSize}</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map((size) => {
                  const variant = variants.find(v => v.size === size)
                  const inStock = variant ? variant.stock > 0 : false
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      disabled={!inStock}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-xl border-2 text-sm font-semibold transition-all
                        ${isSelected ? 'border-primary bg-primary text-primary-foreground' : ''}
                        ${!isSelected && inStock ? 'border-border hover:border-accent hover:text-accent' : ''}
                        ${!inStock ? 'border-border text-muted-foreground opacity-40 cursor-not-allowed line-through' : ''}
                      `}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              {selectedVariant && (
                <p className="text-xs text-muted-foreground mt-2">
                  {stockCount > 5 ? 'En stock' : stockCount > 0 ? `Seulement ${stockCount} restant(s)` : 'Épuisé'}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <span className="font-semibold text-sm block mb-3">Quantité</span>
              <div className="flex items-center gap-1 border border-border rounded-xl w-fit overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">-</button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(stockCount, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">+</button>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || stockCount === 0}
              className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all
                ${added ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground'}
                ${(!selectedSize || stockCount === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
              `}
            >
              {added ? (
                <><Check className="w-5 h-5" /> Ajouté au panier !</>
              ) : (
                <><ShoppingBag className="w-5 h-5" /> Ajouter au panier</>
              )}
            </button>

            {/* Delivery info */}
            <div className="bg-secondary/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-accent/15 rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Livraison à domicile</p>
                  <p className="text-muted-foreground text-xs">Bamako et environs</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-accent/15 rounded-full flex items-center justify-center">
                  <Store className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Retrait en boutique</p>
                  <p className="text-muted-foreground text-xs">Quartier du Commerce, Bamako</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
