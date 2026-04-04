// src/app/api/admin/pending-documents/route.ts
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
    
    const documents = await db.collection('documents')
      .aggregate([
        { 
          $match: { verificationStatus: 'PENDING' }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray()

    return NextResponse.json({
      success: true,
      documents,
    })
  } catch (err: any) {
    console.error('[AdminPendingDocs] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch pending documents' },
      { status: 500 }
    )
  }
}
