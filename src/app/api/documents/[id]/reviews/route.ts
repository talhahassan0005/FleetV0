// src/app/api/documents/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { comment, status } = await req.json()

    if (!comment || !status) {
      return NextResponse.json(
        { error: 'Missing comment or status' },
        { status: 400 }
      )
    }

    if (!params.id || params.id === 'undefined') {
      console.error('Missing or invalid document ID in params:', params.id)
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    let docId: any
    
    // Try to create ObjectId, handle various formats
    try {
      docId = new ObjectId(params.id)
    } catch (err: any) {
      console.error('ObjectId creation error:', err.message, 'ID:', params.id, 'Type:', typeof params.id)
      return NextResponse.json(
        { error: 'Invalid document ID format', details: err.message },
        { status: 400 }
      )
    }
    
    const userId = new ObjectId(session.user.id)

    const doc = await db.collection('documents').findOne({
      _id: docId,
    })

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if user already reviewed this document
    const existingReview = doc.reviews?.find(
      (r: any) => r.reviewerId?.toString() === session.user.id
    )

    if (existingReview) {
      // If already approved or rejected, don't allow changes - idempotent behavior
      if (existingReview.status === 'APPROVED' || existingReview.status === 'REJECTED') {
        return NextResponse.json(
          { 
            error: `Document already ${existingReview.status.toLowerCase()}. Cannot change approval status.`,
            details: `This document was ${existingReview.status.toLowerCase()} on ${existingReview.timestamp}`
          },
          { status: 400 }
        )
      }
      
      // If pending, allow update
      await db.collection('documents').updateOne(
        { _id: docId, 'reviews.reviewerId': userId },
        {
          $set: {
            'reviews.$.status': status,
            'reviews.$.comment': comment,
            'reviews.$.timestamp': new Date(),
            verificationStatus: status,
            updatedAt: new Date()
          },
        } as any
      )
    } else {
      // Add new review AND update verification status in same operation
      await db.collection('documents').updateOne(
        { _id: docId },
        {
          $push: {
            reviews: {
              reviewerId: userId,
              reviewerRole: session.user.role,
              status,
              comment,
              timestamp: new Date(),
            },
          },
          $set: {
            verificationStatus: status,
            updatedAt: new Date()
          }
        } as any
      )
    }

    console.log(`[Document Review] Document ${docId} status updated to: ${status}`)

    // Check if user account should be verified based on approved documents
    if (status === 'APPROVED' && doc.userId) {
      const user = await db.collection('users').findOne({ _id: doc.userId })
      
      if (user) {
        console.log(`[Document Review] Checking verification for ${user.role}: ${user.email}`)
        
        // Get all approved documents for this user (including the one we just approved)
        const approvedDocs = await db.collection('documents').find({
          userId: doc.userId,
          verificationStatus: 'APPROVED'
        }).toArray()

        const approvedDocTypes = approvedDocs.map((d: any) => d.docType)
        console.log(`[Document Review] Approved doc types:`, approvedDocTypes)

        // CLIENT verification: needs COMPANY + CUSTOMS
        if (user.role === 'CLIENT') {
          const hasCompany = approvedDocTypes.includes('COMPANY')
          const hasCustoms = approvedDocTypes.includes('CUSTOMS')
          
          console.log(`[Document Review] CLIENT check: COMPANY=${hasCompany}, CUSTOMS=${hasCustoms}, isVerified=${user.isVerified}`)
          
          if (hasCompany && hasCustoms && !user.isVerified) {
            await db.collection('users').updateOne(
              { _id: doc.userId },
              { 
                $set: { 
                  isVerified: true, 
                  verifiedAt: new Date(),
                  updatedAt: new Date()
                } 
              }
            )
            console.log(`[Document Review] ✅ CLIENT account verified: ${user.email}`)
          }
        }

        // TRANSPORTER verification: needs COMPANY + REGISTRATION
        if (user.role === 'TRANSPORTER') {
          const hasCompany = approvedDocTypes.includes('COMPANY')
          const hasRegistration = approvedDocTypes.includes('REGISTRATION')
          
          console.log(`[Document Review] TRANSPORTER check: COMPANY=${hasCompany}, REGISTRATION=${hasRegistration}, isVerified=${user.isVerified}`)
          
          if (hasCompany && hasRegistration && !user.isVerified) {
            await db.collection('users').updateOne(
              { _id: doc.userId },
              { 
                $set: { 
                  isVerified: true, 
                  verifiedAt: new Date(),
                  updatedAt: new Date()
                } 
              }
            )
            console.log(`[Document Review] ✅ TRANSPORTER account verified: ${user.email}`)
          }
        }
      }
    }

    const updated = await db.collection('documents').findOne({
      _id: docId,
    })

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('Review error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
