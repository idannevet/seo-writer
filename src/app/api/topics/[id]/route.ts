import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.name) { data.name = body.name; data.slug = slugify(body.name) }
  if (body.description !== undefined) data.description = body.description

  const topic = await prisma.topic.update({ where: { id: params.id }, data })
  return NextResponse.json(topic)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.topic.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
