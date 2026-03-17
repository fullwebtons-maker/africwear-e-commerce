import { useEffect, useState } from 'react'
import { ShoppingCart, Package, TrendingUp, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { Order, ORDER_STATUS } from '../../types'
import { getOrders, getProducts, formatPrice } from '../../lib/db'

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ords, prods] = await Promise.all([getOrders(), getProducts()])
        setOrders(ords)
        setProductCount(prods.length)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length

  const stats = [
    { label: 'Commandes totales', value: orders.length, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'En attente', value: pendingOrders, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Livrées', value: deliveredOrders, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Produits actifs', value: productCount, icon: Package, color: 'bg-purple-50 text-purple-600' },
  ]

  const recentOrders = orders.slice(0, 8)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de votre boutique</p>
      </div>

      {/* Revenue card */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <span className="text-primary-foreground/70 text-sm">Chiffre d'affaires total</span>
        </div>
        {loading
          ? <div className="h-10 bg-primary-foreground/10 rounded-lg w-48 animate-pulse" />
          : <p className="font-serif text-4xl font-bold">{formatPrice(totalRevenue)}</p>
        }
        <p className="text-primary-foreground/50 text-xs mt-2">Commandes confirmées, expédiées et livrées</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            {loading
              ? <div className="h-8 bg-muted rounded w-16 animate-pulse mb-1" />
              : <p className="text-2xl font-bold">{value}</p>
            }
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Commandes récentes</h2>
          <button onClick={() => onNavigate('admin-orders')} className="text-sm text-accent hover:underline">Voir toutes</button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Commande</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Mode</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-accent font-medium">{order.orderNumber}</td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {order.deliveryMode === 'pickup'
                          ? <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">Boutique</span>
                          : <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Livraison</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS[order.status].color}`}>
                        {ORDER_STATUS[order.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
