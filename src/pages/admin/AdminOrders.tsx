import { useEffect, useState } from 'react'
import { MessageCircle, Printer, ChevronDown } from 'lucide-react'
import { Order, ORDER_STATUS } from '../../types'
import { getOrders, updateOrderStatus, formatPrice, buildWhatsAppLink } from '../../lib/db'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all')
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    try {
      const all = await getOrders()
      setOrders(all)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleStatusChange(id: string, status: Order['status']) {
    try {
      await updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
      toast.success('Statut mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold">Commandes</h1>
        <p className="text-muted-foreground text-sm">{orders.length} commande{orders.length > 1 ? 's' : ''} au total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'pending', label: 'En attente' },
          { key: 'confirmed', label: 'Confirmées' },
          { key: 'shipped', label: 'Expédiées' },
          { key: 'delivered', label: 'Livrées' },
          { key: 'cancelled', label: 'Annulées' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${filter === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {counts[key as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      <div className={`grid gap-5 ${selected ? 'lg:grid-cols-2' : ''}`}>
        {/* Orders list */}
        <div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
              <p>Aucune commande dans cette catégorie</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelected(order.id === selected?.id ? null : order)}
                  className={`bg-card border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md
                    ${selected?.id === order.id ? 'border-accent shadow-md' : 'border-border'}`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono font-semibold text-accent">{order.orderNumber}</p>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ORDER_STATUS[order.status].color}`}>
                          {ORDER_STATUS[order.status].label}
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">{formatPrice(order.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Quick status change */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {order.deliveryMode === 'pickup' ? '🏪 Retrait' : '🚚 Livraison'}
                    </div>
                    <select
                      value={order.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => { e.stopPropagation(); handleStatusChange(order.id, e.target.value as Order['status']) }}
                      className="text-xs border border-border rounded-lg px-2 py-1 bg-background"
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order detail */}
        {selected && (
          <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-24 h-fit">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Détail: {selected.orderNumber}</h3>
              <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground">Fermer</button>
            </div>
            <div className="p-5 space-y-5">
              {/* Customer */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Client</h4>
                <p className="font-medium">{selected.customerName}</p>
                <p className="text-sm text-muted-foreground">{selected.customerPhone}</p>
                {selected.customerAddress && <p className="text-sm text-muted-foreground">{selected.customerAddress}</p>}
                <p className="text-sm mt-1">{selected.deliveryMode === 'pickup' ? '🏪 Retrait en boutique' : '🚚 Livraison à domicile'}</p>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Articles</h4>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <img src={item.productImage} alt={item.productName} className="w-10 h-12 object-cover rounded shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">Taille: {item.size} · x{item.quantity}</p>
                        <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total</span><span>{formatPrice(selected.subtotal)}</span>
                </div>
                {selected.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span><span>-{formatPrice(selected.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span><span>{formatPrice(selected.total)}</span>
                </div>
              </div>

              {selected.notes && (
                <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
                  <p>{selected.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={buildWhatsAppLink(selected.orderNumber, selected.customerName, selected.items, selected.total, selected.deliveryMode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
