import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { countWords } from '@/lib/utils'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      topic: true,
      generationLogs: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
  if (!article) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 })
  return NextResponse.json(article)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (body.title !== undefined) data.title = body.title
  if (body.htmlContent !== undefined) {
    data.htmlContent = body.htmlContent
    data.content = body.htmlContent
    data.wordCount = countWords(body.htmlContent)
  }
  if (body.status !== undefined) {
    data.status = body.status
    if (body.status === 'published') data.publishedAt = new Date()
  }
  if (body.categoryId !== undefined) data.categoryId = body.categoryId
  if (body.topicId !== undefined) data.topicId = body.topicId
  if (body.keywords !== undefined) data.keywords = JSON.stringify(body.keywords)
  if (body.sources !== undefined) data.sources = JSON.stringify(body.sources)

  const article = await prisma.article.update({ where: { id: params.id }, data })
  return NextResponse.json(article)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.article.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
