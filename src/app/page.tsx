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
            <div key={i} className="bg-[#111] rounded-xl p-6 animate-pulse h-28 border border-[#222]" />
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
          className="bg-[#C8FF00] hover:bg-[#B0E000] text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          ➕ מאמר חדש
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="סה״כ מאמרים" value={s.totalArticles} color="text-[#C8FF00]" />
        <StatCard title="טיוטות" value={s.byStatus.draft || 0} color="text-[#9ca3af]" />
        <StatCard title="נוצרו" value={s.byStatus.generated || 0} color="text-[#C8FF00]" />
        <StatCard title="פורסמו" value={s.byStatus.published || 0} color="text-[#C8FF00]" />
      </div>

      {/* Categories */}
      {s.byCategory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">קטגוריות</h2>
          <div className="flex flex-wrap gap-3">
            {s.byCategory.map(c => (
              <div key={c.name} className="bg-[#111] border border-[#222] rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-sm">{c.name}</span>
                <span className="text-xs text-[#9ca3af]">({c.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Articles */}
      <div>
        <h2 className="text-lg font-semibold mb-3">מאמרים אחרונים</h2>
        {s.recentArticles.length === 0 ? (
          <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center space-y-8">
            <div className="text-6xl mb-4">🚀</div>
            <div>
              <p className="text-2xl font-bold text-white mb-2">ברוכים הבאים!</p>
              <p className="text-sm text-[#9ca3af]">שלושה צעדים פשוטים להתחיל</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-right">
              <a href="/categories" className="bg-[#1a1a1a] border border-[#333] hover:border-[#C8FF00] rounded-xl p-4 transition-colors block">
                <div className="text-2xl mb-2">📁</div>
                <p className="text-sm font-semibold text-white">1. צור קטגוריות</p>
                <p className="text-xs text-[#9ca3af] mt-1">ארגן את המאמרים שלך לפי נושאים</p>
              </a>
              <a href="/articles/new" className="bg-[#1a1a1a] border border-[#333] hover:border-[#C8FF00] rounded-xl p-4 transition-colors block">
                <div className="text-2xl mb-2">✨</div>
                <p className="text-sm font-semibold text-white">2. צור מאמר ראשון</p>
                <p className="text-xs text-[#9ca3af] mt-1">הגדר נושא, מילות מפתח וצור תוכן</p>
              </a>
              <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 opacity-60">
                <div className="text-2xl mb-2">📤</div>
                <p className="text-sm font-semibold text-white">3. ערוך ופרסם</p>
                <p className="text-xs text-[#9ca3af] mt-1">ערוך את התוכן והעלה לוורדפרס</p>
              </div>
            </div>
            <a
              href="/articles/new"
              className="inline-flex items-center gap-2 bg-[#C8FF00] hover:bg-[#B0E000] text-black px-6 py-3 rounded-xl font-bold text-sm transition-colors"
            >
              ✨ צור מאמר חדש
            </a>
          </div>
        ) : (
          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#222] text-sm text-[#9ca3af]">
                  <th className="text-right p-3">כותרת</th>
                  <th className="text-right p-3">קטגוריה</th>
                  <th className="text-right p-3">סטטוס</th>
                  <th className="text-right p-3">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {s.recentArticles.map(a => (
                  <tr key={a.id} className="border-b border-[#222]/50 hover:bg-[#1a1a1a]">
                    <td className="p-3">
                      <a href={`/articles/${a.id}`} className="text-[#C8FF00] hover:underline">
                        {a.title}
                      </a>
                    </td>
                    <td className="p-3 text-sm text-[#9ca3af]">
                      {a.category?.name || '—'}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(a.status)}`}>
                        {getStatusLabel(a.status)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-[#9ca3af]">{formatDate(a.createdAt)}</td>
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
    <div className="bg-[#111] border border-[#222] rounded-xl p-6">
      <p className="text-sm text-[#9ca3af] mb-1">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
