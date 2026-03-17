import { CheckCircle, MessageCircle, Package, Copy } from 'lucide-react'
import { Order, ORDER_STATUS } from '../types'
import { formatPrice, buildWhatsAppLink } from '../lib/db'
import toast from 'react-hot-toast'

interface OrderConfirmationPageProps {
  order: Order
  onNavigate: (page: string, params?: Record<string, string>) => void
}

export default function OrderConfirmationPage({ order, onNavigate }: OrderConfirmationPageProps) {
  const whatsappUrl = buildWhatsAppLink(
    order.orderNumber,
    order.customerName,
    order.items,
    order.total,
    order.deliveryMode
  )

  function copyOrderNumber() {
    navigator.clipboard.writeText(order.orderNumber)
    toast.success('Numéro de commande copié !')
  }

  return (
    <div className="min-h-screen bg-secondary/20 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-2">Commande confirmée !</h1>
          <p className="text-muted-foreground">Votre commande a été reçue avec succès.</p>
        </div>

        {/* Order number */}
        <div className="bg-card border border-border rounded-xl p-6 mb-5 text-center">
          <p className="text-sm text-muted-foreground mb-1">Numéro de commande</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-serif text-2xl font-bold text-accent">{order.orderNumber}</span>
            <button onClick={copyOrderNumber} className="p-1.5 hover:bg-secondary rounded-md transition-colors">
              <Copy className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Conservez ce numéro pour le suivi de votre commande</p>
        </div>

        {/* Order details */}
        <div className="bg-card border border-border rounded-xl p-6 mb-5">
          <h2 className="font-semibold mb-4">Détails de la commande</h2>
          <div className="space-y-3 mb-5">
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

          <div className="border-t border-border pt-4 space-y-2 text-sm">
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>Total à payer</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="bg-card border border-border rounded-xl p-6 mb-5">
          <h2 className="font-semibold mb-3">Informations de livraison</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Téléphone</span>
              <span className="font-medium">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span className="font-medium">{order.deliveryMode === 'pickup' ? 'Retrait en boutique' : 'Livraison à domicile'}</span>
            </div>
            {order.customerAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Adresse</span>
                <span className="font-medium text-right max-w-[200px]">{order.customerAddress}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Statut</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ORDER_STATUS[order.status].color}`}>
                {ORDER_STATUS[order.status].label}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Confirmer via WhatsApp
          </a>
          <button
            onClick={() => onNavigate('tracking', { orderNumber: order.orderNumber })}
            className="w-full flex items-center justify-center gap-3 border-2 border-border py-4 rounded-xl font-semibold hover:bg-secondary transition-colors"
          >
            <Package className="w-5 h-5" />
            Suivre ma commande
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="w-full py-4 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}
