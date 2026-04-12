// src/app/api/invoice/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const invoiceId = new ObjectId(params.id)
    const userId = new ObjectId(session.user.id)
    const role = session.user.role

    const invoice = await db.collection('invoices').findOne({ _id: invoiceId })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Authorization: User can only view their own invoices or admin can view all
    if (role === 'TRANSPORTER' && invoice.transporterId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have access to this invoice' },
        { status: 403 }
      )
    }

    if (role === 'CLIENT' && invoice.clientId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have access to this invoice' },
        { status: 403 }
      )
    }

    // Serialize ObjectIds
    const serialized = {
      ...invoice,
      _id: invoice._id?.toString?.() || invoice._id,
      loadId: invoice.loadId?.toString?.() || invoice.loadId,
      transporterId: invoice.transporterId?.toString?.() || invoice.transporterId,
      clientId: invoice.clientId?.toString?.() || invoice.clientId,
      podId: invoice.podId?.toString?.() || invoice.podId,
    }

    return NextResponse.json({
      success: true,
      data: serialized
    })

  } catch (error: any) {
    console.error('Invoice fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const invoiceId = new ObjectId(params.id)
    const body = await req.json()

    const invoice = await db.collection('invoices').findOne({ _id: invoiceId })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Can only update own invoice or admin can update any
    if (session.user.role !== 'ADMIN' && invoice.transporterId?.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this invoice' },
        { status: 403 }
      )
    }

    // Update allowed fields
    const allowedUpdates: any = {}

    if (body.comments !== undefined) {
      allowedUpdates.comments = body.comments
    }

    if (body.status !== undefined && session.user.role === 'ADMIN') {
      // Only admin can change status
      const validStatuses = [
        'PENDING_ADMIN_APPROVAL',
        'SENT_TO_CLIENT',
        'AWAITING_PAYMENT',
        'PAID',
        'REJECTED'
      ]
      if (validStatuses.includes(body.status)) {
        allowedUpdates.status = body.status
      }
    }

    allowedUpdates.updatedAt = new Date()

    const result = await db.collection('invoices').findOneAndUpdate(
      { _id: invoiceId },
      { $set: allowedUpdates },
      { returnDocument: 'after' }
    )

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }

    // Serialize
    const serialized = {
      ...result.value,
      _id: result.value._id?.toString?.() || result.value._id,
      loadId: result.value.loadId?.toString?.() || result.value.loadId,
      transporterId: result.value.transporterId?.toString?.() || result.value.transporterId,
      clientId: result.value.clientId?.toString?.() || result.value.clientId,
      podId: result.value.podId?.toString?.() || result.value.podId,
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice updated successfully',
      data: serialized
    })

  } catch (error: any) {
    console.error('Invoice update error:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice', details: error.message },
      { status: 500 }
    )
  }
}
