import { useState } from 'react'
import { Package, Search, CheckCircle, Clock, Truck, Store, XCircle } from 'lucide-react'
import { Order, ORDER_STATUS } from '../types'
import { getOrderByNumber, formatPrice } from '../lib/db'
import toast from 'react-hot-toast'

interface TrackingPageProps {
  initialOrderNumber?: string
}

const STATUS_STEPS = [
  { key: 'pending', label: 'En attente', icon: Clock },
  { key: 'confirmed', label: 'Confirmée', icon: CheckCircle },
  { key: 'shipped', label: 'Expédiée', icon: Truck },
  { key: 'delivered', label: 'Livrée', icon: Package },
]

export default function TrackingPage({ initialOrderNumber }: TrackingPageProps) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!orderNumber.trim()) return
    setLoading(true)
    setNotFound(false)
    setOrder(null)
    try {
      const result = await getOrderByNumber(orderNumber.trim().toUpperCase())
      if (!result) {
        setNotFound(true)
      } else {
        setOrder(result)
      }
    } catch (err) {
      toast.error('Erreur lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order
    ? order.status === 'cancelled'
      ? -1
      : STATUS_STEPS.findIndex(s => s.key === order.status)
    : -1

  return (
    <div className="min-h-screen">
      <div className="bg-secondary/50 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/15 rounded-full mb-4">
            <Package className="w-7 h-7 text-accent" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-2">Suivi de commande</h1>
          <p className="text-muted-foreground">Entrez votre numéro de commande pour suivre son statut</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="Ex: AW251401-1234"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Recherche...
              </span>
            ) : 'Rechercher'}
          </button>
        </form>

        {/* Not found */}
        {notFound && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center animate-fade-in">
            <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Commande introuvable</h3>
            <p className="text-sm text-muted-foreground">Vérifiez le numéro et réessayez. Le format est: AWYYMMDD-XXXX</p>
          </div>
        )}

        {/* Order found */}
        {order && (
          <div className="animate-fade-in space-y-5">
            {/* Status header */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Commande</p>
                  <p className="font-serif text-2xl font-bold text-accent">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-sm font-semibold px-4 py-2 rounded-full ${ORDER_STATUS[order.status].color}`}>
                  {ORDER_STATUS[order.status].label}
                </span>
              </div>

              {/* Progress steps */}
              {order.status !== 'cancelled' && (
                <div className="mt-6">
                  <div className="flex items-center">
                    {STATUS_STEPS.map((step, i) => {
                      const isCompleted = i <= currentStepIndex
                      const isCurrent = i === currentStepIndex
                      const Icon = step.icon
                      return (
                        <div key={step.key} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'} ${isCurrent ? 'ring-4 ring-green-500/20' : ''}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <p className={`text-xs mt-1 font-medium text-center max-w-[70px] ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${i < currentStepIndex ? 'bg-green-500' : 'bg-border'}`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="mt-4 flex items-center gap-2 text-destructive">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Cette commande a été annulée</span>
                </div>
              )}
            </div>

            {/* Order items */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Articles commandés</h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <img src={item.productImage} alt={item.productName} className="w-14 h-16 object-cover rounded-lg shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Taille: {item.size} · Qté: {item.quantity}</p>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Delivery info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-3">Livraison</h3>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent/15 rounded-full flex items-center justify-center shrink-0">
                  {order.deliveryMode === 'pickup'
                    ? <Store className="w-4 h-4 text-accent" />
                    : <Truck className="w-4 h-4 text-accent" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{order.deliveryMode === 'pickup' ? 'Retrait en boutique' : 'Livraison à domicile'}</p>
                  {order.customerAddress && <p className="text-xs text-muted-foreground">{order.customerAddress}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info box */}
        {!order && !notFound && (
          <div className="bg-secondary/50 border border-border rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Votre numéro de commande vous a été communiqué après confirmation.<br />
              Il commence par <strong>AW</strong> suivi de la date et d'un code. <br />
              Exemple: <strong>AW251401-7832</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
