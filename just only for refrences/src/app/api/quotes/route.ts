// src/app/api/quotes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  loadId: z.string(),
  price:  z.number().positive(),
  notes:  z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TRANSPORTER')
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const body = schema.parse(await req.json())

    const existing = await prisma.quote.findFirst({
      where: { loadId: body.loadId, transporterId: session.user.id },
    })
    if (existing) return NextResponse.json({ error: 'Already quoted.' }, { status: 400 })

    const load = await prisma.load.findUnique({ where: { id: body.loadId } })
    if (!load || load.status !== 'QUOTING')
      return NextResponse.json({ error: 'Load not available for quoting.' }, { status: 400 })

    const quote = await prisma.quote.create({
      data: { loadId: body.loadId, transporterId: session.user.id, price: body.price, notes: body.notes },
    })

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    await prisma.loadUpdate.create({
      data: {
        loadId:  body.loadId,
        userId:  session.user.id,
        message: `Quote submitted by ${user?.companyName}: ${load.currency} ${body.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
