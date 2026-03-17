import { ShoppingBag, Tag } from 'lucide-react'
import { Product } from '../../types'
import { formatPrice } from '../../lib/db'

interface ProductCardProps {
  product: Product
  onClick: () => void
  onAddToCart?: () => void
}

export default function ProductCard({ product, onClick, onAddToCart }: ProductCardProps) {
  const image = product.images[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : 0

  return (
    <div className="group bg-card rounded-xl overflow-hidden border border-border card-hover cursor-pointer">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] bg-secondary" onClick={onClick}>
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercent}%
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
            Vedette
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart?.() }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 hover:bg-accent hover:text-accent-foreground"
        >
          <ShoppingBag className="w-4 h-4" />
          Voir le produit
        </button>
      </div>

      {/* Info */}
      <div className="p-3" onClick={onClick}>
        <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1">{product.name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.comparePrice!)}</span>
          )}
        </div>
        {product.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            <Tag className="w-3 h-3 text-muted-foreground" />
            {product.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
