// src/app/api/documents/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail, documentUploadAcknowledgementEmail, userVerifiedEmail, documentApprovedEmail, documentRejectedEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let comment: string, status: string
    try {
      const body = await req.json()
      comment = body.comment
      status = body.status
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON with comment and status.' },
        { status: 400 }
      )
    }

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

        // CLIENT verification: needs COMPANY + AUTHORIZATION + TAX_CLEARANCE (all 3 required)
        if (user.role === 'CLIENT') {
          // Accept both COMPANY and REGISTRATION as company document
          const hasCompany = approvedDocTypes.includes('COMPANY') || approvedDocTypes.includes('REGISTRATION')
          const hasAuthorization = approvedDocTypes.includes('AUTHORIZATION')
          const hasTaxClearance = approvedDocTypes.includes('TAX_CLEARANCE')
          
          console.log(`[Account Verification] CLIENT: COMPANY/REGISTRATION=${hasCompany}, AUTHORIZATION=${hasAuthorization}, TAX_CLEARANCE=${hasTaxClearance}`)
          
          if (hasCompany && hasAuthorization && hasTaxClearance) {
            shouldVerify = true
          }
        }

        // TRANSPORTER verification: needs all 6 documents
        if (user.role === 'TRANSPORTER') {
          // Accept both COMPANY and REGISTRATION as company document
          const hasCompany = approvedDocTypes.includes('COMPANY') || approvedDocTypes.includes('REGISTRATION')
          const hasBankConfirmation = approvedDocTypes.includes('BANK_CONFIRMATION')
          const hasAuthorization = approvedDocTypes.includes('AUTHORIZATION')
          const hasInsurance = approvedDocTypes.includes('INSURANCE')
          const hasTaxClearance = approvedDocTypes.includes('TAX_CLEARANCE')
          const hasVehicleList = approvedDocTypes.includes('VEHICLE_LIST')
          
          console.log(`[Account Verification] TRANSPORTER: COMPANY/REGISTRATION=${hasCompany}, BANK_CONFIRMATION=${hasBankConfirmation}, AUTHORIZATION=${hasAuthorization}, INSURANCE=${hasInsurance}, TAX_CLEARANCE=${hasTaxClearance}, VEHICLE_LIST=${hasVehicleList}`)
          console.log(`[Account Verification] TRANSPORTER approved doc types:`, approvedDocTypes)
          
          if (hasCompany && hasBankConfirmation && hasAuthorization && hasInsurance && hasTaxClearance && hasVehicleList) {
            shouldVerify = true
          }
        }

        if (shouldVerify) {
          await db.collection('users').updateOne(
            { _id: doc.userId },
            { 
              $set: { 
                isVerified: true,
                verificationStatus: 'VERIFIED',
                verifiedAt: new Date(),
                updatedAt: new Date()
              } 
            }
          )
          console.log(`[Account Verification] ✅ ${user.role} account verified: ${user.email}`)
          // Send account verified email
          try {
            const userName = user.companyName || user.name || user.email
            await sendEmail(
              user.email,
              'Your FleetXChange Account is Verified! ✅',
              userVerifiedEmail(userName, user.role)
            )
          } catch (emailErr) {
            console.error('[Reviews] Verified email failed (non-critical):', emailErr)
          }
        } else {
          console.log(`[Account Verification] ⚠️ Not enough documents to verify ${user.role}`)
          // Send document status email (approved/rejected)
          try {
            const userName = user.companyName || user.name || user.email
            if (status === 'APPROVED') {
              await sendEmail(user.email, 'Document Approved | FleetXChange', documentApprovedEmail(userName, doc.docType))
            } else if (status === 'REJECTED') {
              await sendEmail(user.email, 'Document Requires Attention | FleetXChange', documentRejectedEmail(userName, doc.docType, comment))
            }
          } catch (emailErr) {
            console.error('[Reviews] Status email failed (non-critical):', emailErr)
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