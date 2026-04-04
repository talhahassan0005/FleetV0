// src/app/api/loads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { genRef } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  origin:              z.string().min(1),
  destination:         z.string().min(1),
  cargoType:           z.string().optional(),
  weight:              z.string().optional(),
  collectionDate:      z.string().optional(),
  deliveryDate:        z.string().optional(),
  specialInstructions: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let loads

  if (session.user.role === 'ADMIN') {
    loads = await prisma.load.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        client:              { select: { id: true, companyName: true, contactName: true, phone: true, email: true } },
        assignedTransporter: { select: { id: true, companyName: true, phone: true } },
        quotes:              { include: { transporter: { select: { id: true, companyName: true, phone: true } } } },
        updates:             { include: { user: { select: { companyName: true } } }, orderBy: { createdAt: 'asc' } },
        documents:           true,
        invoices:            true,
        trackingLinks:       { where: { isActive: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
  } else if (session.user.role === 'CLIENT') {
    loads = await prisma.load.findMany({
      where: { clientId: session.user.id },
      include: {
        updates:       { orderBy: { createdAt: 'asc' } },
        documents:     true,
        invoices:      true,
        trackingLinks: { where: { isActive: true }, take: 1 },
        assignedTransporter: { select: { companyName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } else if (session.user.role === 'TRANSPORTER') {
    // Transporters see available (quoting) + their assigned loads
    const assigned = await prisma.load.findMany({
      where: { assignedTransporterId: session.user.id },
      include: {
        updates:   { orderBy: { createdAt: 'asc' } },
        documents: { where: { visibleTo: { contains: 'TRANSPORTER' } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    const available = await prisma.load.findMany({
      where: { status: 'QUOTING' },
      include: {
        client: { select: { companyName: true } },
        quotes: { where: { transporterId: session.user.id }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ assigned, available })
  }

  return NextResponse.json(loads)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'CLIENT')
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (!session.user.isVerified)
    return NextResponse.json({ error: 'Account not verified yet.' }, { status: 403 })

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const load = await prisma.load.create({
      data: {
        ref:       genRef(),
        clientId:  session.user.id,
        status:    'PENDING',
        ...data,
      },
    })

    await prisma.loadUpdate.create({
      data: {
        loadId:  load.id,
        userId:  session.user.id,
        message: `Load posted by ${session.user.companyName}`,
        statusChange: 'PENDING',
      },
    })

    return NextResponse.json(load, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
