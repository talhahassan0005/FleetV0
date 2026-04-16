import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { generateQBInvoiceLink, generateQBBillLink } from '@/lib/quickbooks'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can view invoices' },
        { status: 403 }
      )
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
          // FIX BUG 1: Clear rejection reason if status is PENDING (defensive against corrupted data)
          rejectionReason: {
            $cond: [
              { $eq: ['$clientApprovalStatus', 'PENDING_CLIENT_APPROVAL'] },
              null,  // Return null for pending invoices - should never have rejection reason
              '$rejectionReason'  // Keep original for APPROVED/REJECTED invoices
            ]
          }
        }
      }
    ]).toArray()

    console.log('[AdminInvoices] ✅ Retrieved', invoices.length, 'invoices')

    // FIX BUG 2: Fallback - regenerate QB links if missing but qbInvoiceId exists
    const invoicesWithQBLinks = invoices.map(invoice => {
      if ((!invoice.qbLink || invoice.qbLink === '') && invoice.qbInvoiceId) {
        // Regenerate the QB link from the invoice ID
        const isProduction = process.env.QUICKBOOKS_ENVIRONMENT === 'PRODUCTION';
        const baseURL = isProduction 
          ? 'https://qbo.intuit.com'
          : 'https://app.sandbox.qbo.intuit.com';
        invoice.qbLink = `${baseURL}/app/invoice?txnId=${invoice.qbInvoiceId}`;
        console.log(`[AdminInvoices] 🔗 Regenerated QB link for invoice ${invoice.invoiceNumber}: ${invoice.qbLink}`);
      }
      return invoice;
    });

    return NextResponse.json({
      success: true,
      invoices: invoicesWithQBLinks,
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
