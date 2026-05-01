// src/app/api/admin/pods/pending/route.ts
/**
 * GET pending PODs for admin approval
 * Lists all PODs waiting for admin review
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Only admins can view POD approvals' },
        { status: 403 }
      )
    }

    const db = await getDatabase()

    // Get all PODs pending admin approval
    const pendingPODs = await db.collection('documents').find({
      docType: 'POD',
      adminApprovalStatus: 'PENDING_ADMIN'
    })
    .sort({ createdAt: -1 })
    .toArray()

    console.log('[AdminPODs] Found', pendingPODs.length, 'pending PODs')
    console.log('[AdminPODs] Sample POD:', pendingPODs[0])

    // Enrich with load and transporter details
    const enrichedPODs = await Promise.all(
      pendingPODs.map(async (pod: any) => {
        try {
          const load = await db.collection('loads').findOne({
            _id: pod.loadId
          })

          const transporter = await db.collection('users').findOne({
            _id: pod.userId
          })

          console.log('[AdminPODs] POD:', pod._id.toString(), 'userId:', pod.userId?.toString(), 'Transporter:', transporter?.companyName)

          // Check if there's an invoice document linked to this POD (in documents collection)
          const invoiceDoc = await db.collection('documents').findOne({
            relatedPodId: new ObjectId(pod._id),
            docType: 'INVOICE'
          })

          // Also check transporter_invoices collection for backward compatibility
          const transporterInvoice = await db.collection('transporter_invoices').findOne({
            podId: pod._id
          })

          const invoice = invoiceDoc || transporterInvoice

          const enriched = {
            _id: pod._id.toString(),
            loadRef: load?.ref || 'Unknown',
            origin: load?.origin || 'Unknown',
            destination: load?.destination || 'Unknown',
            transporterName: transporter?.companyName || transporter?.name || 'Unknown',
            transporterEmail: transporter?.email || '',
            uploadedAt: pod.createdAt,
            podFileName: pod.originalName,
            podUrl: pod.fileUrl,
            status: pod.adminApprovalStatus,
            loadId: pod.loadId?.toString(),
            amount: load?.finalPrice || 0,
            currency: load?.currency || 'ZAR',
            tonnage: load?.totalTonnage || load?.weight || 0,
            invoiceId: invoice?._id?.toString(),
            invoiceNumber: invoice?.invoiceNumber || (invoiceDoc ? invoiceDoc.originalName : null),
            invoicePdfUrl: invoice?.invoicePdfUrl || invoice?.fileUrl,
          }
          
          console.log('[AdminPODs] Enriched POD:', {
            id: enriched._id,
            transporter: enriched.transporterName,
            hasInvoice: !!enriched.invoiceId
          })
          return enriched
        } catch (err: any) {
          console.error('[AdminPODs] Error enriching POD:', err, pod._id)
          return {
            _id: pod._id.toString(),
            loadRef: 'Error',
            origin: 'Unknown',
            destination: 'Unknown',
            transporterName: 'Unknown',
            transporterEmail: '',
            uploadedAt: pod.createdAt,
            podFileName: pod.originalName,
            podUrl: pod.fileUrl,
            status: pod.adminApprovalStatus,
            loadId: pod.loadId?.toString(),
            amount: 0,
            currency: 'ZAR',
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: enrichedPODs,
      count: enrichedPODs.length,
    })

  } catch (error: any) {
    console.error('[AdminPODs] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending PODs', details: error.message },
      { status: 500 }
    )
  }
}
