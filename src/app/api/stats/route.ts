import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      select: { id: true, title: true, status: true, createdAt: true, category: { select: { name: true, color: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.category.findMany({
      include: { _count: { select: { articles: true } } },
    }),
  ])

  const byStatus: Record<string, number> = {}
  articles.forEach(a => {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1
  })

  const totalArticles = await prisma.article.count()

  return NextResponse.json({
    totalArticles,
    byStatus,
    byCategory: categories.map(c => ({ name: c.name, color: c.color, count: c._count.articles })),
    recentArticles: articles,
  })
}
