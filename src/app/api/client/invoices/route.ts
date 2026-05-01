// src/app/api/client/invoices/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const db = await getDatabase()
  const clientId = new ObjectId(session.user.id)

  console.log('[ClientInvoices] Fetching invoices for client:', session.user.id)

  // Get invoices from invoices collection where invoiceType is CLIENT_INVOICE
  const invoices = await db.collection('invoices').find({
    clientId,
    invoiceType: 'CLIENT_INVOICE'
  })
  .sort({ createdAt: -1 })
  .toArray()

  console.log('[ClientInvoices] Found', invoices.length, 'client invoices')

  // Get load details for each invoice
  const invoicesWithDetails = await Promise.all(
    invoices.map(async (invoice) => {
      const load = await db.collection('loads').findOne({ _id: invoice.loadId })
      
      return {
        _id: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        invoiceType: invoice.invoiceType,
        amount: invoice.amount,
        currency: invoice.currency,
        paymentStatus: invoice.paymentStatus,
        clientApprovalStatus: invoice.clientApprovalStatus,
        status: invoice.status,
        qbLink: invoice.qbLink || null,
        createdAt: invoice.createdAt,
        dueDate: invoice.dueDate,
        loadRef: load?.ref || 'Unknown',
      }
    })
  )

  return NextResponse.json({ success: true, invoices: invoicesWithDetails })
}