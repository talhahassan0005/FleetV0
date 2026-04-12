// src/app/api/client/pods/pending-approval/route.ts
/**
 * GET PODs pending client approval
 * Lists PODs that have been approved by admin but need client approval
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

    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Only clients can view their PODs' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    const clientId = new ObjectId(session.user.id)

    // Get all loads for this client
    const clientLoads = await db.collection('loads')
      .find({ clientId: clientId })
      .project({ _id: 1 })
      .toArray()

    const loadIds = clientLoads.map(l => l._id)

    // Get PODs for client's loads that are pending client approval
    const pendingPODs = await db.collection('documents').find({
      docType: 'POD',
      loadId: { $in: loadIds },
      adminApprovalStatus: 'APPROVED',
      clientApprovalStatus: 'PENDING_CLIENT'
    })
    .sort({ createdAt: -1 })
    .toArray()

    console.log('[ClientPODs] Found', pendingPODs.length, 'pending PODs for client')

    // Enrich with load and transporter details
    const enrichedPODs = await Promise.all(
      pendingPODs.map(async (pod: any) => {
        const load = await db.collection('loads').findOne({
          _id: pod.loadId
        })

        const transporter = await db.collection('users').findOne({
          _id: pod.userId
        })

        return {
          _id: pod._id.toString(),
          loadRef: load?.ref,
          origin: load?.origin,
          destination: load?.destination,
          cargoType: load?.cargoType,
          transporterName: transporter?.companyName,
          uploadedAt: pod.createdAt,
          adminApprovedAt: pod.adminApprovedAt,
          podFileName: pod.originalName,
          podUrl: pod.fileUrl,
          status: pod.clientApprovalStatus,
          loadId: pod.loadId.toString(),
          amount: load?.finalPrice,
          currency: load?.currency || 'ZAR',
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: enrichedPODs,
      count: enrichedPODs.length,
    })

  } catch (error: any) {
    console.error('[ClientPODs] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending PODs', details: error.message },
      { status: 500 }
    )
  }
}
