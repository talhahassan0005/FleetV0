// src/app/api/invoice/[id]/payment-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

interface PaymentStatusUpdate {
  paymentStatus: 'UNPAID' | 'PARTIAL_PAID' | 'PAID'
  paymentNotes: string
  paymentAmount?: number // For PARTIAL_PAID
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admin can update payment status
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admin can update payment status' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    const invoiceId = new ObjectId(params.id)
    const body = await req.json() as PaymentStatusUpdate

    const { paymentStatus, paymentNotes = '', paymentAmount } = body

    // Validation
    if (!paymentStatus || !['UNPAID', 'PARTIAL_PAID', 'PAID'].includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      )
    }

    // Get current invoice
    const invoice = await db.collection('invoices').findOne({ _id: invoiceId })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Update payment tracking
    const updateData = {
      paymentStatus,
      paymentNotes,
      paymentTrackedBy: new ObjectId(session.user.id),
      paymentTrackedAt: new Date(),
      updatedAt: new Date()
    }

    if (paymentStatus === 'PARTIAL_PAID' && paymentAmount) {
      Object.assign(updateData, { paymentAmount })
    }

    // If payment status changes, also update invoice status
    if (paymentStatus === 'PAID') {
      Object.assign(updateData, { status: 'PAID' })
    } else if (paymentStatus === 'PARTIAL_PAID' || (paymentStatus === 'UNPAID' && invoice.status === 'PAID')) {
      Object.assign(updateData, { status: 'AWAITING_PAYMENT' })
    }

    const result = await db.collection('invoices').findOneAndUpdate(
      { _id: invoiceId },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
    }

    // TODO: Send email notifications
    // - Transporter: Payment status updated
    // - Client: Receipt/payment confirmation (if PAID)

    // Serialize
    const serialized = {
      ...result.value,
      _id: result.value._id?.toString?.() || result.value._id,
      loadId: result.value.loadId?.toString?.() || result.value.loadId,
      transporterId: result.value.transporterId?.toString?.() || result.value.transporterId,
      clientId: result.value.clientId?.toString?.() || result.value.clientId,
      podId: result.value.podId?.toString?.() || result.value.podId,
      paymentTrackedBy: result.value.paymentTrackedBy?.toString?.() || result.value.paymentTrackedBy,
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      data: serialized
    })

  } catch (error: any) {
    console.error('Payment status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status', details: error.message },
      { status: 500 }
    )
  }
}
