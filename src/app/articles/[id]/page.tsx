'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { countWords, getStatusLabel, getStatusColor, formatDate } from '@/lib/utils'

const Editor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false })

interface Article {
  id: string; title: string; htmlContent: string | null; status: string;
  wordCount: number; wordRangeMin: number; wordRangeMax: number;
  keywords: string; sources: string; customInstructions: string | null;
  categoryId: string | null; topicId: string | null;
  createdAt: string; updatedAt: string;
  category: { name: string; color: string } | null;
  topic: { name: string } | null;
  generationLogs: { model: string; tokensUsed: number; duration: number; createdAt: string }[];
}

export default function ArticleEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [liveWordCount, setLiveWordCount] = useState(0)

  useEffect(() => {
    fetch(`/api/articles/${params.id}`)
      .then(r => r.json())
      .then(a => {
        setArticle(a)
        setContent(a.htmlContent || '')
        setTitle(a.title)
        setLiveWordCount(countWords(a.htmlContent || ''))
        setLoading(false)
      })
      .catch(() => { toast.error('שגיאה בטעינת המאמר'); setLoading(false) })
  }, [params.id])

  const handleContentChange = useCallback((html: string) => {
    setContent(html)
    setLiveWordCount(countWords(html))
  }, [])

  const handleSave = async (newStatus?: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          htmlContent: content,
          status: newStatus || article?.status || 'edited',
        }),
      })
      const data = await res.json()
      setArticle(prev => prev ? { ...prev, ...data } : prev)
      toast.success('נשמר בהצלחה')
    } catch { toast.error('שגיאה בשמירה') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('למחוק את המאמר?')) return
    await fetch(`/api/articles/${params.id}`, { method: 'DELETE' })
    toast.success('המאמר נמחק')
    router.push('/articles')
  }

  const handleExportDocx = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun } = await import('docx')
      const stripped = content.replace(/<[^>]*>/g, '\n').replace(/&nbsp;/g, ' ')
      const paragraphs = stripped.split('\n').filter(p => p.trim()).map(text =>
        new Paragraph({ children: [new TextRun({ text: text.trim(), font: 'David', size: 24 })] })
      )
      const doc = new Document({
        sections: [{ properties: {}, children: [
          new Paragraph({ children: [new TextRun({ text: title, bold: true, font: 'David', size: 32 })] }),
          ...paragraphs,
        ] }],
      })
      const blob = await Packer.toBlob(doc)
      const { saveAs } = await import('file-saver')
      saveAs(blob, `${title}.docx`)
      toast.success('הקובץ יורד')
    } catch { toast.error('שגיאה בייצוא') }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-[#111] rounded w-1/3" />
      <div className="h-96 bg-[#111] rounded" />
    </div>
  }

  if (!article) {
    return <div className="text-center text-[#9ca3af] py-20">מאמר לא נמצא</div>
  }

  const parsedKeywords: string[] = (() => {
    try { return JSON.parse(article.keywords) } catch { return [] }
  })()

  const keywordDensity = parsedKeywords.map(kw => {
    const regex = new RegExp(kw, 'gi')
    const matches = content.match(regex)
    return { keyword: kw, count: matches?.length || 0 }
  })

  const inRange = liveWordCount >= article.wordRangeMin && liveWordCount <= article.wordRangeMax
  const titleLength = title.length
  const titleHasKeyword = parsedKeywords.some(kw => title.includes(kw))
  const seoScore = [
    titleLength >= 20 && titleLength <= 70,
    titleHasKeyword,
    inRange,
    parsedKeywords.length > 0,
    liveWordCount > 300,
  ].filter(Boolean).length

  const genLog = article.generationLogs?.[0]

  return (
    <div className="flex gap-6">
      {/* Main Editor */}
      <div className="flex-1 space-y-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-transparent text-2xl font-bold text-white outline-none border-b border-[#222] pb-2"
        />

        <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
          <Editor content={content} onChange={handleContentChange} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSave('edited')}
            disabled={saving}
            className="bg-[#C8FF00] hover:bg-[#B0E000] text-black px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
          >
            {saving ? 'שומר...' : 'שמור טיוטה'}
          </button>
          <button
            onClick={handleExportDocx}
            className="bg-[#1a1a1a] border border-[#333] hover:border-[#C8FF00] text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            📄 ייצוא DOCX
          </button>
          <button
            onClick={async () => {
              setUploading(true)
              try {
                await handleSave('edited')
                const res = await fetch(`/api/articles/${params.id}/wordpress`, { method: 'POST' })
                const data = await res.json()
                if (data.success) {
                  toast.success('המאמר הועלה לוורדפרס כטיוטה!')
                  window.open(data.editUrl, '_blank')
                  setArticle(prev => prev ? { ...prev, status: 'published', wpUrl: data.editUrl } : prev)
                } else {
                  toast.error(data.error || 'שגיאה בהעלאה')
                }
              } catch { toast.error('שגיאה בהעלאה לוורדפרס') }
              finally { setUploading(false) }
            }}
            disabled={uploading}
            className="bg-[#1a1a1a] border border-[#C8FF00]/50 text-[#C8FF00] hover:bg-[#C8FF00]/10 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {uploading ? '⏳ מעלה...' : '📤 העלה לוורדפרס'}
          </button>
          <button
            onClick={handleDelete}
            className="bg-[#1a1a1a] border border-[#ff4444]/30 hover:bg-[#ff4444]/10 text-[#ff4444] px-4 py-2 rounded-lg text-sm mr-auto transition-colors"
          >
            🗑️ מחק
          </button>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-72 shrink-0 space-y-4">
        {/* Status */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[#9ca3af] mb-2">סטטוס</h3>
          <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(article.status)}`}>
            {getStatusLabel(article.status)}
          </span>
        </div>

        {/* Word Count */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[#9ca3af] mb-2">ספירת מילים</h3>
          <p className={`text-2xl font-bold ${inRange ? 'text-[#C8FF00]' : 'text-yellow-400'}`}>
            {liveWordCount}
          </p>
          <p className="text-xs text-[#9ca3af]">
            יעד: {article.wordRangeMin} - {article.wordRangeMax}
          </p>
          <div className="mt-2 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${inRange ? 'bg-[#C8FF00]' : liveWordCount < article.wordRangeMin ? 'bg-yellow-500' : 'bg-[#ff4444]'}`}
              style={{ width: `${Math.min(100, (liveWordCount / article.wordRangeMax) * 100)}%` }}
            />
          </div>
        </div>

        {/* SEO Score */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[#9ca3af] mb-2">ציון SEO</h3>
          <p className={`text-2xl font-bold ${seoScore >= 4 ? 'text-[#C8FF00]' : seoScore >= 2 ? 'text-yellow-400' : 'text-[#ff4444]'}`}>
            {seoScore}/5
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            <li className={titleLength >= 20 && titleLength <= 70 ? 'text-[#C8FF00]' : 'text-[#9ca3af]'}>
              {titleLength >= 20 && titleLength <= 70 ? '✓' : '✗'} אורך כותרת (20-70 תווים)
            </li>
            <li className={titleHasKeyword ? 'text-[#C8FF00]' : 'text-[#9ca3af]'}>
              {titleHasKeyword ? '✓' : '✗'} מילת מפתח בכותרת
            </li>
            <li className={inRange ? 'text-[#C8FF00]' : 'text-[#9ca3af]'}>
              {inRange ? '✓' : '✗'} ספירת מילים בטווח
            </li>
            <li className={parsedKeywords.length > 0 ? 'text-[#C8FF00]' : 'text-[#9ca3af]'}>
              {parsedKeywords.length > 0 ? '✓' : '✗'} מילות מפתח מוגדרות
            </li>
            <li className={liveWordCount > 300 ? 'text-[#C8FF00]' : 'text-[#9ca3af]'}>
              {liveWordCount > 300 ? '✓' : '✗'} מעל 300 מילים
            </li>
          </ul>
        </div>

        {/* Keyword Density */}
        {keywordDensity.length > 0 && (
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#9ca3af] mb-2">צפיפות מילות מפתח</h3>
            <div className="space-y-2">
              {keywordDensity.map(kd => (
                <div key={kd.keyword} className="flex justify-between text-sm">
                  <span className="text-white">{kd.keyword}</span>
                  <span className={kd.count > 0 ? 'text-[#C8FF00]' : 'text-[#ff4444]'}>
                    {kd.count}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[#9ca3af] mb-2">פרטים</h3>
          <dl className="space-y-1 text-xs">
            {article.category && (
              <>
                <dt className="text-[#9ca3af]">קטגוריה</dt>
                <dd className="text-white mb-1">{article.category.name}</dd>
              </>
            )}
            {article.topic && (
              <>
                <dt className="text-[#9ca3af]">נושא</dt>
                <dd className="text-white mb-1">{article.topic.name}</dd>
              </>
            )}
            <dt className="text-[#9ca3af]">נוצר</dt>
            <dd className="text-white mb-1">{formatDate(article.createdAt)}</dd>
            {genLog && (
              <>
                <dt className="text-[#9ca3af]">מודל</dt>
                <dd className="text-white mb-1">{genLog.model}</dd>
                <dt className="text-[#9ca3af]">טוקנים</dt>
                <dd className="text-white mb-1">{genLog.tokensUsed.toLocaleString()}</dd>
                <dt className="text-[#9ca3af]">זמן יצירה</dt>
                <dd className="text-white">{(genLog.duration / 1000).toFixed(1)} שניות</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}
