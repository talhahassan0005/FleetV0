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
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
          rejectionReason: !approved ? rejectionReason : undefined,
        },
      },
      { returnDocument: 'after' }
    )

    const updatedDocument = (result as any).value || result
    
    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
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
