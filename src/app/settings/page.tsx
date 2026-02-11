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
      <section className="bg-gray-900 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">OpenAI API</h2>
        <div>
          <label className="block text-sm text-gray-400 mb-1">מפתח API</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
            placeholder="sk-..."
            dir="ltr"
          />
          <p className="text-xs text-gray-500 mt-1">
            המפתח נשמר בקובץ .env.local בתיקיית הפרויקט
          </p>
        </div>
      </section>

      {/* Defaults */}
      <section className="bg-gray-900 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">ברירות מחדל</h2>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">מינימום מילים</label>
            <input
              type="number"
              value={defaultMin}
              onChange={e => setDefaultMin(Number(e.target.value))}
              className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">מקסימום מילים</label>
            <input
              type="number"
              value={defaultMax}
              onChange={e => setDefaultMax(Number(e.target.value))}
              className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">הנחיות מערכת ברירת מחדל</label>
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none resize-none"
            placeholder="הנחיות נוספות שיתווספו לכל יצירת מאמר..."
          />
        </div>
      </section>

      {/* WordPress */}
      <section className="bg-gray-900 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">WordPress</h2>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">שלב 2 - בקרוב</span>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">כתובת האתר</label>
          <input
            value={wpUrl}
            onChange={e => setWpUrl(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none opacity-50"
            placeholder="https://your-site.com"
            dir="ltr"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">שם משתמש</label>
          <input
            value={wpUsername}
            onChange={e => setWpUsername(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none opacity-50"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Application Password</label>
          <input
            type="password"
            value={wpAppPassword}
            onChange={e => setWpAppPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none opacity-50"
            disabled
            dir="ltr"
          />
        </div>
      </section>

      <button
        onClick={handleSave}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
      >
        שמור הגדרות
      </button>
    </div>
  )
}
