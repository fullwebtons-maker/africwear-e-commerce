import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { Category } from '../../types'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../lib/db'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadCats() }, [])

  async function loadCats() {
    try {
      const cats = await getCategories()
      setCategories(cats)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  function slugify(str: string) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSaveNew(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await createCategory({
        name: form.name.trim(),
        slug: form.slug || slugify(form.name),
        description: form.description.trim() || undefined,
      })
      toast.success('Catégorie créée')
      setShowNew(false)
      setForm({ name: '', slug: '', description: '' })
      await loadCats()
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  async function handleEdit(cat: Category) {
    setEditingId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' })
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId || !form.name.trim()) return
    setSaving(true)
    try {
      await updateCategory(editingId, {
        name: form.name.trim(),
        slug: form.slug,
        description: form.description.trim() || undefined,
      })
      toast.success('Catégorie mise à jour')
      setEditingId(null)
      setForm({ name: '', slug: '', description: '' })
      await loadCats()
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer la catégorie "${name}" ?`)) return
    try {
      await deleteCategory(id)
      toast.success('Catégorie supprimée')
      await loadCats()
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Catégories</h1>
          <p className="text-muted-foreground text-sm">{categories.length} catégorie{categories.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowNew(true); setForm({ name: '', slug: '', description: '' }) }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* New category form */}
      {showNew && (
        <div className="bg-card border border-accent/40 rounded-xl p-5 mb-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Nouvelle catégorie</h3>
            <button onClick={() => setShowNew(false)}><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSaveNew} className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Nom *</label>
              <input required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
            <div className="sm:col-span-3 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors">Annuler</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? '...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Nom</th>
                <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="text-left px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="text-right px-5 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-secondary/20 transition-colors">
                  {editingId === cat.id ? (
                    <td colSpan={4} className="px-5 py-3">
                      <form onSubmit={handleSaveEdit} className="flex gap-2 flex-wrap items-end">
                        <input required value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 w-36" />
                        <input value={form.slug}
                          onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                          placeholder="slug"
                          className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 w-36" />
                        <input value={form.description}
                          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Description"
                          className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 flex-1 min-w-32" />
                        <button type="submit" disabled={saving} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground">
                          <Save className="w-3.5 h-3.5" /> OK
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="px-5 py-3 font-medium">{cat.name}</td>
                      <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs hidden md:table-cell">{cat.description || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(cat)} className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
