// src/app/api/loads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { genToken } from '@/lib/utils'
import { ObjectId } from 'mongodb'

async function expireTracking(db: any, loadId: string) {
  await db.collection('trackingLinks').updateMany(
    { loadId: new ObjectId(loadId), isActive: true },
    { $set: { isActive: false, expiredAt: new Date() } }
  )
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const db = await getDatabase()
  const loadId = new ObjectId(params.id)

  const load = await db.collection('loads').findOne({ _id: loadId })

  if (!load) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Access control
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'CLIENT' && load.clientId?.toString() !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (session.user.role === 'TRANSPORTER' &&
      load.assignedTransporterId?.toString() !== session.user.id &&
      !['QUOTING', 'APPROVED', 'PENDING'].includes(load.status))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Fetch documents associated with this load
  const documents = await db.collection('documents').find({
    loadId: loadId,
    docType: { $nin: ['POD', 'INVOICE'] } // Exclude POD and INVOICE from load details
  }).toArray()

  // Serialize documents
  const serializedDocs = documents.map((doc: any) => ({
    _id: doc._id?.toString(),
    originalName: doc.originalName,
    fileUrl: doc.fileUrl,
    fileMimeType: doc.fileMimeType,
    docType: doc.docType,
    uploadedByRole: doc.uploadedByRole,
    createdAt: doc.createdAt
  }))

  return NextResponse.json({
    ...load,
    documents: serializedDocs
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const db = await getDatabase()
  const body = await req.json()
  const { action } = body
  const loadId = new ObjectId(params.id)

  const load = await db.collection('loads').findOne({ _id: loadId })
  if (!load) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // ── ADMIN ACTIONS ──────────────────────────────────────────────────────────
  if (session.user.role === 'ADMIN') {
    if (action === 'release') {
      await db.collection('loads').updateOne({ _id: loadId }, { $set: { status: 'QUOTING', updatedAt: new Date() } })
      await db.collection('loadUpdates').insertOne({ loadId, userId: new ObjectId(session.user.id), message: 'Load released to transporters for quoting.', statusChange: 'QUOTING', createdAt: new Date() })
      return NextResponse.json({ ok: true })
    }

    if (action === 'sendQuote') {
      const { finalPrice, currency } = body
      await db.collection('loads').updateOne({ _id: loadId }, { $set: { finalPrice: parseFloat(finalPrice), currency: currency ?? 'ZAR', status: 'QUOTED', updatedAt: new Date() } })
      await db.collection('loadUpdates').insertOne({ loadId, userId: new ObjectId(session.user.id), message: `Quote sent to client: ${currency ?? 'ZAR'} ${parseFloat(finalPrice).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, statusChange: 'QUOTED', createdAt: new Date() })
      return NextResponse.json({ ok: true })
    }

    if (action === 'assign') {
      const { transporterId } = body
      const transporter = await db.collection('users').findOne({ _id: new ObjectId(transporterId) })
      if (!transporter) return NextResponse.json({ error: 'Transporter not found' }, { status: 404 })
      
      const transporterObjectId = new ObjectId(transporterId)
      await db.collection('loads').updateOne({ _id: loadId }, { $set: { assignedTransporterId: transporterObjectId, status: 'ASSIGNED', updatedAt: new Date() } })
      await db.collection('quotes').updateMany({ loadId, transporterId: transporterObjectId }, { $set: { status: 'ACCEPTED', updatedAt: new Date() } })
      await db.collection('quotes').updateMany({ loadId, transporterId: { $ne: transporterObjectId } }, { $set: { status: 'REJECTED', updatedAt: new Date() } })
      await db.collection('loadUpdates').insertOne({ loadId, userId: new ObjectId(session.user.id), message: `Transporter assigned: ${transporter.companyName}`, statusChange: 'ASSIGNED', createdAt: new Date() })
      return NextResponse.json({ ok: true })
    }

    if (action === 'updateStatus') {
      const { status, message } = body
      await db.collection('loads').updateOne({ _id: loadId }, { $set: { status, updatedAt: new Date() } })
      await db.collection('loadUpdates').insertOne({ loadId, userId: new ObjectId(session.user.id), message: message || `Status updated to ${status}`, statusChange: status, createdAt: new Date() })
      if (status === 'DELIVERED') await expireTracking(db, params.id)
      return NextResponse.json({ ok: true })
    }

    if (action === 'createTracking') {
      const existing = await db.collection('trackingLinks').findOne({ loadId, isActive: true })
      if (existing) return NextResponse.json({ token: existing.token })
      const token = genToken()
      await db.collection('trackingLinks').insertOne({ loadId, token, isActive: true, createdAt: new Date() })
      await db.collection('loadUpdates').insertOne({ loadId, userId: new ObjectId(session.user.id), message: 'Live tracking link created and shared with client.', createdAt: new Date() })
      return NextResponse.json({ token })
    }

    if (action === 'expireTracking') {
      await expireTracking(db, params.id)
      return NextResponse.json({ ok: true })
    }
  }

  // ── CLIENT ACTIONS ─────────────────────────────────────────────────────────
  if (session.user.role === 'CLIENT' && load.clientId?.toString() === session.user.id) {
    if (action === 'approveQuote' && load.status === 'QUOTED') {
      await db.collection('loads').updateOne({ _id: loadId }, { $set: { status: 'APPROVED', updatedAt: new Date() } })
      await db.collection('loadUpdates').insertOne({ loadId, userId: new ObjectId(session.user.id), message: 'Client approved the quote.', statusChange: 'APPROVED', createdAt: new Date() })
      return NextResponse.json({ ok: true })
    }
  }

  // ── TRANSPORTER ACTIONS ────────────────────────────────────────────────────
  if (session.user.role === 'TRANSPORTER' && load.assignedTransporterId?.toString() === session.user.id) {
    if (action === 'updateProgress') {
      const { status, message } = body
      if (status && ['IN_TRANSIT', 'DELIVERED'].includes(status)) {
        await db.collection('loads').updateOne({ _id: loadId }, { $set: { status, updatedAt: new Date() } })
        if (status === 'DELIVERED') await expireTracking(db, params.id)
      }
      if (message) {
        await db.collection('loadUpdates').insertOne({ loadId, userId: new ObjectId(session.user.id), message, statusChange: status ?? undefined, createdAt: new Date() })
      }
      return NextResponse.json({ ok: true })
    }
  }

  return NextResponse.json({ error: 'Action not permitted' }, { status: 403 })
}
