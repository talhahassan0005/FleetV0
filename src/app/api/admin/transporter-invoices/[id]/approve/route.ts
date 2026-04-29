// src/app/api/admin/transporter-invoices/[id]/approve/route.ts
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

    const db = await getDatabase()
    const invoiceId = new ObjectId(params.id)

    // Get invoice
    const invoice = await db.collection('transporter_invoices').findOne({ _id: invoiceId })
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Update invoice status
    await db.collection('transporter_invoices').updateOne(
      { _id: invoiceId },
      {
        $set: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: new ObjectId(session.user.id),
          updatedAt: new Date()
        }
      }
    )

    // Send email to transporter
    const transporter = await db.collection('users').findOne({ _id: invoice.transporterId })
    const load = await db.collection('loads').findOne({ _id: invoice.loadId })
    
    if (transporter && transporter.email) {
      try {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3ab54a;">✅ Invoice Approved</h2>
            <p>Dear ${transporter.companyName || 'Transporter'},</p>
            <p>Your invoice <strong>${invoice.invoiceNumber}</strong> has been approved by our admin team.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Load Reference:</strong> ${load?.ref || 'Unknown'}</p>
              <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Amount:</strong> ${invoice.currency} ${invoice.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
              <p><strong>Tonnage:</strong> ${invoice.tonnage} tons</p>
            </div>
            <p>Payment processing will begin shortly.</p>
            <p style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/transporter/invoices" style="background-color: #3ab54a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Invoice</a>
            </p>
          </div>
        `
        await sendEmail(
          transporter.email,
          `Invoice Approved: ${invoice.invoiceNumber}`,
          emailContent
        )
      } catch (emailErr) {
        console.error('[ApproveInvoice] Error sending email:', emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice approved successfully'
    })

  } catch (error: any) {
    console.error('[ApproveInvoice] Error:', error)
    return NextResponse.json(
      { error: 'Failed to approve invoice', details: error.message },
      { status: 500 }
    )
  }
}
