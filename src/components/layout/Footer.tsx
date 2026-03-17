import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

interface FooterProps {
  onNavigate: (page: string) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-bold mb-3">
              Afric<span className="text-accent">Wear</span>
            </h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-4">
              La mode africaine prêt-à-porter. Des collections élégantes qui célèbrent la richesse culturelle du continent.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Navigation</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><button onClick={() => onNavigate('home')} className="hover:text-accent transition-colors">Accueil</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-accent transition-colors">Catalogue</button></li>
              <li><button onClick={() => onNavigate('tracking')} className="hover:text-accent transition-colors">Suivi de commande</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                <span>Bamako, Mali<br />Quartier du Commerce</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-accent" />
                <a href="tel:+22370000000" className="hover:text-accent transition-colors">+223 70 00 00 00</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-accent" />
                <a href="mailto:contact@africwear.ml" className="hover:text-accent transition-colors">contact@africwear.ml</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-primary-foreground/50">
          <p>© 2025 AfricWear. Tous droits réservés.</p>
          <p>Paiement à la livraison · Retrait en boutique</p>
        </div>
      </div>
    </footer>
  )
}
