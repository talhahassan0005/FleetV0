// src/app/api/client/invoices/route.ts
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { NextResponse, NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req)
if (!authUser?.id || authUser.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const db = await getDatabase()
  const clientId = new ObjectId(authUser.id)

  const skip = parseInt(req.nextUrl.searchParams.get('skip') || '0', 10)
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10)

  const filter = { clientId, invoiceType: 'CLIENT_INVOICE' }
  const total = await db.collection('invoices').countDocuments(filter)

  const invoices = await db.collection('invoices').find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .toArray()

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

  return NextResponse.json({ success: true, invoices: invoicesWithDetails, total })
}