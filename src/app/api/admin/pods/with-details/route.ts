// src/app/api/admin/pods/with-details/route.ts
/**
 * GET PODs with enriched load and transporter details for admin dashboard
 * Returns all PODs pending admin approval with full context
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

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can view POD details' },
        { status: 403 }
      )
    }

    const db = await getDatabase()

    // Get all PODs
    const pods = await db.collection('documents').find({
      docType: 'POD'
    }).sort({ createdAt: -1 }).toArray()

    // Enrich each POD with load and transporter details
    const enrichedPods = await Promise.all(
      pods.map(async (pod: any) => {
        try {
          // Get load details
          const load = await db.collection('loads').findOne({
            _id: pod.loadId
          })

          // Get transporter details
          const transporter = await db.collection('users').findOne({
            _id: pod.userId
          })

          // Get client details (from load)
          const client = load ? await db.collection('users').findOne({
            _id: load.clientId
          }) : null

          return {
            // POD documents info
            _id: pod._id.toString(),
            originalName: pod.originalName,
            fileUrl: pod.fileUrl,
            docType: pod.docType,
            createdAt: pod.createdAt,
            
            // Approval status
            adminApprovalStatus: pod.adminApprovalStatus || 'PENDING_ADMIN',
            adminApprovedAt: pod.adminApprovedAt,
            adminApprovedBy: pod.adminApprovedBy,
            adminComments: pod.adminComments || '',
            clientApprovalStatus: pod.clientApprovalStatus || 'PENDING_CLIENT',
            clientApprovedAt: pod.clientApprovedAt,
            
            // Load details
            loadId: pod.loadId?.toString(),
            loadRef: load?.ref || 'Unknown',
            origin: load?.origin || 'Unknown',
            destination: load?.destination || 'Unknown',
            route: load ? `${load.origin} → ${load.destination}` : 'Unknown',
            loadStatus: load?.status || 'Unknown',
            finalPrice: load?.finalPrice || 0,
            currency: load?.currency || 'ZAR',
            tonnes: load?.tonnes || 0,
            
            // Transporter details
            transporterId: pod.userId?.toString(),
            transporterName: transporter?.companyName || transporter?.name || 'Unknown',
            transporterEmail: transporter?.email || '',
            transporterPhone: transporter?.phone || '',
            
            // Client details
            clientId: load?.clientId?.toString(),
            clientName: client?.companyName || client?.name || 'Unknown',
            clientEmail: client?.email || '',
          }
        } catch (err: any) {
          console.error('[EnrichedPods] Error enriching POD:', err, pod._id)
          // Return minimal data if enrichment fails
          return {
            _id: pod._id.toString(),
            originalName: pod.originalName,
            fileUrl: pod.fileUrl,
            docType: pod.docType,
            createdAt: pod.createdAt,
            adminApprovalStatus: pod.adminApprovalStatus || 'PENDING_ADMIN',
            adminComments: pod.adminComments || '',
            clientApprovalStatus: pod.clientApprovalStatus || 'PENDING_CLIENT',
            loadId: pod.loadId?.toString(),
            loadRef: 'Error',
            route: 'Unable to load',
            transporterName: 'Unknown',
            transporterEmail: ''
          }
        }
      })
    )

    console.log('[EnrichedPods] Returning', enrichedPods.length, 'PODs with details')

    return NextResponse.json({
      success: true,
      data: enrichedPods,
      stats: {
        total: enrichedPods.length,
        pendingAdmin: enrichedPods.filter(p => p.adminApprovalStatus === 'PENDING_ADMIN').length,
        approved: enrichedPods.filter(p => p.adminApprovalStatus === 'APPROVED').length,
      }
    })

  } catch (error: any) {
    console.error('[EnrichedPods] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PODs with details', details: error.message },
      { status: 500 }
    )
  }
}
