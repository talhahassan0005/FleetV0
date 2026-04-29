// src/app/api/admin/transporter-invoices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    
    // Get all transporter invoices
    const invoices = await db.collection('transporter_invoices')
      .find({})
      .sort({ submittedAt: -1 })
      .toArray()

    // Get details for each invoice
    const invoicesWithDetails = await Promise.all(
      invoices.map(async (invoice) => {
        const load = await db.collection('loads').findOne({ _id: invoice.loadId })
        const transporter = await db.collection('users').findOne({ _id: invoice.transporterId })
        const client = await db.collection('users').findOne({ _id: invoice.clientId })
        
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
          loadRoute: load ? `${load.origin} → ${load.destination}` : 'Unknown',
          transporterName: transporter?.companyName || 'Unknown',
          clientName: client?.companyName || 'Unknown'
        }
      })
    )

    return NextResponse.json({
      success: true,
      invoices: invoicesWithDetails
    })

  } catch (error: any) {
    console.error('[AdminTransporterInvoices] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error.message },
      { status: 500 }
    )
  }
}
