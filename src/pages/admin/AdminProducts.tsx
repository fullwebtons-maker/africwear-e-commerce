import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, Eye, EyeOff, Star } from 'lucide-react'
import { Product, Category, SIZES } from '../../types'
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, upsertProductVariants, getProductVariants, formatPrice } from '../../lib/db'
import toast from 'react-hot-toast'

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: string
  comparePrice: string
  categoryId: string
  images: string
  tags: string
  isFeatured: boolean
  isActive: boolean
  variants: { size: string; stock: string }[]
}

const emptyForm = (): ProductFormData => ({
  name: '', slug: '', description: '', price: '', comparePrice: '',
  categoryId: '', images: '', tags: '', isFeatured: false, isActive: true,
  variants: SIZES.map(s => ({ size: s, stock: '0' })),
})

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductFormData>(emptyForm())
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()])
      setProducts(prods)
      setCategories(cats)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  function slugify(str: string) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleEdit(product: Product) {
    const variants = await getProductVariants(product.id)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: String(product.price),
      comparePrice: product.comparePrice ? String(product.comparePrice) : '',
      categoryId: product.categoryId || '',
      images: product.images.join('\n'),
      tags: product.tags.join(', '),
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      variants: SIZES.map(s => ({
        size: s,
        stock: String(variants.find(v => v.size === s)?.stock ?? 0),
      })),
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.price.trim()) {
      toast.error('Nom et prix requis')
      return
    }
    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        slug: form.slug || slugify(form.name),
        description: form.description.trim(),
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        categoryId: form.categoryId || undefined,
        images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      }
      const variants = form.variants.map(v => ({ size: v.size, stock: parseInt(v.stock) || 0 }))

      if (editingId) {
        await updateProduct(editingId, data)
        await upsertProductVariants(editingId, variants)
        toast.success('Produit mis à jour')
      } else {
        const created = await createProduct(data)
        await upsertProductVariants(created.id, variants)
        toast.success('Produit créé')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm())
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return
    try {
      await deleteProduct(id)
      toast.success('Produit supprimé')
      await loadData()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Produits</h1>
          <p className="text-muted-foreground text-sm">{products.length} produit{products.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm()); setEditingId(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-background w-full max-w-2xl rounded-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-xl font-bold">{editingId ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nom *</label>
                  <input required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Slug</label>
                  <input value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Prix (FCFA) *</label>
                  <input required type="number" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Prix barré (FCFA)</label>
                  <input type="number" value={form.comparePrice}
                    onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Catégorie</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30">
                  <option value="">-- Aucune catégorie --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Images (une URL par ligne)</label>
                <textarea value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                  rows={3} placeholder="https://example.com/image.jpg" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none font-mono" />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Tags (séparés par des virgules)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="wax, robe, élégant" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>

              {/* Variants / Stock */}
              <div>
                <label className="text-sm font-medium mb-2 block">Stock par taille</label>
                <div className="grid grid-cols-4 gap-2">
                  {form.variants.map((v, i) => (
                    <div key={v.size}>
                      <label className="text-xs text-muted-foreground block mb-1 text-center">{v.size}</label>
                      <input type="number" min="0" value={v.stock}
                        onChange={e => setForm(f => ({
                          ...f,
                          variants: f.variants.map((vv, j) => j === i ? { ...vv, stock: e.target.value } : vv)
                        }))}
                        className="w-full px-2 py-2 border border-border rounded-lg text-sm bg-background text-center focus:outline-none focus:ring-2 focus:ring-accent/30" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="accent-accent w-4 h-4" />
                  <span className="text-sm font-medium">Produit vedette</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-accent w-4 h-4" />
                  <span className="text-sm font-medium">Actif (visible)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-border rounded-xl hover:bg-secondary transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Produit</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Prix</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Catégorie</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="text-right px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.images[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&q=60'}
                          alt={product.name}
                          className="w-10 h-12 object-cover rounded-lg shrink-0" />
                        <div>
                          <p className="font-medium flex items-center gap-1.5">
                            {product.name}
                            {product.isFeatured && <Star className="w-3 h-3 text-accent fill-current" />}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold">{formatPrice(product.price)}</p>
                      {product.comparePrice && <p className="text-xs text-muted-foreground line-through">{formatPrice(product.comparePrice)}</p>}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {categories.find(c => c.id === product.categoryId)?.name || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.isActive ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
