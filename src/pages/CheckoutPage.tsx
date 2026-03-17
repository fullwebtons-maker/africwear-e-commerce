import { useState } from 'react'
import { ArrowLeft, MessageCircle, Truck, Store, Tag, Check } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { createOrder, validatePromoCode, generateOrderNumber, formatPrice, buildWhatsAppLink } from '../lib/db'
import { Order, Promotion } from '../types'
import toast from 'react-hot-toast'

interface CheckoutPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void
  onOrderComplete: (order: Order) => void
}

export default function CheckoutPage({ onNavigate, onOrderComplete }: CheckoutPageProps) {
  const { items, getTotal, clearCart } = useCartStore()
  const subtotal = getTotal()

  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' })
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery')
  const [promoCode, setPromoCode] = useState('')
  const [promo, setPromo] = useState<Promotion | null>(null)
  const [promoError, setPromoError] = useState('')
  const [loading, setLoading] = useState(false)
  const [promoLoading, setPromoLoading] = useState(false)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="font-serif text-2xl font-bold mb-2">Votre panier est vide</h2>
        <p className="text-muted-foreground mb-6">Ajoutez des articles avant de passer commande.</p>
        <button onClick={() => onNavigate('catalog')} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-accent hover:text-accent-foreground transition-colors">
          Voir le catalogue
        </button>
      </div>
    )
  }

  const discountAmount = promo
    ? promo.discountType === 'percent'
      ? Math.round(subtotal * promo.discountValue / 100)
      : promo.discountValue
    : 0
  const total = Math.max(0, subtotal - discountAmount)

  async function handlePromoCode() {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const result = await validatePromoCode(promoCode.trim())
      if (!result) {
        setPromoError('Code invalide ou expiré')
        setPromo(null)
      } else if (subtotal < result.minOrder) {
        setPromoError(`Commande minimum: ${formatPrice(result.minOrder)}`)
        setPromo(null)
      } else {
        setPromo(result)
        toast.success('Code promo appliqué !')
      }
    } catch (err) {
      setPromoError('Erreur lors de la vérification')
    } finally {
      setPromoLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Nom et téléphone requis')
      return
    }
    if (deliveryMode === 'delivery' && !form.address.trim()) {
      toast.error("Adresse de livraison requise")
      return
    }
    setLoading(true)
    try {
      const orderNumber = generateOrderNumber()
      const order = await createOrder({
        orderNumber,
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerAddress: form.address.trim() || undefined,
        deliveryMode,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          productImage: i.productImage,
          price: i.price,
          size: i.size,
          quantity: i.quantity,
        })),
        subtotal,
        discount: discountAmount,
        total,
        status: 'pending',
        notes: form.notes.trim() || undefined,
      })
      clearCart()
      toast.success('Commande créée avec succès !')
      onOrderComplete(order)
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la commande. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Continuer mes achats
        </button>

        <h1 className="font-serif text-3xl font-bold mb-8">Finaliser la commande</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            {/* Contact */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Vos informations</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nom complet *</label>
                  <input
                    required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Votre nom et prénom"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Téléphone *</label>
                  <input
                    required value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+223 70 00 00 00"
                    type="tel"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>
            </div>

            {/* Delivery mode */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Mode de réception</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMode === 'delivery' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                  <input type="radio" name="delivery" value="delivery" checked={deliveryMode === 'delivery'} onChange={() => setDeliveryMode('delivery')} className="mt-0.5 accent-accent" />
                  <div>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <Truck className="w-4 h-4 text-accent" /> Livraison à domicile
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Livraison dans Bamako et environs</p>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMode === 'pickup' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                  <input type="radio" name="delivery" value="pickup" checked={deliveryMode === 'pickup'} onChange={() => setDeliveryMode('pickup')} className="mt-0.5 accent-accent" />
                  <div>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <Store className="w-4 h-4 text-accent" /> Retrait en boutique
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Quartier du Commerce, Bamako</p>
                  </div>
                </label>
              </div>

              {deliveryMode === 'delivery' && (
                <div className="mt-4">
                  <label className="text-sm font-medium mb-1.5 block">Adresse de livraison *</label>
                  <textarea
                    required value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Quartier, rue, numéro..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Notes (optionnel)</h2>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Instructions spéciales pour votre commande..."
                rows={3}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-base hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Envoi en cours...</span>
              ) : (
                'Confirmer la commande'
              )}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Récapitulatif</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                    <img src={item.productImage} alt={item.productName} className="w-14 h-16 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Taille: {item.size} · Qté: {item.quantity}</p>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="border-t border-border pt-4 mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                      placeholder="Code promo"
                      className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePromoCode}
                    disabled={promoLoading}
                    className="px-3 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {promoLoading ? '...' : 'OK'}
                  </button>
                </div>
                {promoError && <p className="text-xs text-destructive mt-1">{promoError}</p>}
                {promo && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <Check className="w-3 h-3" /> Code appliqué: -{promo.discountType === 'percent' ? `${promo.discountValue}%` : formatPrice(promo.discountValue)}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Paiement à la livraison / en boutique</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
