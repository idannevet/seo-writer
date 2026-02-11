import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: { topics: { include: { _count: { select: { articles: true } } } } },
  })
  if (!category) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 })
  return NextResponse.json(category)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { name, description, color } = body
  const data: Record<string, unknown> = {}
  if (name) { data.name = name; data.slug = slugify(name) }
  if (description !== undefined) data.description = description
  if (color) data.color = color

  const category = await prisma.category.update({ where: { id: params.id }, data })
  return NextResponse.json(category)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.category.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
