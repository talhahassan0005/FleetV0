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

    // AUTO-VERIFY ACCOUNT: Check if user should be verified after approval
    // Only check for non-POD and non-INVOICE documents
    if (status === 'APPROVED' && doc.userId && doc.docType !== 'POD' && doc.docType !== 'INVOICE') {
      const user = await db.collection('users').findOne({ _id: doc.userId })
      
      if (user && !user.isVerified) {
        console.log(`[Account Verification] Checking ${user.role}: ${user.email}`)
        
        // Get all APPROVED documents for this user (excluding POD and INVOICE)
        const approvedDocs = await db.collection('documents').find({
          userId: doc.userId,
          verificationStatus: 'APPROVED',
          docType: { $nin: ['POD', 'INVOICE'] }
        }).toArray()

        const approvedDocTypes = approvedDocs.map((d: any) => d.docType)
        console.log(`[Account Verification] Approved doc types (excluding POD/INVOICE):`, approvedDocTypes)

        let shouldVerify = false

        // CLIENT verification: needs COMPANY + CUSTOM
        if (user.role === 'CLIENT') {
          const hasCompany = approvedDocTypes.includes('COMPANY')
          const hasCustom = approvedDocTypes.includes('CUSTOM') || approvedDocTypes.includes('CUSTOMS')
          
          console.log(`[Account Verification] CLIENT: COMPANY=${hasCompany}, CUSTOM=${hasCustom}`)
          
          if (hasCompany && hasCustom) {
            shouldVerify = true
          }
        }

        // TRANSPORTER verification: needs COMPANY + VEHICLE
        if (user.role === 'TRANSPORTER') {
          const hasCompany = approvedDocTypes.includes('COMPANY')
          const hasVehicle = approvedDocTypes.includes('VEHICLE') || approvedDocTypes.includes('REGISTRATION')
          
          console.log(`[Account Verification] TRANSPORTER: COMPANY=${hasCompany}, VEHICLE=${hasVehicle}`)
          
          if (hasCompany && hasVehicle) {
            shouldVerify = true
          }
        }

        if (shouldVerify) {
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
          console.log(`[Account Verification] ✅ ${user.role} account verified: ${user.email}`)
        } else {
          console.log(`[Account Verification] ⚠️ Not enough documents to verify ${user.role}`)
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
