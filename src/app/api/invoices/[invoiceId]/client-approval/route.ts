// src/app/api/invoices/[invoiceId]/client-approval/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function POST(
  req: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { action, rejectionReason } = await req.json()

    // Validate action
    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Rejection reason is mandatory for REJECT
    if (action === 'REJECT' && !rejectionReason?.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const db = await getDatabase()
    const invoiceId = params.invoiceId

    // Find the invoice
    const invoice = await db.collection('invoices').findOne({
      _id: new ObjectId(invoiceId)
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Verify this client owns this invoice
    const clientIdStr = session.user.id
    const invoiceClientId = invoice.clientId?.toString()
    
    if (invoiceClientId !== clientIdStr) {
      return NextResponse.json({ error: 'You can only approve/reject your own invoices' }, { status: 403 })
    }

    // Update invoice with client approval status
    const updateData: any = {
      clientApprovalStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      clientApprovedAt: new Date(),
      clientApprovedBy: new ObjectId(session.user.id),
    }

    if (action === 'REJECT') {
      updateData.rejectionReason = rejectionReason.trim()
    } else {
      // Clear rejection reason on approval
      updateData.rejectionReason = null
    }

    const result = await db.collection('invoices').findOneAndUpdate(
      { _id: new ObjectId(invoiceId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    const updatedInvoice = (result as any).value || result

    console.log('[ClientApproval] ✅ Invoice updated:', {
      invoiceId,
      action,
      status: updatedInvoice?.clientApprovalStatus
    })

    // Also update related POD document if exists
    if (invoice.podId) {
      try {
        await db.collection('documents').updateOne(
          { _id: new ObjectId(invoice.podId), docType: 'POD' },
          {
            $set: {
              clientApprovalStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
              clientApprovedAt: new Date(),
              clientApprovedBy: new ObjectId(session.user.id),
              rejectionReason: action === 'REJECT' ? rejectionReason.trim() : null
            }
          }
        )
        console.log('[ClientApproval] ✅ POD document synced')
      } catch (err) {
        console.warn('[ClientApproval] ⚠️ Could not sync POD document:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'APPROVE' ? 'Invoice approved successfully' : 'Invoice rejected',
      invoice: updatedInvoice
    })

  } catch (error: any) {
    console.error('[ClientApproval] 💥 Error:', error)
    return NextResponse.json(
      { error: 'Failed to process approval', details: error.message },
      { status: 500 }
    )
  }
}
