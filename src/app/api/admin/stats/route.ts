// src/app/api/admin/stats/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDatabase } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const db = await getDatabase()

    // Get stats
    const totalUsers = await db.collection('users').countDocuments()
    const verifiedUsers = await db.collection('users').countDocuments({ isVerified: true })
    const unverifiedUsers = await db.collection('users').countDocuments({ isVerified: false })
    
    const pendingDocuments = await db.collection('documents').countDocuments({
      verificationStatus: 'PENDING',
    })
    
    const approvedDocuments = await db.collection('documents').countDocuments({
      verificationStatus: 'APPROVED',
    })
    
    const rejectedDocuments = await db.collection('documents').countDocuments({
      verificationStatus: 'REJECTED',
    })

    return NextResponse.json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      pendingVerifications: pendingDocuments,
      approvedDocuments,
      rejectedVerifications: rejectedDocuments,
    })
  } catch (err: any) {
    console.error('[AdminStats] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
