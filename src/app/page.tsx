'use client'

import { useEffect, useState } from 'react'
import { formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'

interface Stats {
  totalArticles: number
  byStatus: Record<string, number>
  byCategory: { name: string; color: string; count: number }[]
  recentArticles: {
    id: string; title: string; status: string; createdAt: string;
    category?: { name: string; color: string } | null
  }[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">דשבורד</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-900 rounded-xl p-6 animate-pulse h-28" />
          ))}
        </div>
      </div>
    )
  }

  const s = stats || { totalArticles: 0, byStatus: {}, byCategory: [], recentArticles: [] }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">דשבורד</h1>
        <a
          href="/articles/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ➕ מאמר חדש
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="סה״כ מאמרים" value={s.totalArticles} color="text-indigo-400" />
        <StatCard title="טיוטות" value={s.byStatus.draft || 0} color="text-gray-400" />
        <StatCard title="נוצרו" value={s.byStatus.generated || 0} color="text-blue-400" />
        <StatCard title="פורסמו" value={s.byStatus.published || 0} color="text-green-400" />
      </div>

      {/* Categories */}
      {s.byCategory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">קטגוריות</h2>
          <div className="flex flex-wrap gap-3">
            {s.byCategory.map(c => (
              <div key={c.name} className="bg-gray-900 rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-sm">{c.name}</span>
                <span className="text-xs text-gray-500">({c.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Articles */}
      <div>
        <h2 className="text-lg font-semibold mb-3">מאמרים אחרונים</h2>
        {s.recentArticles.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-500">
            <p className="text-lg mb-2">אין מאמרים עדיין</p>
            <a href="/articles/new" className="text-indigo-400 hover:underline text-sm">
              צור את המאמר הראשון שלך →
            </a>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-sm text-gray-400">
                  <th className="text-right p-3">כותרת</th>
                  <th className="text-right p-3">קטגוריה</th>
                  <th className="text-right p-3">סטטוס</th>
                  <th className="text-right p-3">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {s.recentArticles.map(a => (
                  <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                    <td className="p-3">
                      <a href={`/articles/${a.id}`} className="text-indigo-400 hover:underline">
                        {a.title}
                      </a>
                    </td>
                    <td className="p-3 text-sm text-gray-400">
                      {a.category?.name || '—'}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(a.status)}`}>
                        {getStatusLabel(a.status)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-400">{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
