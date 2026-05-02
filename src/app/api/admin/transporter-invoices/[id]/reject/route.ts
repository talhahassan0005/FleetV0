// src/app/api/admin/transporter-invoices/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { rejectionReason } = await req.json()

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const invoiceId = new ObjectId(params.id)

    // Get invoice from documents collection
    const invoice = await db.collection('documents').findOne({ 
      _id: invoiceId,
      docType: 'INVOICE'
    })
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Update invoice status
    await db.collection('documents').updateOne(
      { _id: invoiceId },
      {
        $set: {
          adminApprovalStatus: 'REJECTED',
          rejectionReason: rejectionReason.trim(),
          adminApprovedAt: new Date(),
          adminApprovedBy: new ObjectId(session.user.id),
          updatedAt: new Date()
        }
      }
    )

    // Send email to transporter
    const transporter = await db.collection('users').findOne({ _id: invoice.userId })
    const load = await db.collection('loads').findOne({ _id: invoice.loadId })
    
    if (transporter && transporter.email) {
      try {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">❌ Invoice Rejected</h2>
            <p>Dear ${transporter.companyName || 'Transporter'},</p>
            <p>Your invoice <strong>${invoice.originalName}</strong> has been rejected by our admin team.</p>
            <div style="background: #fee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p><strong>Load Reference:</strong> ${load?.ref || 'Unknown'}</p>
              <p><strong>Invoice:</strong> ${invoice.originalName}</p>
              <p><strong>Amount:</strong> ${load?.currency || 'ZAR'} ${(load?.finalPrice || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
              <p style="margin-top: 15px;"><strong>Rejection Reason:</strong></p>
              <p style="color: #dc2626;">${rejectionReason}</p>
            </div>
            <p>Please review the rejection reason and contact admin for further details.</p>
            <p style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/transporter/loads" style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Loads</a>
            </p>
          </div>
        `
        await sendEmail(
          transporter.email,
          `Invoice Rejected: ${invoice.originalName}`,
          emailContent
        )
      } catch (emailErr) {
        console.error('[RejectInvoice] Error sending email:', emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice rejected successfully'
    })

  } catch (error: any) {
    console.error('[RejectInvoice] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reject invoice', details: error.message },
      { status: 500 }
    )
  }
}
