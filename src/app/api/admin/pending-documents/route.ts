// src/app/api/admin/pending-documents/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
if (!user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(user?.role)) {
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
