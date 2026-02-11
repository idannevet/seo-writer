import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const status = sp.get('status')
  const categoryId = sp.get('categoryId')
  const topicId = sp.get('topicId')
  const search = sp.get('search')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (categoryId) where.categoryId = categoryId
  if (topicId) where.topicId = topicId
  if (search) where.title = { contains: search }

  const articles = await prisma.article.findMany({
    where,
    include: {
      category: { select: { name: true, color: true } },
      topic: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(articles)
}
