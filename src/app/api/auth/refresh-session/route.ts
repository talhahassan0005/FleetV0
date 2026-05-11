// src/app/api/auth/refresh-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
if (!authUser?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const user = await db.collection('users').findOne({
      _id: new ObjectId(authUser.id),
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return fresh user data for session update
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        isVerified: user.isVerified || false,
        verificationStatus: user.verificationStatus,
        verificationComment: user.verificationComment,
      },
    })
  } catch (err: any) {
    console.error('[RefreshSession] Error:', err)
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    )
  }
}
