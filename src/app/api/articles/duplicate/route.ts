import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  const original = await prisma.article.findUnique({ where: { id } })
  if (!original) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 })

  const newTitle = `${original.title} (עותק)`
  const article = await prisma.article.create({
    data: {
      title: newTitle,
      slug: `${slugify(newTitle)}-${Date.now()}`,
      content: original.content,
      htmlContent: original.htmlContent,
      status: 'draft',
      wordCount: original.wordCount,
      keywords: original.keywords,
      sources: original.sources,
      customInstructions: original.customInstructions,
      metaDescription: original.metaDescription,
      wordRangeMin: original.wordRangeMin,
      wordRangeMax: original.wordRangeMax,
      categoryId: original.categoryId,
      topicId: original.topicId,
    },
  })

  return NextResponse.json(article)
}
