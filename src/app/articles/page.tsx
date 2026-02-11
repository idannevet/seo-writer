'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

interface Article {
  id: string; title: string; status: string; wordCount: number;
  createdAt: string; updatedAt: string;
  category: { name: string; color: string } | null;
  topic: { name: string } | null;
}

interface Category { id: string; name: string }

type SortField = 'title' | 'updatedAt' | 'wordCount' | 'status'
type SortDir = 'asc' | 'desc'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchArticles = useCallback((searchVal?: string) => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (categoryFilter) params.set('categoryId', categoryFilter)
    const s = searchVal !== undefined ? searchVal : search
    if (s) params.set('search', s)
    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(setArticles)
      .finally(() => setLoading(false))
  }, [statusFilter, categoryFilter, search])

  useEffect(() => { fetchArticles() }, [statusFilter, categoryFilter])
  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(setCategories) }, [])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchArticles(val), 400)
  }

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

  const duplicateArticle = async (a: Article) => {
    try {
      const res = await fetch(`/api/articles/${a.id}`)
      const full = await res.json()
      const dupRes = await fetch('/api/articles/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id }),
      })
      if (dupRes.ok) {
        toast.success('המאמר שוכפל')
        fetchArticles()
      } else {
        toast.error('שגיאה בשכפול')
      }
    } catch { toast.error('שגיאה בשכפול') }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir(field === 'title' ? 'asc' : 'desc')
    }
  }

  const sorted = [...articles].sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case 'title': cmp = a.title.localeCompare(b.title, 'he'); break
      case 'updatedAt': cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break
      case 'wordCount': cmp = a.wordCount - b.wordCount; break
      case 'status': cmp = a.status.localeCompare(b.status); break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="mr-1 text-[10px]">{sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">מאמרים</h1>
        <a href="/articles/new" className="bg-[#C8FF00] hover:bg-[#B0E000] text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          ➕ מאמר חדש
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none w-60"
            placeholder="חיפוש לפי כותרת..."
          />
          <button type="submit" className="bg-[#1a1a1a] border border-[#333] hover:border-[#C8FF00] px-3 py-2 rounded-lg text-sm transition-colors">🔍</button>
        </form>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none"
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
          className="bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none"
        >
          <option value="">כל הקטגוריות</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selected.size > 0 && (
          <button onClick={bulkDelete} className="bg-[#ff4444]/10 border border-[#ff4444]/30 hover:bg-[#ff4444]/20 text-[#ff4444] px-3 py-2 rounded-lg text-sm transition-colors">
            🗑️ מחק {selected.size} נבחרים
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-[#111] rounded-lg animate-pulse" />)}</div>
      ) : articles.length === 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center text-[#9ca3af]">
          <p className="text-lg">אין מאמרים</p>
          <a href="/articles/new" className="text-[#C8FF00] hover:underline text-sm mt-2 block">צור מאמר חדש →</a>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222] text-sm text-[#9ca3af]">
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === articles.length && articles.length > 0}
                    onChange={() => {
                      if (selected.size === articles.length) setSelected(new Set())
                      else setSelected(new Set(articles.map(a => a.id)))
                    }}
                    className="rounded accent-[#C8FF00]"
                  />
                </th>
                <th className="text-right p-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('title')}>
                  כותרת <SortIcon field="title" />
                </th>
                <th className="text-right p-3">קטגוריה</th>
                <th className="text-right p-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('status')}>
                  סטטוס <SortIcon field="status" />
                </th>
                <th className="text-right p-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('wordCount')}>
                  מילים <SortIcon field="wordCount" />
                </th>
                <th className="text-right p-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('updatedAt')}>
                  עודכן <SortIcon field="updatedAt" />
                </th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(a => (
                <tr key={a.id} className="border-b border-[#222]/50 hover:bg-[#1a1a1a] group">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggleSelect(a.id)}
                      className="rounded accent-[#C8FF00]"
                    />
                  </td>
                  <td className="p-3">
                    <a href={`/articles/${a.id}`} className="text-[#C8FF00] hover:underline font-medium">
                      {a.title}
                    </a>
                  </td>
                  <td className="p-3 text-sm text-[#9ca3af]">{a.category?.name || '—'}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(a.status)}`}>
                      {getStatusLabel(a.status)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-[#9ca3af]">{a.wordCount}</td>
                  <td className="p-3 text-sm text-[#9ca3af]">{formatDate(a.updatedAt)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => duplicateArticle(a)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-[#9ca3af] hover:text-[#C8FF00] transition-all"
                      title="שכפל"
                    >
                      שכפל
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
