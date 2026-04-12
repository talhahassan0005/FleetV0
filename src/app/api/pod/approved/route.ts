// src/app/api/pod/approved/route.ts
// Returns PODs ready for invoice creation (uploaded by transporter, no invoice created yet)
export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  // Only ADMIN can fetch PODs for invoice creation
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDatabase()
    
    console.log('[ApprovedPODs] 📦 Fetching PODs ready for invoice creation')

    // Get POD documents that are APPROVED by BOTH admin AND client
    const approvedPODs = await db.collection('documents').find({
      docType: 'POD',
      uploadedByRole: 'TRANSPORTER',
      adminApprovalStatus: 'APPROVED',     // Admin must approve the POD
      clientApprovalStatus: 'APPROVED'     // Client must also approve the POD
    }).sort({ createdAt: -1 }).toArray()

    console.log('[ApprovedPODs] Found total approved PODs:', approvedPODs.length)

    // Enrich with load data and check if invoice exists
    const enrichedPODs = await Promise.all(
      approvedPODs.map(async (pod) => {
        const load = await db.collection('loads').findOne({
          _id: pod.loadId
        })

        // Check if an invoice has been SYNCED TO QB already
        // (has qbInvoiceLink means it was successfully created in QB)
        const existingQBInvoice = await db.collection('documents').findOne({
          loadId: pod.loadId,
          docType: 'INVOICE',
          qbInvoiceLink: { $exists: true, $ne: null }  // Only invoice if it has QB link
        })

        return {
          _id: pod._id.toString(),
          loadId: pod.loadId.toString(),
          userId: pod.userId.toString(),  // ✅ ADD: Transporter's user ID
          filename: pod.originalName,
          fileUrl: pod.fileUrl,
          uploadedAt: pod.createdAt,
          uploadedBy: pod.uploadedByRole,
          approved: pod.approved || false,
          // Load details
          loadRef: load?.ref || 'N/A',
          origin: load?.origin || '',
          destination: load?.destination || '',
          cargoType: load?.cargoType || '',
          weight: load?.weight || 0,
          currency: load?.currency || 'ZAR',
          transporterAmount: load?.finalPrice || 0,
          // Check if invoice already exists
          hasInvoice: !!existingQBInvoice,
        }
      })
    )

    // Filter out PODs that already have invoices
    const availableForInvoicing = enrichedPODs.filter(pod => !pod.hasInvoice)

    console.log('[ApprovedPODs] Total PODs:', enrichedPODs.length)
    console.log('[ApprovedPODs] Available for invoicing:', availableForInvoicing.length)

    return Response.json({
      success: true,
      pods: availableForInvoicing,
      count: availableForInvoicing.length,
    })
  } catch (error) {
    console.error('[ApprovedPODs] Error:', error)
    return Response.json({ error: 'Failed to fetch approved PODs' }, { status: 500 })
  }
}
