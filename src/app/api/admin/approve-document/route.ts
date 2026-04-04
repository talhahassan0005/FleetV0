// src/app/api/admin/approve-document/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { documentId, userId } = await req.json()

    if (!documentId || !userId) {
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
          verificationStatus: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.user.email,
        },
      }
    )

    // Check if all required documents for the user are approved
    const userDocuments = await db.collection('documents')
      .find({ userId: new ObjectId(userId) })
      .toArray()

    const allApproved = userDocuments.every(doc => doc.verificationStatus === 'APPROVED')

    if (allApproved) {
      // Mark user as verified
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            isVerified: true,
            verificationStatus: 'VERIFIED',
            verifiedAt: new Date(),
            verifiedBy: session.user.email,
            updatedAt: new Date(),
          },
        }
      )

      // Get user email to send notification
      const user = await db.collection('users').findOne({
        _id: new ObjectId(userId),
      })

      console.log(`[AdminApprove] User ${user?.email} account fully verified`)
      
      // TODO: Send email notification to user about account verification
    }

    return NextResponse.json({
      success: true,
      message: 'Document approved successfully',
      userFullyVerified: allApproved,
    })
  } catch (err: any) {
    console.error('[AdminApprove] Error:', err)
    return NextResponse.json(
      { error: 'Failed to approve document' },
      { status: 500 }
    )
  }
}
