import { useState } from 'react'
import { LayoutDashboard, Package, ShoppingCart, Tags, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: string
  onNavigate: (page: string) => void
  onLogout: () => void
}

const NAV_ITEMS = [
  { id: 'admin-dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'admin-products', label: 'Produits', icon: Package },
  { id: 'admin-orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'admin-categories', label: 'Catégories', icon: Tags },
]

export default function AdminLayout({ children, currentPage, onNavigate, onLogout }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    localStorage.removeItem('africwear_admin')
    toast.success('Déconnecté')
    onLogout()
  }

  const NavContent = () => (
    <>
      <div className="h-16 border-b border-border flex items-center px-5">
        <h1 className="font-serif text-xl font-bold">
          Afric<span className="text-accent">Wear</span>
        </h1>
        <span className="ml-2 text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onNavigate(id); setMobileOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${currentPage === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {currentPage === id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => { onNavigate('home'); setMobileOpen(false) }}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors mb-1"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Voir la boutique
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 h-screen flex-col border-r border-border bg-sidebar shrink-0">
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 flex flex-col border-r border-border bg-sidebar z-50 md:hidden">
            <NavContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 h-screen flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-sm md:text-base">
            {NAV_ITEMS.find(n => n.id === currentPage)?.label || 'Administration'}
          </h2>
          <div className="text-xs text-muted-foreground hidden sm:block">AfricWear Admin</div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
