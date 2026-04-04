// src/app/api/quotes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { z } from 'zod'

const schema = z.object({
  loadId: z.string(),
  price:  z.number().positive(),
  notes:  z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'TRANSPORTER')
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const db = await getDatabase()
    const body = schema.parse(await req.json())
    const loadId = new ObjectId(body.loadId)
    const userId = new ObjectId(session.user.id)

    const existing = await db.collection('quotes').findOne({
      loadId, transporterId: userId,
    })
    if (existing) return NextResponse.json({ error: 'Already quoted.' }, { status: 400 })

    const load = await db.collection('loads').findOne({ _id: loadId })
    if (!load || !['QUOTING', 'APPROVED', 'PENDING'].includes(load.status))
      return NextResponse.json({ error: 'Load not available for quoting.' }, { status: 400 })

    const result = await db.collection('quotes').insertOne({
      loadId, transporterId: userId, price: body.price, notes: body.notes, status: 'PENDING', createdAt: new Date(), updatedAt: new Date(),
    })

    const user = await db.collection('users').findOne({ _id: userId })
    await db.collection('loadUpdates').insertOne({
      loadId,
      userId,
      message: `Quote submitted by ${user?.companyName}: ${load.currency} ${body.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      createdAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId, loadId: body.loadId, transporterId: session.user.id, price: body.price, notes: body.notes }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
