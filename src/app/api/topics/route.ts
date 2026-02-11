import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('categoryId')
  const where = categoryId ? { categoryId } : {}
  const topics = await prisma.topic.findMany({
    where,
    include: { _count: { select: { articles: true } }, category: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(topics)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, categoryId } = body

  if (!name || !categoryId) {
    return NextResponse.json({ error: 'שם ומזהה קטגוריה נדרשים' }, { status: 400 })
  }

  const slug = slugify(name)
  const topic = await prisma.topic.create({
    data: { name, slug, description: description || null, categoryId },
  })
  return NextResponse.json(topic)
}
