// src/app/api/admin/pods/test/route.ts
/**
 * Simple test endpoint to verify POD data
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
        { error: 'Only admins can view POD details', role: session?.user?.role },
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
