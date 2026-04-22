// src/app/api/admin/invoices/route.ts
/**
 * GET all invoices for admin dashboard
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Only admins can view invoices' },
        { status: 403 }
      )
    }

    const adminRole = (session.user as any).adminRole
    if (!hasPermission(adminRole, 'invoices')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await getDatabase()

    // Get all invoices with aggregation to get related data
    const invoices = await db.collection('invoices').aggregate([
      {
        $match: {}
      },
      {
        $lookup: {
          from: 'loads',
          localField: 'loadId',
          foreignField: '_id',
          as: 'load'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'transporterId',
          foreignField: '_id',
          as: 'transporter'
        }
      },
      {
        $lookup: {
          from: 'documents',
          localField: 'loadId',
          foreignField: 'loadId',
          pipeline: [
            {
              $match: { docType: 'INVOICE' }
            }
          ],
          as: 'invoiceDocuments'
        }
      },
      {
        $unwind: {
          path: '$load',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$client',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$transporter',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          _id: 1,
          invoiceNumber: 1,
          invoiceType: 1,
          amount: 1,
          currency: 1,
          paymentStatus: 1,
          paymentAmount: 1,
          paymentNotes: 1,
          paymentTrackedAt: 1,
          createdAt: 1,
          dueDate: 1,
          loadRef: '$load.ref',
          tonnage: '$tonnageForThisInvoice',
          progressPercentage: 1,
          clientName: '$client.name',
          clientEmail: '$client.email',
          transporterName: '$transporter.companyName',
          transporterEmail: '$transporter.email',
          podId: 1,
          linkedTransporterInvoiceId: 1,
          markupPercentage: 1,
          markupAmount: 1,
          qbLink: 1,
          qbInvoiceId: 1,
          clientApprovalStatus: 1,
          rejectionReason: 1,
          clientApprovedAt: 1,
          clientApprovedBy: 1
        }
      }
    ]).toArray()

    console.log('[AdminInvoices] ✅ Retrieved', invoices.length, 'invoices')

    return NextResponse.json({
      success: true,
      invoices,
      stats: {
        total: invoices.length,
        unpaid: invoices.filter(i => i.paymentStatus === 'UNPAID').length,
        partialPaid: invoices.filter(i => i.paymentStatus === 'PARTIAL_PAID').length,
        paid: invoices.filter(i => i.paymentStatus === 'PAID').length,
        totalAmount: invoices.reduce((sum, i) => sum + (i.amount || 0), 0),
        collectedAmount: invoices.reduce((sum, i) => sum + (i.paymentAmount || 0), 0),
      }
    })

  } catch (error: any) {
    console.error('[AdminInvoices] 💥 Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error.message },
      { status: 500 }
    )
  }
}
