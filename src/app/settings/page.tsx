'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [defaultMin, setDefaultMin] = useState(700)
  const [defaultMax, setDefaultMax] = useState(1000)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [wpUrl, setWpUrl] = useState('')
  const [wpUsername, setWpUsername] = useState('')
  const [wpAppPassword, setWpAppPassword] = useState('')

  const handleSave = () => {
    toast.info('ההגדרות נשמרות בקובץ .env.local - ערוך אותו ידנית בשלב זה')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">הגדרות</h1>

      {/* OpenAI */}
      <section className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">OpenAI API</h2>
        <div>
          <label className="block text-sm text-[#9ca3af] mb-1">מפתח API</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white outline-none"
            placeholder="sk-..."
            dir="ltr"
          />
          <p className="text-xs text-[#9ca3af] mt-1">
            המפתח נשמר בקובץ .env.local בתיקיית הפרויקט
          </p>
        </div>
      </section>

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
          <label className="block text-sm text-[#9ca3af] mb-1">הנחיות מערכת ברירת מחדל</label>
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
          <span className="text-xs bg-[#C8FF00]/10 text-[#C8FF00] px-2 py-1 rounded border border-[#C8FF00]/20">שלב 2 - בקרוב</span>
        </div>
        <div>
          <label className="block text-sm text-[#9ca3af] mb-1">כתובת האתר</label>
          <input
            value={wpUrl}
            onChange={e => setWpUrl(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white outline-none opacity-50"
            placeholder="https://your-site.com"
            dir="ltr"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-[#9ca3af] mb-1">שם משתמש</label>
          <input
            value={wpUsername}
            onChange={e => setWpUsername(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white outline-none opacity-50"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-[#9ca3af] mb-1">Application Password</label>
          <input
            type="password"
            value={wpAppPassword}
            onChange={e => setWpAppPassword(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white outline-none opacity-50"
            disabled
            dir="ltr"
          />
        </div>
      </section>

      <button
        onClick={handleSave}
        className="bg-[#C8FF00] hover:bg-[#B0E000] text-black px-6 py-2 rounded-lg font-bold transition-colors"
      >
        שמור הגדרות
      </button>
    </div>
  )
}
