'use client'

import { useState, useEffect } from 'react'
import { formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

interface Article {
  id: string; title: string; status: string; wordCount: number; createdAt: string;
  category: { name: string; color: string } | null;
  topic: { name: string } | null;
}

interface Category { id: string; name: string }

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const fetchArticles = () => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (categoryFilter) params.set('categoryId', categoryFilter)
    if (search) params.set('search', search)
    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(setArticles)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchArticles() }, [statusFilter, categoryFilter])
  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(setCategories) }, [])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchArticles() }

  const toggleSelect = (id: string) => {
    const s = new Set(selected)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelected(s)
  }

  const bulkDelete = async () => {
    if (!confirm(`למחוק ${selected.size} מאמרים?`)) return
    await Promise.all(Array.from(selected).map(id =>
      fetch(`/api/articles/${id}`, { method: 'DELETE' })
    ))
    setSelected(new Set())
    toast.success('המאמרים נמחקו')
    fetchArticles()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">מאמרים</h1>
        <a href="/articles/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
          ➕ מאמר חדש
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none w-60"
            placeholder="חיפוש לפי כותרת..."
          />
          <button type="submit" className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm">🔍</button>
        </form>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
        >
          <option value="">כל הסטטוסים</option>
          <option value="draft">טיוטה</option>
          <option value="generated">נוצר</option>
          <option value="edited">נערך</option>
          <option value="published">פורסם</option>
        </select>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
        >
          <option value="">כל הקטגוריות</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selected.size > 0 && (
          <button onClick={bulkDelete} className="bg-red-900/50 hover:bg-red-900 text-red-400 px-3 py-2 rounded-lg text-sm">
            🗑️ מחק {selected.size} נבחרים
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-900 rounded-lg animate-pulse" />)}</div>
      ) : articles.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 text-center text-gray-500">
          <p className="text-lg">אין מאמרים</p>
          <a href="/articles/new" className="text-indigo-400 hover:underline text-sm mt-2 block">צור מאמר חדש →</a>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-sm text-gray-400">
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === articles.length && articles.length > 0}
                    onChange={() => {
                      if (selected.size === articles.length) setSelected(new Set())
                      else setSelected(new Set(articles.map(a => a.id)))
                    }}
                    className="rounded"
                  />
                </th>
                <th className="text-right p-3">כותרת</th>
                <th className="text-right p-3">קטגוריה</th>
                <th className="text-right p-3">סטטוס</th>
                <th className="text-right p-3">מילים</th>
                <th className="text-right p-3">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggleSelect(a.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-3">
                    <a href={`/articles/${a.id}`} className="text-indigo-400 hover:underline font-medium">
                      {a.title}
                    </a>
                  </td>
                  <td className="p-3 text-sm text-gray-400">{a.category?.name || '—'}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(a.status)}`}>
                      {getStatusLabel(a.status)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-400">{a.wordCount}</td>
                  <td className="p-3 text-sm text-gray-400">{formatDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
