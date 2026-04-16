// src/app/api/documents/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail, documentApprovedEmail, documentRejectedEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Allow both ADMIN and CLIENT to approve documents
    const role = session.user.role
    if (!['ADMIN', 'CLIENT'].includes(role)) {
      return NextResponse.json({ error: 'Only admins and clients can approve documents' }, { status: 403 })
    }

    const { approved, visibleTo, rejectionReason } = await req.json()

    const db = await getDatabase()

    // First, fetch the document to get the owner's details
    const document = await db.collection('documents').findOne({ _id: new ObjectId(params.id) })
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const result = await db.collection('documents').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          visibleTo: approved ? visibleTo || 'CLIENT,TRANSPORTER' : 'ADMIN',
          approved: approved || false,
          verificationStatus: approved ? 'APPROVED' : 'REJECTED',
          rejectionReason: !approved ? rejectionReason : undefined,
          // Update client approval status (for invoices and PODs)
          clientApprovalStatus: approved ? 'APPROVED' : 'REJECTED',
          clientApprovedAt: new Date(),
          clientApprovedBy: new ObjectId(session.user.id),
        },
      },
      { returnDocument: 'after' }
    )

    const updatedDocument = (result as any).value || result
    
    console.log('[ApproveDocument] 📋 Document updated:', {
      documentId: params.id,
      docType: updatedDocument?.docType,
      approved: updatedDocument?.approved,
      verificationStatus: updatedDocument?.verificationStatus,
      clientApprovalStatus: updatedDocument?.clientApprovalStatus,
      role: role
    })

    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // If ADMIN is approving a verification document, check if user should be verified
    if (role === 'ADMIN' && approved && updatedDocument.docType && ['COMPANY', 'REGISTRATION', 'CUSTOMS'].includes(updatedDocument.docType)) {
      console.log('[ApproveDocument] 🔍 Admin approved verification document, checking user verification status...')
      
      const userId = updatedDocument.userId
      if (userId) {
        // Check if all required documents for the user are approved
        const userDocuments = await db.collection('documents')
          .find({ 
            userId: userId,
            docType: { $in: ['COMPANY', 'REGISTRATION', 'CUSTOMS'] }
          })
          .toArray()

        console.log('[ApproveDocument] User required documents:', userDocuments.length)
        console.log('[ApproveDocument] Document statuses:', userDocuments.map(d => ({ type: d.docType, status: d.verificationStatus })))

        const allApproved = userDocuments.length > 0 && userDocuments.every(doc => doc.verificationStatus === 'APPROVED')

        if (allApproved) {
          const userUpdateResult = await db.collection('users').updateOne(
            { _id: userId },
            {
              $set: {
                isVerified: true,
                verificationStatus: 'VERIFIED',
                verifiedAt: new Date(),
                verifiedBy: session.user.email || session.user.id,
                updatedAt: new Date(),
              },
            }
          )
          console.log('[ApproveDocument] ✅ User account verified! Update result:', userUpdateResult)
        } else {
          console.log('[ApproveDocument] ⚠️ Not all required documents approved yet')
        }
      }
    }

    // SYNC POD AND INVOICE: If this is an invoice, also update related POD
    if (updatedDocument.docType === 'INVOICE') {
      console.log('[ApproveDocument] 🔗 Syncing POD status with invoice approval...')
      try {
        // Try using relatedPodId first, then fallback to finding by loadId
        const podUpdateQuery = updatedDocument.relatedPodId 
          ? { _id: updatedDocument.relatedPodId, docType: 'POD' }
          : { loadId: updatedDocument.loadId, docType: 'POD' }
          
        const podUpdateResult = await db.collection('documents').updateOne(
          podUpdateQuery,
          {
            $set: {
              clientApprovalStatus: approved ? 'APPROVED' : 'REJECTED',
              clientApprovedAt: new Date(),
              clientApprovedBy: new ObjectId(session.user.id),
            }
          }
        )
        console.log('[ApproveDocument] ✅ POD synced - Modified:', podUpdateResult.modifiedCount)
      } catch (podSyncErr) {
        console.warn('[ApproveDocument] ⚠️  Could not sync POD:', podSyncErr)
        // Don't fail the approval if sync fails
      }
    }
    
    // ALSO: If this is a POD, find and update related INVOICE
    if (updatedDocument.docType === 'POD') {
      console.log('[ApproveDocument] 🔗 Syncing INVOICE status with POD approval...')
      try {
        const invoiceUpdateResult = await db.collection('documents').updateOne(
          { relatedPodId: updatedDocument._id, docType: 'INVOICE' },
          {
            $set: {
              clientApprovalStatus: approved ? 'APPROVED' : 'REJECTED',
              clientApprovedAt: new Date(),
              clientApprovedBy: new ObjectId(session.user.id),
            }
          }
        )
        console.log('[ApproveDocument] ✅ INVOICE synced - Modified:', invoiceUpdateResult.modifiedCount)
      } catch (invoiceSyncErr) {
        console.warn('[ApproveDocument] ⚠️  Could not sync INVOICE:', invoiceSyncErr)
        // Don't fail the approval if sync fails
      }
    }

    // Send email notification to document owner
    try {
      const owner = await db.collection('users').findOne({ _id: updatedDocument.userId })
      
      console.log('[ApproveDocument] Document owner fetched:', { 
        ownerId: updatedDocument.userId?.toString?.(), 
        ownerEmail: owner?.email,
        ownerCompany: owner?.companyName,
        hasEmail: !!owner?.email 
      })
      
      if (owner && owner.email) {
        if (approved) {
          // Send approval email
          const emailContent = documentApprovedEmail(
            owner.companyName || 'User',
            updatedDocument.docType || 'Document'
          )
          console.log('[ApproveDocument] Sending APPROVAL email to:', owner.email)
          const emailSent = await sendEmail(
            owner.email,
            `✅ Document Approved: ${updatedDocument.docType}`,
            emailContent
          )
          console.log('[ApproveDocument] ✅ Approval email result:', emailSent)
        } else {
          // Send rejection email
          const emailContent = documentRejectedEmail(
            owner.companyName || 'User',
            updatedDocument.docType || 'Document',
            rejectionReason || 'Document does not meet our requirements'
          )
          console.log('[ApproveDocument] Sending REJECTION email to:', owner.email)
          const emailSent = await sendEmail(
            owner.email,
            `❌ Document Rejected: ${updatedDocument.docType}`,
            emailContent
          )
          console.log('[ApproveDocument] ✅ Rejection email result:', emailSent)
        }
      } else {
        console.warn('[ApproveDocument] ⚠️  No owner or email found for document')
      }
    } catch (emailErr) {
      console.error('[ApproveDocument] ⚠️  Error sending email:', emailErr)
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      message: approved ? 'Document approved' : 'Document rejected',
      data: updatedDocument,
    })
  } catch (err: any) {
    console.error('Approve document error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
