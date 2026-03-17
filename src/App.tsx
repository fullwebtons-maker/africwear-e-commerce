import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { getCategories } from './lib/db'
import { Category, Order } from './types'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CartDrawer from './components/shop/CartDrawer'

// Shop pages
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import TrackingPage from './pages/TrackingPage'

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCategories from './pages/admin/AdminCategories'

type ShopPage =
  | { name: 'home' }
  | { name: 'catalog'; categoryId?: string; search?: string }
  | { name: 'product'; slug: string }
  | { name: 'checkout' }
  | { name: 'confirmation'; order: Order }
  | { name: 'tracking'; orderNumber?: string }

type AdminPage = 'admin-login' | 'admin-dashboard' | 'admin-products' | 'admin-orders' | 'admin-categories'

const ADMIN_PAGES: AdminPage[] = ['admin-dashboard', 'admin-products', 'admin-orders', 'admin-categories']

export default function App() {
  const [shopPage, setShopPage] = useState<ShopPage>({ name: 'home' })
  const [adminPage, setAdminPage] = useState<AdminPage>('admin-login')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Check admin auth
    const adminAuth = localStorage.getItem('africwear_admin') === 'true'
    setIsAdmin(adminAuth)

    // Check if navigating to admin via URL hash or param
    if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
      setIsAdminMode(true)
    }

    getCategories().then(setCategories).catch(console.error)
  }, [])

  function navigateShop(page: string, params?: Record<string, string>) {
    if (page === 'home') setShopPage({ name: 'home' })
    else if (page === 'catalog') setShopPage({ name: 'catalog', categoryId: params?.categoryId, search: params?.search })
    else if (page === 'product') setShopPage({ name: 'product', slug: params?.slug || '' })
    else if (page === 'checkout') setShopPage({ name: 'checkout' })
    else if (page === 'tracking') setShopPage({ name: 'tracking', orderNumber: params?.orderNumber })
    else if (page === 'admin') {
      setIsAdminMode(true)
      setAdminPage(isAdmin ? 'admin-dashboard' : 'admin-login')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Admin mode
  if (isAdminMode) {
    if (!isAdmin || adminPage === 'admin-login') {
      return (
        <>
          <Toaster position="top-right" />
          <AdminLoginPage onLogin={() => { setIsAdmin(true); setAdminPage('admin-dashboard') }} />
        </>
      )
    }
    return (
      <>
        <Toaster position="top-right" />
        <AdminLayout
          currentPage={adminPage}
          onNavigate={(page) => {
            if (page === 'home') { setIsAdminMode(false) }
            else setAdminPage(page as AdminPage)
          }}
          onLogout={() => { setIsAdmin(false); setAdminPage('admin-login') }}
        >
          {adminPage === 'admin-dashboard' && <AdminDashboard onNavigate={p => setAdminPage(p as AdminPage)} />}
          {adminPage === 'admin-products' && <AdminProducts />}
          {adminPage === 'admin-orders' && <AdminOrders />}
          {adminPage === 'admin-categories' && <AdminCategories />}
        </AdminLayout>
      </>
    )
  }

  // Shop mode
  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {shopPage.name !== 'confirmation' && (
          <Navbar
            categories={categories}
            onNavigate={navigateShop}
            currentPage={shopPage.name}
          />
        )}

        <CartDrawer onCheckout={() => navigateShop('checkout')} />

        <main className="flex-1">
          {shopPage.name === 'home' && (
            <HomePage onNavigate={navigateShop} />
          )}
          {shopPage.name === 'catalog' && (
            <CatalogPage
              onNavigate={navigateShop}
              initialCategoryId={shopPage.categoryId}
              initialSearch={shopPage.search}
            />
          )}
          {shopPage.name === 'product' && (
            <ProductPage slug={shopPage.slug} onNavigate={navigateShop} />
          )}
          {shopPage.name === 'checkout' && (
            <CheckoutPage
              onNavigate={navigateShop}
              onOrderComplete={(order) => setShopPage({ name: 'confirmation', order })}
            />
          )}
          {shopPage.name === 'confirmation' && (
            <OrderConfirmationPage
              order={shopPage.order}
              onNavigate={navigateShop}
            />
          )}
          {shopPage.name === 'tracking' && (
            <TrackingPage initialOrderNumber={shopPage.orderNumber} />
          )}
        </main>

        {shopPage.name !== 'confirmation' && (
          <Footer onNavigate={navigateShop} />
        )}

        {/* Admin access button (hidden, accessible via footer click) */}
        <button
          onClick={() => setIsAdminMode(true)}
          className="fixed bottom-4 right-4 z-40 bg-primary/80 text-primary-foreground text-xs px-3 py-1.5 rounded-full opacity-20 hover:opacity-100 transition-opacity"
        >
          Admin
        </button>
      </div>
    </>
  )
}
