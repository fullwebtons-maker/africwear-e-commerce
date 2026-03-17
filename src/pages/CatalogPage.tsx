import { useEffect, useState } from 'react'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Product, Category } from '../types'
import { getProducts, getCategories, formatPrice } from '../lib/db'
import ProductCard from '../components/shop/ProductCard'

interface CatalogPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void
  initialCategoryId?: string
  initialSearch?: string
}

const PRICE_RANGES = [
  { label: 'Moins de 15 000 FCFA', min: 0, max: 15000 },
  { label: '15 000 – 30 000 FCFA', min: 15000, max: 30000 },
  { label: '30 000 – 50 000 FCFA', min: 30000, max: 50000 },
  { label: 'Plus de 50 000 FCFA', min: 50000, max: Infinity },
]

export default function CatalogPage({ onNavigate, initialCategoryId, initialSearch }: CatalogPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || '')
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState(initialSearch || '')
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.all([
          getProducts({ active: true }),
          getCategories(),
        ])
        setProducts(prods)
        setCategories(cats)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = products
    .filter((p) => {
      if (selectedCategory && p.categoryId !== selectedCategory) return false
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false
      if (selectedPriceRange !== null) {
        const range = PRICE_RANGES[selectedPriceRange]
        if (p.price < range.min || p.price > range.max) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  function clearFilters() {
    setSelectedCategory('')
    setSelectedPriceRange(null)
    setSelectedSizes([])
    setSearchQuery('')
  }

  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedPriceRange !== null ? 1 : 0) + (searchQuery ? 1 : 0)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="font-serif text-3xl font-bold mb-2">
            {selectedCategory
              ? categories.find(c => c.id === selectedCategory)?.name || 'Catalogue'
              : searchQuery
              ? `Résultats pour "${searchQuery}"`
              : 'Catalogue'}
          </h1>
          <p className="text-muted-foreground">{filtered.length} article{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar — desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold">Filtres</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1">
                    <X className="w-3 h-3" /> Effacer
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Recherche</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nom, description..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              {/* Categories */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Catégorie</label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="cat" checked={selectedCategory === ''} onChange={() => setSelectedCategory('')} className="accent-accent" />
                    <span className="text-sm group-hover:text-accent transition-colors">Toutes</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="cat" checked={selectedCategory === cat.id} onChange={() => setSelectedCategory(cat.id)} className="accent-accent" />
                      <span className="text-sm group-hover:text-accent transition-colors">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Prix</label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="price" checked={selectedPriceRange === null} onChange={() => setSelectedPriceRange(null)} className="accent-accent" />
                    <span className="text-sm group-hover:text-accent transition-colors">Tous les prix</span>
                  </label>
                  {PRICE_RANGES.map((range, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="price" checked={selectedPriceRange === i} onChange={() => setSelectedPriceRange(i)} className="accent-accent" />
                      <span className="text-sm group-hover:text-accent transition-colors">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">Trier par:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="newest">Nouveautés</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                </select>
              </div>
            </div>

            {/* Mobile filters */}
            {filterOpen && (
              <div className="lg:hidden bg-card border border-border rounded-xl p-5 mb-5 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Catégorie</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background"
                    >
                      <option value="">Toutes</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Prix</label>
                    <select
                      value={selectedPriceRange ?? ''}
                      onChange={(e) => setSelectedPriceRange(e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background"
                    >
                      <option value="">Tous</option>
                      {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="mt-3 text-xs text-accent underline">Effacer les filtres</button>
                )}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden border border-border animate-pulse">
                    <div className="aspect-[3/4] bg-muted" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">Aucun article trouvé</h3>
                <p className="text-sm mb-4">Essayez de modifier vos filtres de recherche</p>
                <button onClick={clearFilters} className="text-accent underline text-sm">Effacer les filtres</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onNavigate('product', { slug: product.slug })}
                    onAddToCart={() => onNavigate('product', { slug: product.slug })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
