// src/app/api/user/can-post-load/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
if (!user?.email || !user?.role) {
      return NextResponse.json(
        { canPostLoad: false, reason: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Only clients can post loads
    if (user.role !== 'CLIENT') {
      return NextResponse.json({
        canPostLoad: false,
        reason: 'Only clients can post loads',
      })
    }

    const db = await getDatabase()
    const user = await db.collection('users').findOne({
      email: user.email.toLowerCase(),
    })

    if (!user) {
      return NextResponse.json({
        canPostLoad: false,
        reason: 'User not found',
      })
    }

    if (!user.isVerified) {
      return NextResponse.json({
        canPostLoad: false,
        reason: 'Account not verified. Please upload documents.',
        verificationStatus: user.verificationStatus || 'PENDING',
        documentsSubmitted: user.documentsSubmitted || false,
      })
    }

    return NextResponse.json({
      canPostLoad: true,
      reason: 'Account verified',
    })
  } catch (err: any) {
    console.error('[CanPostLoad] Error:', err)
    return NextResponse.json(
      { canPostLoad: false, reason: 'Server error' },
      { status: 500 }
    )
  }
}
