import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function GET() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { articles: true, topics: true } },
      topics: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, color } = body

  if (!name) {
    return NextResponse.json({ error: 'שם קטגוריה נדרש' }, { status: 400 })
  }

  const slug = slugify(name)

  const category = await prisma.category.create({
    data: { name, slug, description: description || null, color: color || '#6366f1' },
  })

  return NextResponse.json(category)
}
