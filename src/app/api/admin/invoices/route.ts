// src/app/api/admin/invoices/route.ts
/**
 * GET all invoices for admin dashboard
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
if (!user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER','ADMIN'].includes(user?.role)) {
      return NextResponse.json(
        { error: 'Only admins can view invoices' },
        { status: 403 }
      )
    }

    const adminRole = (user as any).adminRole
    if (!hasPermission(adminRole, 'invoices')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await getDatabase()

    // Pagination parameters
    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Get total count first
    const total = await db.collection('invoices').countDocuments({})
    
    // Get all invoices for stats calculation (without pagination)
    const allInvoices = await db.collection('invoices').find({}).toArray()
    
    // Calculate correct stats from all invoices
    const stats = {
      total: allInvoices.length,
      unpaid: allInvoices.filter(i => i.paymentStatus === 'UNPAID').length,
      partialPaid: allInvoices.filter(i => i.paymentStatus === 'PARTIAL_PAID').length,
      paid: allInvoices.filter(i => i.paymentStatus === 'PAID').length,
      totalAmount: allInvoices.reduce((sum, i) => sum + (i.amount || 0), 0),
      collectedAmount: allInvoices.reduce((sum, i) => sum + (i.paymentAmount || 0), 0),
    }

    // Get paginated invoices with aggregation to get related data
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
        $skip: skip
      },
      {
        $limit: limit
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
      total,
      stats
    })

  } catch (error: any) {
    console.error('[AdminInvoices] 💥 Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error.message },
      { status: 500 }
    )
  }
}
