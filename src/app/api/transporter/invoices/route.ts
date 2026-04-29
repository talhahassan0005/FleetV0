import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'TRANSPORTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const db = await getDatabase()
  const transporterId = new ObjectId(session.user.id)

  // Get invoices from new transporter_invoices collection
  const invoices = await db.collection('transporter_invoices').find({
    transporterId
  })
  .sort({ createdAt: -1 })
  .toArray()

  // Get load details for each invoice
  const invoicesWithDetails = await Promise.all(
    invoices.map(async (invoice) => {
      const load = await db.collection('loads').findOne({ _id: invoice.loadId })
      return {
        _id: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        currency: invoice.currency,
        tonnage: invoice.tonnage,
        status: invoice.status,
        rejectionReason: invoice.rejectionReason,
        submittedAt: invoice.submittedAt,
        reviewedAt: invoice.reviewedAt,
        invoicePdfUrl: invoice.invoicePdfUrl,
        invoicePdfName: invoice.invoicePdfName,
        notes: invoice.notes,
        loadRef: load?.ref || 'Unknown',
        loadRoute: load ? `${load.origin} → ${load.destination}` : 'Unknown'
      }
    })
  )

  return NextResponse.json({ success: true, invoices: invoicesWithDetails })
}