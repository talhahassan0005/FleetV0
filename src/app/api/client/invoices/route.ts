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

  // Query invoices where this client is the recipient:
  const invoices = await db.collection('invoices').find({
    $or: [
      { clientId: new mongoose.Types.ObjectId(clientId) },
      { clientId: clientId },
      { userId: new mongoose.Types.ObjectId(clientId) },
      { partyId: new mongoose.Types.ObjectId(clientId) },
    ],
    invoiceType: 'CLIENT_INVOICE',
  })
  .sort({ createdAt: -1 })
  .project({
    _id: 1,
    invoiceNumber: 1,
    invoiceType: 1,
    amount: 1,
    currency: 1,
    paymentStatus: 1,
    paymentAmount: 1,
    createdAt: 1,
    dueDate: 1,
    loadRef: 1,
    clientApprovalStatus: 1,
    rejectionReason: 1,
    clientApprovedAt: 1,
    clientApprovedBy: 1,
    qbLink: 1,
    'qb_sync.invoiceLink': 1
  })
  .toArray()

  // Map invoices to include qbLink from either direct field or qb_sync
  const mappedInvoices = invoices.map((inv: any) => ({
    ...inv,
    qbLink: inv.qbLink || inv.qb_sync?.invoiceLink || null
  }))

  return NextResponse.json({ success: true, invoices: mappedInvoices })
}
