'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [defaultMin, setDefaultMin] = useState(700)
  const [defaultMax, setDefaultMax] = useState(1000)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [wpStatus, setWpStatus] = useState<{ connected: boolean; url: string } | null>(null)
  const [checkingWp, setCheckingWp] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        if (data.defaultWordMin) setDefaultMin(Number(data.defaultWordMin))
        if (data.defaultWordMax) setDefaultMax(Number(data.defaultWordMax))
        if (data.systemPrompt) setSystemPrompt(data.systemPrompt)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))

    fetch('/api/settings/wp-status')
      .then(r => r.json())
      .then(setWpStatus)
      .catch(() => setWpStatus({ connected: false, url: '' }))
      .finally(() => setCheckingWp(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultWordMin: String(defaultMin),
          defaultWordMax: String(defaultMax),
          systemPrompt,
        }),
      })
      toast.success('ההגדרות נשמרו בהצלחה')
    } catch {
      toast.error('שגיאה בשמירת ההגדרות')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return <div className="animate-pulse space-y-4"><div className="h-8 bg-[#111] rounded w-1/3" /><div className="h-40 bg-[#111] rounded" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">הגדרות</h1>

      {/* Defaults */}
      <section className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">ברירות מחדל</h2>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">מינימום מילים</label>
            <input
              type="number"
              value={defaultMin}
              onChange={e => setDefaultMin(Number(e.target.value))}
              className="w-32 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-1">מקסימום מילים</label>
            <input
              type="number"
              value={defaultMax}
              onChange={e => setDefaultMax(Number(e.target.value))}
              className="w-32 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-[#9ca3af] mb-1">הנחיות מערכת נוספות</label>
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            rows={4}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white outline-none resize-none"
            placeholder="הנחיות נוספות שיתווספו לכל יצירת מאמר..."
          />
        </div>
      </section>

      {/* WordPress */}
      <section className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">WordPress</h2>
          {checkingWp ? (
            <span className="text-xs text-[#9ca3af]">בודק חיבור...</span>
          ) : wpStatus?.connected ? (
            <span className="text-xs bg-[#C8FF00]/10 text-[#C8FF00] px-3 py-1 rounded-full border border-[#C8FF00]/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C8FF00] inline-block" />
              מחובר
            </span>
          ) : (
            <span className="text-xs bg-[#ff4444]/10 text-[#ff4444] px-3 py-1 rounded-full border border-[#ff4444]/20">
              לא מחובר
            </span>
          )}
        </div>

        {wpStatus?.connected ? (
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9ca3af]">כתובת האתר</span>
              <a href={wpStatus.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#C8FF00] hover:underline" dir="ltr">
                {wpStatus.url}
              </a>
            </div>
            <p className="text-xs text-[#9ca3af]">
              החיבור מוגדר דרך משתני סביבה. ניתן להעלות מאמרים לוורדפרס מתוך עורך המאמרים.
            </p>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
            <p className="text-sm text-[#9ca3af]">
              להגדרת חיבור WordPress, הוסף את המשתנים הבאים לסביבה:
            </p>
            <pre className="mt-2 text-xs text-[#9ca3af] bg-[#0a0a0a] rounded p-3" dir="ltr">
{`WP_URL=https://your-site.com
WP_USERNAME=your_user
WP_APP_PASSWORD=your_app_password`}
            </pre>
          </div>
        )}
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#C8FF00] hover:bg-[#B0E000] text-black px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
      >
        {saving ? 'שומר...' : 'שמור הגדרות'}
      </button>
    </div>
  )
}
