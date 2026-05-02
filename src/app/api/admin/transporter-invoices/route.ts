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
    
    // Get all transporter invoices from documents collection
    const invoices = await db.collection('documents')
      .find({ docType: 'INVOICE', uploadedByRole: 'TRANSPORTER' })
      .sort({ createdAt: -1 })
      .toArray()

    // Get details for each invoice
    const invoicesWithDetails = await Promise.all(
      invoices.map(async (invoice) => {
        const load = await db.collection('loads').findOne({ _id: invoice.loadId })
        const transporter = await db.collection('users').findOne({ _id: invoice.userId })
        const client = await db.collection('users').findOne({ _id: load?.clientId })
        
        // Get linked POD to check admin approval status
        const pod = await db.collection('documents').findOne({
          _id: invoice.relatedPodId,
          docType: 'POD'
        })
        
        return {
          _id: invoice._id.toString(),
          invoiceNumber: invoice.originalName || 'Invoice',
          amount: load?.finalPrice || 0,
          currency: load?.currency || 'ZAR',
          tonnage: load?.totalTonnage || load?.weight || 0,
          status: invoice.adminApprovalStatus || 'PENDING_ADMIN',
          rejectionReason: invoice.rejectionReason,
          submittedAt: invoice.createdAt,
          reviewedAt: invoice.adminApprovedAt,
          invoicePdfUrl: invoice.fileUrl,
          invoicePdfName: invoice.originalName,
          notes: invoice.notes,
          loadRef: load?.ref || 'Unknown',
          loadRoute: load ? `${load.origin} → ${load.destination}` : 'Unknown',
          transporterName: transporter?.companyName || 'Unknown',
          clientName: client?.companyName || 'Unknown',
          podStatus: pod?.adminApprovalStatus || 'PENDING_ADMIN'
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
