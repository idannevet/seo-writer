'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Category {
  id: string; name: string; slug: string; description: string | null; color: string;
  _count: { articles: number; topics: number };
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4']

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366f1')

  const fetchCategories = () => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const resetForm = () => { setName(''); setDescription(''); setColor('#6366f1'); setEditingId(null); setShowForm(false) }

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('הזן שם קטגוריה'); return }
    const url = editingId ? `/api/categories/${editingId}` : '/api/categories'
    const method = editingId ? 'PUT' : 'POST'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, color }),
    })
    toast.success(editingId ? 'הקטגוריה עודכנה' : 'הקטגוריה נוצרה')
    resetForm()
    fetchCategories()
  }

  const handleEdit = (c: Category) => {
    setEditingId(c.id); setName(c.name); setDescription(c.description || ''); setColor(c.color); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק קטגוריה?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    toast.success('הקטגוריה נמחקה')
    fetchCategories()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">קטגוריות</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          ➕ קטגוריה חדשה
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
            placeholder="שם הקטגוריה"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
            placeholder="תיאור (אופציונלי)"
          />
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
              {editingId ? 'עדכן' : 'צור'}
            </button>
            <button onClick={resetForm} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-900 rounded-lg animate-pulse" />)}</div>
      ) : categories.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 text-center text-gray-500">אין קטגוריות עדיין</div>
      ) : (
        <div className="grid gap-3">
          {categories.map(c => (
            <div key={c.id} className="bg-gray-900 rounded-xl p-4 flex items-center gap-4">
              <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <div className="flex-1">
                <a href={`/categories/${c.id}/topics`} className="font-medium hover:text-indigo-400 transition-colors">
                  {c.name}
                </a>
                {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
              </div>
              <span className="text-xs text-gray-500">{c._count.articles} מאמרים · {c._count.topics} נושאים</span>
              <button onClick={() => handleEdit(c)} className="text-gray-400 hover:text-white text-sm">✏️</button>
              <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-400 text-sm">🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
