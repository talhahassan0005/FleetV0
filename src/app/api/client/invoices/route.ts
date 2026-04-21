// src/app/api/client/invoices/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const db = await getDatabase()
  const clientId = session.user.id
  const clientObjectId = new mongoose.Types.ObjectId(clientId)

  console.log('[ClientInvoices] Fetching invoices for client:', clientId)

  // Query invoices where this client is the recipient:
  const invoices = await db.collection('invoices').find({
    $or: [
      { clientId: clientObjectId },
      { clientId: clientId },
      { userId: clientObjectId },
      { partyId: clientObjectId },
    ],
    invoiceType: 'CLIENT_INVOICE',
  })
  .sort({ createdAt: -1 })
  .toArray()

  console.log('[ClientInvoices] Found', invoices.length, 'invoices')

  // Map invoices to include qbLink from either direct field or qb_sync
  const mappedInvoices = invoices.map((inv: any) => ({
    _id: inv._id.toString(),
    invoiceNumber: inv.invoiceNumber,
    invoiceType: inv.invoiceType,
    amount: inv.amount,
    currency: inv.currency,
    paymentStatus: inv.paymentStatus,
    paymentAmount: inv.paymentAmount,
    createdAt: inv.createdAt,
    dueDate: inv.dueDate,
    loadRef: inv.loadRef,
    clientApprovalStatus: inv.clientApprovalStatus,
    rejectionReason: inv.rejectionReason,
    clientApprovedAt: inv.clientApprovedAt,
    clientApprovedBy: inv.clientApprovedBy?.toString(),
    qbLink: inv.qbLink || inv.qb_sync?.invoiceLink || null
    // markupPercentage, markupAmount intentionally excluded
  }))

  return NextResponse.json({ success: true, invoices: mappedInvoices })
}
