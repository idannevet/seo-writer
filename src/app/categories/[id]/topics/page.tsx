'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

interface Topic {
  id: string; name: string; description: string | null;
  _count: { articles: number }
}

interface Category {
  id: string; name: string; color: string; description: string | null;
  topics: Topic[]
}

export default function TopicsPage() {
  const params = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const fetchCategory = () => {
    fetch(`/api/categories/${params.id}`)
      .then(r => r.json())
      .then(setCategory)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategory() }, [params.id])

  const resetForm = () => { setName(''); setDescription(''); setEditingId(null); setShowForm(false) }

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('הזן שם נושא'); return }
    if (editingId) {
      await fetch(`/api/topics/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      toast.success('הנושא עודכן')
    } else {
      await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, categoryId: params.id }),
      })
      toast.success('הנושא נוצר')
    }
    resetForm()
    fetchCategory()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק נושא?')) return
    await fetch(`/api/topics/${id}`, { method: 'DELETE' })
    toast.success('הנושא נמחק')
    fetchCategory()
  }

  if (loading) return <div className="animate-pulse h-40 bg-[#111] rounded-xl" />

  if (!category) return <div className="text-center text-[#9ca3af] py-20">קטגוריה לא נמצאה</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/categories" className="text-[#9ca3af] hover:text-[#C8FF00] transition-colors">← קטגוריות</a>
        <span className="text-[#333]">/</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
          <h1 className="text-2xl font-bold">{category.name}</h1>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#9ca3af]">{category.description || 'נושאים בקטגוריה זו'}</p>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-[#C8FF00] hover:bg-[#B0E000] text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          ➕ נושא חדש
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white outline-none"
            placeholder="שם הנושא"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white outline-none"
            placeholder="תיאור (אופציונלי)"
          />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="bg-[#C8FF00] hover:bg-[#B0E000] text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              {editingId ? 'עדכן' : 'צור'}
            </button>
            <button onClick={resetForm} className="bg-[#1a1a1a] border border-[#333] hover:border-[#C8FF00] text-white px-4 py-2 rounded-lg text-sm transition-colors">ביטול</button>
          </div>
        </div>
      )}

      {category.topics.length === 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center text-[#9ca3af]">אין נושאים עדיין</div>
      ) : (
        <div className="grid gap-3">
          {category.topics.map(t => (
            <div key={t.id} className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center gap-4 hover:border-[#333] transition-colors">
              <div className="flex-1">
                <p className="font-medium">{t.name}</p>
                {t.description && <p className="text-xs text-[#9ca3af]">{t.description}</p>}
              </div>
              <span className="text-xs text-[#9ca3af]">{t._count.articles} מאמרים</span>
              <button
                onClick={() => { setEditingId(t.id); setName(t.name); setDescription(t.description || ''); setShowForm(true) }}
                className="text-[#9ca3af] hover:text-white text-sm"
              >✏️</button>
              <button onClick={() => handleDelete(t.id)} className="text-[#9ca3af] hover:text-[#ff4444] text-sm">🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
