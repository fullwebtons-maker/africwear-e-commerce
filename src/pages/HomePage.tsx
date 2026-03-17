import { useEffect, useState } from 'react'
import { ArrowRight, Package, Truck, Store, Star, ChevronRight } from 'lucide-react'
import { Product, Category } from '../types'
import { getProducts, getCategories, formatPrice } from '../lib/db'
import ProductCard from '../components/shop/ProductCard'

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [featured, setFeatured] = useState<Product[]>([])
  const [latest, setLatest] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [featuredProds, allProds, cats] = await Promise.all([
          getProducts({ featured: true, active: true }),
          getProducts({ active: true }),
          getCategories(),
        ])
        setFeatured(featuredProds.slice(0, 4))
        setLatest(allProds.slice(0, 8))
        setCategories(cats)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-primary">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 text-accent px-3 py-1.5 rounded-full text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5 fill-current" />
              Nouvelle Collection 2025
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6">
              La Mode<br />
              <span className="text-accent">Africaine</span><br />
              Redéfinie
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 leading-relaxed">
              Des collections prêt-à-porter qui célèbrent l'élégance africaine. 
              Tissus wax, bogolan et créations contemporaines pour femmes et hommes.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('catalog')}
                className="flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-full font-semibold hover:bg-accent/90 transition-all hover:scale-105"
              >
                Découvrir la collection
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('tracking')}
                className="flex items-center gap-2 border-2 border-primary-foreground/30 text-primary-foreground px-8 py-3.5 rounded-full font-semibold hover:bg-primary-foreground/10 transition-colors"
              >
                Suivre ma commande
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Truck, title: 'Livraison à domicile', desc: 'Partout en ville' },
              { icon: Store, title: 'Retrait en boutique', desc: 'Quartier du Commerce, Bamako' },
              { icon: Package, title: 'Paiement à la livraison', desc: 'Pas de paiement en ligne requis' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 py-2">
                <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold">Nos Catégories</h2>
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate('catalog', { categoryId: cat.id })}
                className="group bg-secondary hover:bg-accent/10 border border-border hover:border-accent/40 rounded-xl p-4 text-left transition-all duration-200"
              >
                <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center mb-3 group-hover:bg-accent/25 transition-colors">
                  <span className="text-lg">👗</span>
                </div>
                <p className="font-medium text-sm leading-tight">{cat.name}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold">Produits en Vedette</h2>
              <p className="text-muted-foreground mt-1">Nos meilleures sélections</p>
            </div>
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden border border-border animate-pulse">
                  <div className="aspect-[3/4] bg-muted" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((product) => (
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
      </section>

      {/* Banner CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-4xl font-bold mb-4">
            Commandez en toute <span className="text-accent">simplicité</span>
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-8 max-w-xl mx-auto">
            Sélectionnez vos articles, passez votre commande via WhatsApp et payez à la livraison. Simple, rapide et sans frais cachés.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-10 py-4 rounded-full font-semibold text-lg hover:bg-accent/90 transition-all hover:scale-105"
          >
            Commander maintenant
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Latest products */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold">Nouveautés</h2>
            <p className="text-muted-foreground mt-1">Les dernières arrivées</p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            Voir tout <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latest.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onNavigate('product', { slug: product.slug })}
                onAddToCart={() => onNavigate('product', { slug: product.slug })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
