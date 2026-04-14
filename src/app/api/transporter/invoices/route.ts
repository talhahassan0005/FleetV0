// src/app/api/transporter/invoices/route.ts
/**
 * Get invoices for a transporter
 * Returns both TRANSPORTER_INVOICE (what transporter receives)
 * and their related CLIENT_INVOICE (what client pays)
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Invoice } from '@/lib/models'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== 'TRANSPORTER') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    console.log('[TransporterInvoice] 📊 Fetching invoices for transporter:', session.user.id)

    // Get all TRANSPORTER_INVOICE records for this transporter
    const invoices = await Invoice.find({
      transporterId: session.user.id,
      invoiceType: 'TRANSPORTER_INVOICE'
    })
      .populate({
        path: 'loadId',
        select: 'ref origin destination currency'
      })
      .populate({
        path: 'clientId',
        select: 'companyName email'
      })
      .sort({ createdAt: -1 })
      .lean()

    console.log('[TransporterInvoice] ✅ Found', invoices.length, 'invoices for transporter')

    // Map to response format
    const mappedInvoices = invoices.map((inv: any) => ({
      _id: inv._id,
      loadId: inv.loadId?._id,
      invoiceNumber: inv.invoiceNumber,
      invoiceType: inv.invoiceType || 'TRANSPORTER_INVOICE',
      amount: inv.amount,
      currency: inv.currency,
      paymentStatus: inv.paymentStatus || 'UNPAID',
      paymentAmount: inv.paymentAmount || 0,
      createdAt: inv.createdAt,
      dueDate: inv.dueDate,
      loadRef: inv.loadId?.ref || null,
      status: inv.status,
      qbLink: inv.qbLink || null,
      clientCompanyName: inv.clientId?.companyName || 'Unknown Client'
    }))

    return Response.json({
      success: true,
      invoices: mappedInvoices,
      count: mappedInvoices.length
    })
  } catch (error) {
    console.error('[TransporterInvoice] ❌ Error fetching invoices:', error)
    return Response.json(
      { error: 'Failed to fetch invoices', details: String(error) },
      { status: 500 }
    )
  }
}
