import { useState } from 'react'
import { ShoppingBag, Search, Menu, X, ChevronDown } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { Category } from '../../types'

interface NavbarProps {
  categories: Category[]
  onNavigate: (page: string, params?: Record<string, string>) => void
  currentPage: string
}

export default function Navbar({ categories, onNavigate, currentPage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { getCount, openCart } = useCartStore()
  const count = getCount()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      onNavigate('catalog', { search: searchQuery.trim() })
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="font-serif text-2xl font-bold text-foreground tracking-tight"
          >
            Afric<span className="text-accent">Wear</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('catalog')}
              className={`text-sm font-medium transition-colors hover:text-accent ${currentPage === 'catalog' ? 'text-accent' : 'text-foreground'}`}
            >
              Catalogue
            </button>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent transition-colors">
                Catégories <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-52 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 z-50">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onNavigate('catalog', { categoryId: cat.id })}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-accent transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigate('tracking')}
              className={`text-sm font-medium transition-colors hover:text-accent ${currentPage === 'tracking' ? 'text-accent' : 'text-foreground'}`}
            >
              Suivi commande
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="py-3 border-t border-border">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un article..."
                className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Rechercher
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              <button onClick={() => { onNavigate('catalog'); setMobileOpen(false) }}
                className="text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors">
                Catalogue
              </button>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catégories</div>
              {categories.map((cat) => (
                <button key={cat.id}
                  onClick={() => { onNavigate('catalog', { categoryId: cat.id }); setMobileOpen(false) }}
                  className="text-left px-6 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
                  {cat.name}
                </button>
              ))}
              <button onClick={() => { onNavigate('tracking'); setMobileOpen(false) }}
                className="text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors">
                Suivi commande
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
