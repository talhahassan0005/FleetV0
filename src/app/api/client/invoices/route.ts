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

  // Get invoices from new client_invoices collection
  const invoices = await db.collection('client_invoices').find({
    clientId
  })
  .sort({ createdAt: -1 })
  .toArray()

  console.log('[ClientInvoices] Found', invoices.length, 'invoices')

  // Get load details for each invoice
  const invoicesWithDetails = await Promise.all(
    invoices.map(async (invoice) => {
      const load = await db.collection('loads').findOne({ _id: invoice.loadId })
      
      return {
        _id: invoice._id.toString(),
        quickbooksInvoiceNumber: invoice.quickbooksInvoiceNumber,
        quickbooksInvoicePdfUrl: invoice.quickbooksInvoicePdfUrl,
        quickbooksInvoicePdfName: invoice.quickbooksInvoicePdfName,
        amount: invoice.amount,
        currency: invoice.currency,
        tonnage: invoice.tonnage,
        status: invoice.status,
        paymentStatus: invoice.paymentStatus,
        paymentDate: invoice.paymentDate,
        createdAt: invoice.createdAt,
        sentAt: invoice.sentAt,
        notes: invoice.notes,
        loadRef: load?.ref || 'Unknown',
        loadRoute: load ? `${load.origin} → ${load.destination}` : 'Unknown'
      }
    })
  )

  return NextResponse.json({ success: true, invoices: invoicesWithDetails })
}