// src/app/api/admin/pods/test/route.ts
/**
 * Simple test endpoint to verify POD data
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
if (!user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(user?.role)) {
      return NextResponse.json(
        { error: 'Only admins can view POD details', role: user?.role },
        { status: 403 }
      )
    }

    const db = await getDatabase()

    // Get all PODs - raw data
    const pods = await db.collection('documents').find({
      docType: 'POD'
    }).limit(5).toArray()

    console.log('[TestPODs] Found', pods.length, 'PODs')
    console.log('[TestPODs] Sample POD:', pods[0])

    return NextResponse.json({
      success: true,
      count: pods.length,
      data: pods.map((p: any) => ({
        _id: p._id?.toString(),
        loadId: p.loadId?.toString(),
        userId: p.userId?.toString(),
        originalName: p.originalName,
        adminApprovalStatus: p.adminApprovalStatus,
        createdAt: p.createdAt,
      })),
      samplePod: pods[0] ? {
        _id: pods[0]._id?.toString(),
        loadId: pods[0].loadId?.toString(),
        userId: pods[0].userId?.toString(),
        adminApprovalStatus: pods[0].adminApprovalStatus,
      } : null
    })

  } catch (error: any) {
    console.error('[TestPODs] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
