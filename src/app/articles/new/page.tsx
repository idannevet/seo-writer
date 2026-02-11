'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Category {
  id: string; name: string; color: string;
  topics: { id: string; name: string }[]
}

interface SuggestedSource {
  url: string; title: string; description: string
}

const WORD_PRESETS = [
  { label: '500-700', min: 500, max: 700 },
  { label: '700-1,000', min: 700, max: 1000 },
  { label: '1,000-1,500', min: 1000, max: 1500 },
  { label: '1,500-2,000', min: 1500, max: 2000 },
]

export default function NewArticlePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [writingTopic, setWritingTopic] = useState('')
  const [wordRangeMin, setWordRangeMin] = useState(700)
  const [wordRangeMax, setWordRangeMax] = useState(1000)
  const [categoryId, setCategoryId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [keywordsInput, setKeywordsInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([''])
  const [customInstructions, setCustomInstructions] = useState('')
  const [generating, setGenerating] = useState(false)
  const [suggestingSource, setSuggestingSource] = useState(false)
  const [suggestedSources, setSuggestedSources] = useState<SuggestedSource[]>([])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  const selectedCategory = categories.find(c => c.id === categoryId)
  const topics = selectedCategory?.topics || []

  const addKeyword = () => {
    if (!keywordsInput.trim()) return
    const newKw = keywordsInput.split(',').map(k => k.trim()).filter(k => k && !keywords.includes(k))
    setKeywords([...keywords, ...newKw])
    setKeywordsInput('')
  }

  const removeKeyword = (kw: string) => setKeywords(keywords.filter(k => k !== kw))

  const addSourceField = () => setSources([...sources, ''])
  const removeSource = (i: number) => setSources(sources.filter((_, idx) => idx !== i))
  const updateSource = (i: number, val: string) => {
    const s = [...sources]; s[i] = val; setSources(s)
  }

  const suggestSources = async () => {
    if (!writingTopic) { toast.error('הזן נושא לכתיבה קודם'); return }
    setSuggestingSource(true)
    try {
      const res = await fetch('/api/articles/suggest-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: writingTopic, keywords }),
      })
      const data = await res.json()
      if (data.sources) setSuggestedSources(data.sources)
      else toast.error(data.error || 'שגיאה')
    } catch { toast.error('שגיאה בהצעת מקורות') }
    finally { setSuggestingSource(false) }
  }

  const addSuggestedSource = (url: string) => {
    if (!sources.includes(url)) {
      setSources([...sources.filter(s => s), url])
    }
    setSuggestedSources(suggestedSources.filter(s => s.url !== url))
  }

  const handleGenerate = async () => {
    if (!title.trim()) { toast.error('הזן כותרת'); return }
    if (!writingTopic.trim()) { toast.error('הזן נושא לכתיבה'); return }

    setGenerating(true)
    try {
      const res = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          writingTopic,
          wordRangeMin,
          wordRangeMax,
          categoryId: categoryId || null,
          topicId: topicId || null,
          keywords,
          sources: sources.filter(s => s.trim()),
          customInstructions: customInstructions || null,
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success('המאמר נוצר בהצלחה!')
        window.location.href = `/articles/${data.article.id}`
      }
    } catch {
      toast.error('שגיאה ביצירת המאמר')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">מאמר חדש</h1>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[#9ca3af] mb-1">כותרת</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white outline-none"
          placeholder="כותרת המאמר..."
        />
      </div>

      {/* Writing Topic */}
      <div>
        <label className="block text-sm font-medium text-[#9ca3af] mb-1">נושא לכתיבה</label>
        <textarea
          value={writingTopic}
          onChange={e => setWritingTopic(e.target.value)}
          rows={3}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white outline-none resize-none"
          placeholder="תאר בקצרה על מה המאמר צריך לדבר..."
        />
      </div>

      {/* Word Range */}
      <div>
        <label className="block text-sm font-medium text-[#9ca3af] mb-2">טווח מילים</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {WORD_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => { setWordRangeMin(p.min); setWordRangeMax(p.max) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                wordRangeMin === p.min && wordRangeMax === p.max
                  ? 'bg-[#C8FF00] text-black'
                  : 'bg-[#1a1a1a] text-[#9ca3af] border border-[#333] hover:border-[#C8FF00] hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            value={wordRangeMin}
            onChange={e => setWordRangeMin(Number(e.target.value))}
            className="w-32 bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white text-center outline-none"
            placeholder="מינימום"
          />
          <span className="text-[#9ca3af] self-center">—</span>
          <input
            type="number"
            value={wordRangeMax}
            onChange={e => setWordRangeMax(Number(e.target.value))}
            className="w-32 bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white text-center outline-none"
            placeholder="מקסימום"
          />
        </div>
      </div>

      {/* Category & Topic */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#9ca3af] mb-1">קטגוריה</label>
          <select
            value={categoryId}
            onChange={e => { setCategoryId(e.target.value); setTopicId('') }}
            className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white outline-none"
          >
            <option value="">בחר קטגוריה...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#9ca3af] mb-1">נושא</label>
          <select
            value={topicId}
            onChange={e => setTopicId(e.target.value)}
            className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white outline-none"
            disabled={!categoryId}
          >
            <option value="">בחר נושא...</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-[#9ca3af] mb-1">מילות מפתח</label>
        <div className="flex gap-2">
          <input
            value={keywordsInput}
            onChange={e => setKeywordsInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
            className="flex-1 bg-[#111] border border-[#333] rounded-lg px-4 py-2 text-white outline-none"
            placeholder="הזן מילות מפתח, מופרדות בפסיק..."
          />
          <button
            onClick={addKeyword}
            className="bg-[#1a1a1a] border border-[#333] hover:border-[#C8FF00] hover:text-[#C8FF00] px-4 py-2 rounded-lg text-sm transition-colors"
          >
            הוסף
          </button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map(kw => (
              <span key={kw} className="bg-[#C8FF00]/15 text-[#C8FF00] px-3 py-1 rounded-full text-sm flex items-center gap-1 border border-[#C8FF00]/30">
                {kw}
                <button onClick={() => removeKeyword(kw)} className="hover:text-[#ff4444]">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sources */}
      <div>
        <label className="block text-sm font-medium text-[#9ca3af] mb-1">מקורות מידע</label>
        {sources.map((s, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={s}
              onChange={e => updateSource(i, e.target.value)}
              className="flex-1 bg-[#111] border border-[#333] rounded-lg px-4 py-2 text-white outline-none text-sm"
              placeholder="https://..."
              dir="ltr"
            />
            {sources.length > 1 && (
              <button onClick={() => removeSource(i)} className="text-[#ff4444] hover:text-red-300 px-2">×</button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button
            onClick={addSourceField}
            className="text-sm text-[#9ca3af] hover:text-white"
          >
            + הוסף מקור
          </button>
          <button
            onClick={suggestSources}
            disabled={suggestingSource}
            className="text-sm text-[#C8FF00] hover:text-[#B0E000] disabled:opacity-50"
          >
            {suggestingSource ? '⏳ מחפש...' : '💡 הצע מקורות'}
          </button>
        </div>

        {/* Suggested Sources */}
        {suggestedSources.length > 0 && (
          <div className="mt-3 bg-[#111] border border-[#222] rounded-lg p-3 space-y-2">
            <p className="text-xs text-[#9ca3af]">מקורות מוצעים (לחץ להוספה):</p>
            {suggestedSources.map(s => (
              <button
                key={s.url}
                onClick={() => addSuggestedSource(s.url)}
                className="block w-full text-right bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-lg p-2 transition-colors"
              >
                <p className="text-sm text-[#C8FF00]">{s.title}</p>
                <p className="text-xs text-[#9ca3af] dir-ltr">{s.url}</p>
                <p className="text-xs text-[#9ca3af] mt-1">{s.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Instructions */}
      <div>
        <label className="block text-sm font-medium text-[#9ca3af] mb-1">הנחיות נוספות</label>
        <textarea
          value={customInstructions}
          onChange={e => setCustomInstructions(e.target.value)}
          rows={2}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white outline-none resize-none"
          placeholder="הנחיות נוספות לכתיבה (אופציונלי)..."
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full bg-[#C8FF00] hover:bg-[#B0E000] disabled:bg-[#C8FF00]/30 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl text-lg transition-colors"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            יוצר מאמר... (זה עשוי לקחת עד דקה)
          </span>
        ) : (
          'צור מאמר ✨'
        )}
      </button>
    </div>
  )
}
