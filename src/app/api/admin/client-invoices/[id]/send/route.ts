// src/app/api/admin/client-invoices/[id]/send/route.ts
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

    // Get client invoice
    const invoice = await db.collection('client_invoices').findOne({ _id: invoiceId })
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Get client details
    const client = await db.collection('users').findOne({ _id: invoice.clientId })
    if (!client || !client.email) {
      return NextResponse.json({ error: 'Client email not found' }, { status: 404 })
    }

    // Get load details
    const load = await db.collection('loads').findOne({ _id: invoice.loadId })

    // Update invoice status
    await db.collection('client_invoices').updateOne(
      { _id: invoiceId },
      {
        $set: {
          status: 'SENT',
          sentAt: new Date(),
          sentBy: new ObjectId(session.user.id),
          updatedAt: new Date()
        }
      }
    )

    // Send email to client with invoice
    try {
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a2a5e;">📄 Invoice from FleetXChange</h2>
          <p>Dear ${client.companyName || 'Client'},</p>
          <p>Please find attached your invoice for the completed shipment.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Invoice Number:</strong> ${invoice.quickbooksInvoiceNumber}</p>
            <p><strong>Load Reference:</strong> ${load?.ref || 'Unknown'}</p>
            <p><strong>Route:</strong> ${load ? `${load.origin} → ${load.destination}` : 'Unknown'}</p>
            <p><strong>Amount Due:</strong> ${invoice.currency} ${invoice.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            <p><strong>Tonnage:</strong> ${invoice.tonnage} tons</p>
          </div>
          
          <p>You can download your invoice using the button below:</p>
          
          <p style="margin: 30px 0;">
            <a href="${invoice.quickbooksInvoicePdfUrl}" style="background-color: #3ab54a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Download Invoice PDF</a>
          </p>
          
          <p>You can also view and download this invoice anytime from your client portal:</p>
          <p style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/client/invoices" style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View in Portal</a>
          </p>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
            If you have any questions about this invoice, please contact our accounts team.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Best regards,<br>
            <strong>FleetXChange Accounts Team</strong>
          </p>
        </div>
      `
      
      await sendEmail(
        client.email,
        `Invoice ${invoice.quickbooksInvoiceNumber} - ${load?.ref || 'Load'}`,
        emailContent
      )
      
      console.log(`[SendClientInvoice] ✅ Invoice sent to ${client.email}`)
    } catch (emailErr) {
      console.error('[SendClientInvoice] Error sending email:', emailErr)
      return NextResponse.json(
        { error: 'Invoice status updated but email failed to send' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice sent to client successfully'
    })

  } catch (error: any) {
    console.error('[SendClientInvoice] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice', details: error.message },
      { status: 500 }
    )
  }
}
