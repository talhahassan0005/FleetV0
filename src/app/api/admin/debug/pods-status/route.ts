// src/app/api/admin/debug/pods-status/route.ts
/**
 * DEBUG ENDPOINT: Check PODs status in database
 * Shows all PODs and their approval statuses
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can access debug info' },
        { status: 403 }
      )
    }

    const db = await getDatabase()

    // Get all PODs with all statuses
    const allPODs = await db.collection('documents').find({
      docType: 'POD'
    }).sort({ createdAt: -1 }).toArray()

    console.log('[DebugPODs] Total PODs in DB:', allPODs.length)

    // Group by status
    const statusGroups = {
      PENDING_ADMIN: allPODs.filter(p => p.adminApprovalStatus === 'PENDING_ADMIN'),
      APPROVED: allPODs.filter(p => p.adminApprovalStatus === 'APPROVED'),
      NO_STATUS: allPODs.filter(p => !p.adminApprovalStatus),
    }

    // Enrich PENDING_ADMIN PODs
    const pendingEnriched = await Promise.all(
      statusGroups.PENDING_ADMIN.map(async (pod: any) => {
        const load = await db.collection('loads').findOne({ _id: pod.loadId })
        const transporter = await db.collection('users').findOne({ _id: pod.userId })
        return {
          id: pod._id.toString(),
          loadRef: load?.ref || 'Unknown',
          transporter: transporter?.companyName || 'Unknown',
          uploaded: pod.createdAt,
        }
      })
    )

    return NextResponse.json({
      success: true,
      summary: {
        totalPODs: allPODs.length,
        pendingAdmin: statusGroups.PENDING_ADMIN.length,
        approved: statusGroups.APPROVED.length,
        missing_status: statusGroups.NO_STATUS.length,
      },
      pending_pods: pendingEnriched,
      all_pods_summary: allPODs.map((p: any) => ({
        id: p._id.toString(),
        adminStatus: p.adminApprovalStatus || 'MISSING',
        clientStatus: p.clientApprovalStatus || 'MISSING',
        created: p.createdAt,
      }))
    })

  } catch (error: any) {
    console.error('[DebugPODs] Error:', error)
    return NextResponse.json(
      { error: 'Debug error', details: error.message },
      { status: 500 }
    )
  }
}
