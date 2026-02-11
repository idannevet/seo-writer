import { prisma } from '@/lib/prisma'
import { openai, GENERATION_MODEL, GENERATION_TEMPERATURE } from '@/lib/openai'
import { NextRequest, NextResponse } from 'next/server'
import { slugify, countWords } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const {
      title,
      writingTopic,
      wordRangeMin = 700,
      wordRangeMax = 1000,
      categoryId,
      topicId,
      keywords = [],
      sources = [],
      customInstructions,
      metaDescription,
    } = body

    if (!title || !writingTopic) {
      return NextResponse.json({ error: 'כותרת ונושא לכתיבה נדרשים' }, { status: 400 })
    }

    const keywordsText = keywords.length > 0
      ? `\nמילות מפתח לשלב באופן טבעי: ${keywords.join(', ')}`
      : ''

    const sourcesText = sources.length > 0
      ? `\nמקורות מידע לעיון והתייחסות:\n${sources.map((s: string) => `- ${s}`).join('\n')}`
      : ''

    const customText = customInstructions
      ? `\nהנחיות נוספות מהמשתמש: ${customInstructions}`
      : ''

    const systemPrompt = `אתה כותב תוכן מקצועי בעברית. כתוב מאמר איכותי, מקצועי ומעמיק.

כללים חשובים:
- כתוב בעברית טבעית ומקצועית. אל תישמע כמו AI.
- אסור להשתמש בביטויים: "בעידן הדיגיטלי", "בעולם המודרני", "ללא ספק", "חשוב לציין"
- אסור אימוג'י
- אל תפתח עם הקדמה גנרית. תתחיל ישר לעניין.
- טון: חד, מקצועי, בקיא בתחום, מרתק
- השתמש בכותרות משנה (H2, H3) לארגון התוכן
- שלב את מילות המפתח באופן טבעי - לא stuffing
- כמות מילים: בין ${wordRangeMin} ל-${wordRangeMax} מילים
- הפלט חייב להיות HTML נקי (לא markdown)
- השתמש בתגיות: <h2>, <h3>, <p>, <ul>, <li>, <ol>, <strong>, <em>, <blockquote>, <a>
- אל תכלול תגית <h1> - הכותרת הראשית מנוהלת בנפרד
- אל תכלול <!DOCTYPE>, <html>, <head>, <body> - רק את תוכן המאמר${sourcesText ? '\n- אם יש מקורות, התייחס אליהם באופן טבעי בטקסט' : ''}${keywordsText}${sourcesText}${customText}`

    const userPrompt = `כתוב מאמר בנושא: "${title}"

תיאור הנושא: ${writingTopic}

כתוב את המאמר המלא ב-HTML נקי.`

    const response = await openai.chat.completions.create({
      model: GENERATION_MODEL,
      temperature: GENERATION_TEMPERATURE,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4000,
    })

    const htmlContent = response.choices[0]?.message?.content || ''
    const duration = Date.now() - startTime
    const wordCount = countWords(htmlContent)
    const tokensUsed = response.usage?.total_tokens || 0

    const slug = slugify(title)

    const article = await prisma.article.create({
      data: {
        title,
        slug: `${slug}-${Date.now()}`,
        content: htmlContent,
        htmlContent,
        status: 'generated',
        wordCount,
        keywords: JSON.stringify(keywords),
        sources: JSON.stringify(sources),
        customInstructions,
        metaDescription: metaDescription || null,
        wordRangeMin,
        wordRangeMax,
        categoryId: categoryId || null,
        topicId: topicId || null,
      },
    })

    await prisma.generationLog.create({
      data: {
        articleId: article.id,
        prompt: `${systemPrompt}\n\n---\n\n${userPrompt}`,
        model: GENERATION_MODEL,
        tokensUsed,
        duration,
      },
    })

    return NextResponse.json({
      article: {
        ...article,
        keywords: JSON.parse(article.keywords),
        sources: JSON.parse(article.sources),
      },
    })
  } catch (error: unknown) {
    console.error('Generation error:', error)
    const message = error instanceof Error ? error.message : 'שגיאה ביצירת המאמר'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
