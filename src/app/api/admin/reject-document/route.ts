// src/app/api/admin/reject-document/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { documentId, reason } = await req.json()

    if (!documentId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Update document status
    await db.collection('documents').updateOne(
      { _id: new ObjectId(documentId) },
      {
        $set: {
          verificationStatus: 'REJECTED',
          rejectionReason: reason,
          rejectedAt: new Date(),
          rejectedBy: session.user.email,
        },
      }
    )

    // Get document to find user
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(documentId),
    })

    // Get user info
    const user = await db.collection('users').findOne({
      _id: document?.userId,
    })

    console.log(`[AdminReject] Document for user ${user?.email} rejected. Reason: ${reason}`)

    // TODO: Send email notification to user about rejection with reason

    return NextResponse.json({
      success: true,
      message: `Document rejected. User will be notified.`,
    })
  } catch (err: any) {
    console.error('[AdminReject] Error:', err)
    return NextResponse.json(
      { error: 'Failed to reject document' },
      { status: 500 }
    )
  }
}
