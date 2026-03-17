import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

// Simple admin auth — in production use Blink auth
const ADMIN_CREDENTIALS = { email: 'admin@africwear.ml', password: 'africwear2025' }

interface AdminLoginPageProps {
  onLogin: () => void
}

export default function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('africwear_admin', 'true')
        toast.success('Connexion réussie !')
        onLogin()
      } else {
        toast.error('Identifiants incorrects')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-primary-foreground mb-1">
            Afric<span className="text-accent">Wear</span>
          </h1>
          <p className="text-primary-foreground/60 text-sm">Espace Administration</p>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-accent/15 rounded-full mb-6 mx-auto">
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <h2 className="font-serif text-xl font-bold text-center mb-6">Connexion Admin</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@africwear.ml"
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Se connecter'}
            </button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Démo: admin@africwear.ml / africwear2025
          </p>
        </div>
      </div>
    </div>
  )
}
