import { openai, GENERATION_MODEL } from '@/lib/openai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { topic, keywords } = await req.json()

    if (!topic) {
      return NextResponse.json({ error: 'נושא נדרש' }, { status: 400 })
    }

    const keywordsText = keywords?.length > 0
      ? `\nמילות מפתח קשורות: ${keywords.join(', ')}`
      : ''

    const response = await openai.chat.completions.create({
      model: GENERATION_MODEL,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `אתה עוזר מחקר. בהינתן נושא, הצע 5-8 מקורות מידע רלוונטיים באינטרנט (כתובות URL אמיתיות של אתרים מוכרים).
החזר JSON בפורמט: { "sources": [{ "url": "...", "title": "...", "description": "..." }] }
הצע מקורות מגוונים: אתרי חדשות, בלוגים מקצועיים, מאמרים אקדמיים, אתרים ממשלתיים.
העדף מקורות בעברית כשקיימים, אבל גם מקורות באנגלית רלוונטיים.
חשוב: החזר רק JSON תקין, בלי טקסט נוסף.`,
        },
        {
          role: 'user',
          content: `נושא: ${topic}${keywordsText}`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content || '{"sources":[]}'
    const parsed = JSON.parse(content)

    return NextResponse.json(parsed)
  } catch (error: unknown) {
    console.error('Suggest sources error:', error)
    return NextResponse.json({ error: 'שגיאה בהצעת מקורות' }, { status: 500 })
  }
}
