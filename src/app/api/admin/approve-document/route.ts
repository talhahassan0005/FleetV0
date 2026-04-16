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
    const docUpdateResult = await db.collection('documents').updateOne(
      { _id: new ObjectId(documentId) },
      {
        $set: {
          verificationStatus: 'APPROVED',
          approved: true,
          approvedAt: new Date(),
          approvedBy: session.user.email,
        },
      }
    )

    console.log('[AdminApprove] Document update result:', docUpdateResult)

    // Get the user to check their role and documents
    const user = await db.collection('users').findOne({
      _id: new ObjectId(userId),
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[AdminApprove] User role:', user.role, 'Current verification status:', user.verificationStatus)

    // Check if all required documents for the user are approved
    const userDocuments = await db.collection('documents')
      .find({ 
        userId: new ObjectId(userId),
        docType: { $in: ['COMPANY', 'REGISTRATION', 'CUSTOMS'] } // Required document types
      })
      .toArray()

    console.log('[AdminApprove] Total required documents:', userDocuments.length)
    console.log('[AdminApprove] Document statuses:', userDocuments.map(d => ({ type: d.docType, status: d.verificationStatus })))

    const allApproved = userDocuments.length > 0 && userDocuments.every(doc => doc.verificationStatus === 'APPROVED')

    console.log('[AdminApprove] All documents approved?', allApproved)

    if (allApproved) {
      // Mark user as verified
      const userUpdateResult = await db.collection('users').updateOne(
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

      console.log('[AdminApprove] User verification update result:', userUpdateResult)
      console.log(`[AdminApprove] ✅ User ${user?.email} account fully verified`)
      
      // TODO: Send email notification to user about account verification
    } else {
      console.log('[AdminApprove] ⚠️ Not all documents approved yet, user remains unverified')
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
