// src/app/api/loads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { genToken } from '@/lib/utils'

async function expireTracking(loadId: string) {
  await prisma.trackingLink.updateMany({
    where: { loadId, isActive: true },
    data:  { isActive: false, expiredAt: new Date() },
  })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const load = await prisma.load.findUnique({
    where: { id: params.id },
    include: {
      client:              { select: { id: true, companyName: true, contactName: true, phone: true, email: true } },
      assignedTransporter: { select: { id: true, companyName: true, phone: true } },
      quotes:              { include: { transporter: { select: { id: true, companyName: true, phone: true } } } },
      updates:             { include: { user: { select: { companyName: true } } }, orderBy: { createdAt: 'asc' } },
      documents:           true,
      invoices:            true,
      trackingLinks:       { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  if (!load) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Access control
  if (session.user.role === 'CLIENT' && load.clientId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (session.user.role === 'TRANSPORTER' &&
      load.assignedTransporterId !== session.user.id &&
      load.status !== 'QUOTING')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json(load)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { action } = body
  const load = await prisma.load.findUnique({ where: { id: params.id } })
  if (!load) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // ── ADMIN ACTIONS ──────────────────────────────────────────────────────────
  if (session.user.role === 'ADMIN') {

    if (action === 'release') {
      await prisma.load.update({ where: { id: params.id }, data: { status: 'QUOTING' } })
      await prisma.loadUpdate.create({ data: { loadId: params.id, userId: session.user.id, message: 'Load released to transporters for quoting.', statusChange: 'QUOTING' } })
      return NextResponse.json({ ok: true })
    }

    if (action === 'sendQuote') {
      const { finalPrice, currency } = body
      await prisma.load.update({ where: { id: params.id }, data: { finalPrice: parseFloat(finalPrice), currency: currency ?? 'ZAR', status: 'QUOTED' } })
      await prisma.loadUpdate.create({ data: { loadId: params.id, userId: session.user.id, message: `Quote sent to client: ${currency ?? 'ZAR'} ${parseFloat(finalPrice).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, statusChange: 'QUOTED' } })
      return NextResponse.json({ ok: true })
    }

    if (action === 'assign') {
      const { transporterId } = body
      const transporter = await prisma.user.findUnique({ where: { id: transporterId } })
      if (!transporter) return NextResponse.json({ error: 'Transporter not found' }, { status: 404 })
      await prisma.load.update({ where: { id: params.id }, data: { assignedTransporterId: transporterId, status: 'ASSIGNED' } })
      await prisma.quote.updateMany({ where: { loadId: params.id, transporterId }, data: { status: 'ACCEPTED' } })
      await prisma.quote.updateMany({ where: { loadId: params.id, NOT: { transporterId } }, data: { status: 'REJECTED' } })
      await prisma.loadUpdate.create({ data: { loadId: params.id, userId: session.user.id, message: `Transporter assigned: ${transporter.companyName}`, statusChange: 'ASSIGNED' } })
      return NextResponse.json({ ok: true })
    }

    if (action === 'updateStatus') {
      const { status, message } = body
      await prisma.load.update({ where: { id: params.id }, data: { status } })
      await prisma.loadUpdate.create({ data: { loadId: params.id, userId: session.user.id, message: message || `Status updated to ${status}`, statusChange: status } })
      if (status === 'DELIVERED') await expireTracking(params.id)
      return NextResponse.json({ ok: true })
    }

    if (action === 'createTracking') {
      const existing = await prisma.trackingLink.findFirst({ where: { loadId: params.id, isActive: true } })
      if (existing) return NextResponse.json({ token: existing.token })
      const link = await prisma.trackingLink.create({ data: { loadId: params.id, token: genToken() } })
      await prisma.loadUpdate.create({ data: { loadId: params.id, userId: session.user.id, message: 'Live tracking link created and shared with client.' } })
      return NextResponse.json({ token: link.token })
    }

    if (action === 'expireTracking') {
      await expireTracking(params.id)
      return NextResponse.json({ ok: true })
    }
  }

  // ── CLIENT ACTIONS ─────────────────────────────────────────────────────────
  if (session.user.role === 'CLIENT' && load.clientId === session.user.id) {
    if (action === 'approveQuote' && load.status === 'QUOTED') {
      await prisma.load.update({ where: { id: params.id }, data: { status: 'APPROVED' } })
      await prisma.loadUpdate.create({ data: { loadId: params.id, userId: session.user.id, message: 'Client approved the quote.', statusChange: 'APPROVED' } })
      return NextResponse.json({ ok: true })
    }
  }

  // ── TRANSPORTER ACTIONS ────────────────────────────────────────────────────
  if (session.user.role === 'TRANSPORTER' && load.assignedTransporterId === session.user.id) {
    if (action === 'updateProgress') {
      const { status, message } = body
      if (status && ['IN_TRANSIT', 'DELIVERED'].includes(status)) {
        await prisma.load.update({ where: { id: params.id }, data: { status } })
        if (status === 'DELIVERED') await expireTracking(params.id)
      }
      if (message) {
        await prisma.loadUpdate.create({ data: { loadId: params.id, userId: session.user.id, message, statusChange: status ?? undefined } })
      }
      return NextResponse.json({ ok: true })
    }
  }

  return NextResponse.json({ error: 'Action not permitted' }, { status: 403 })
}
