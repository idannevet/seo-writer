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

  if (loading) return <div className="animate-pulse h-40 bg-gray-900 rounded-xl" />

  if (!category) return <div className="text-center text-gray-500 py-20">קטגוריה לא נמצאה</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/categories" className="text-gray-400 hover:text-white">← קטגוריות</a>
        <span className="text-gray-600">/</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
          <h1 className="text-2xl font-bold">{category.name}</h1>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{category.description || 'נושאים בקטגוריה זו'}</p>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          ➕ נושא חדש
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
            placeholder="שם הנושא"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
            placeholder="תיאור (אופציונלי)"
          />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
              {editingId ? 'עדכן' : 'צור'}
            </button>
            <button onClick={resetForm} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">ביטול</button>
          </div>
        </div>
      )}

      {category.topics.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 text-center text-gray-500">אין נושאים עדיין</div>
      ) : (
        <div className="grid gap-3">
          {category.topics.map(t => (
            <div key={t.id} className="bg-gray-900 rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">{t.name}</p>
                {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
              </div>
              <span className="text-xs text-gray-500">{t._count.articles} מאמרים</span>
              <button
                onClick={() => { setEditingId(t.id); setName(t.name); setDescription(t.description || ''); setShowForm(true) }}
                className="text-gray-400 hover:text-white text-sm"
              >✏️</button>
              <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-400 text-sm">🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
