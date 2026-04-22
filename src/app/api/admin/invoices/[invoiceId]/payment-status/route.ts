// src/app/api/admin/invoices/[invoiceId]/payment-status/route.ts
/**
 * Update payment status for invoices
 * Admin tracks payment manually based on QuickBooks/receipts
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail } from '@/lib/email'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Only admins can update payment status' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    const { paymentStatus, paymentAmount, paymentNotes } = await req.json()

    let invoiceId: ObjectId
    try {
      invoiceId = new ObjectId(params.invoiceId)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid invoice ID format' },
        { status: 400 }
      )
    }

    // Validate payment status
    const validStatuses = ['UNPAID', 'PARTIAL_PAID', 'PAID']
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      )
    }

    // Get invoice
    const invoice = await db.collection('invoices').findOne({
      _id: invoiceId
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Get load and client details
    const load = await db.collection('loads').findOne({
      _id: invoice.loadId
    })

    const client = await db.collection('users').findOne({
      _id: invoice.clientId
    })

    // Update payment status
    const updateResult = await db.collection('invoices').updateOne(
      { _id: invoiceId },
      {
        $set: {
          paymentStatus: paymentStatus,
          paymentTrackedBy: new ObjectId(session.user.id),
          paymentTrackedAt: new Date(),
          paymentAmount: paymentAmount || invoice.amount,
          paymentNotes: paymentNotes || '',
          updatedAt: new Date(),
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      )
    }

    console.log('[PaymentStatus] ✅ Updated to:', paymentStatus)

    // Send email to client if paid
    if (paymentStatus === 'PAID' && client?.email) {
      try {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="border-left: 4px solid #3ab54a; padding-left: 15px; margin-bottom: 25px;">
                <h1 style="margin: 0 0 5px 0; color: #1a2a5e; font-size: 24px;">✅ Payment Received</h1>
                <p style="margin: 0; color: #666; font-size: 14px;">Invoice ${invoice.invoiceNumber}</p>
              </div>
              
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                Thank you! We have received your payment for load <strong>${load?.ref}</strong>.
              </p>
              
              <div style="background: #f0f8f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <table style="width: 100%; color: #333; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Invoice #:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;"><strong>${invoice.invoiceNumber}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Amount Paid:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right; color: #3ab54a;"><strong>${invoice.currency} ${paymentAmount ? parseFloat(paymentAmount).toLocaleString() : invoice.amount.toLocaleString()}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Status:</strong></td>
                    <td style="padding: 8px 0; text-align: right;"><span style="background: #3ab54a; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: bold;">PAID</span></td>
                  </tr>
                </table>
              </div>
              
              ${paymentNotes ? `
                <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <p style="margin: 0 0 10px 0; color: #1a2a5e;"><strong>Payment Notes:</strong></p>
                  <p style="margin: 0; color: #555;">${paymentNotes}</p>
                </div>
              ` : ''}
              
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                Your transaction has been recorded in our system. Thank you for your timely payment.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
            </div>
          </div>
        `

        await sendEmail(
          client.email,
          `✅ Payment Received - Invoice ${invoice.invoiceNumber}`,
          emailContent
        )
        console.log('[PaymentStatus] 📧 Payment confirmation sent to client')
      } catch (emailErr) {
        console.error('[PaymentStatus] ⚠️ Error sending email:', emailErr)
      }
    }

    // Create load update
    const statusMessages: Record<string, string> = {
      'UNPAID': 'Payment status marked as unpaid',
      'PARTIAL_PAID': `Partial payment received (${paymentAmount || invoice.amount})`,
      'PAID': 'Full payment received and verified'
    }

    await db.collection('loadUpdates').insertOne({
      loadId: invoice.loadId,
      userId: new ObjectId(session.user.id),
      message: `Invoice ${invoice.invoiceNumber}: ${statusMessages[paymentStatus]}`,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'Payment status updated',
      data: {
        invoiceId: invoiceId.toString(),
        invoiceNumber: invoice.invoiceNumber,
        paymentStatus: paymentStatus,
        updatedAt: new Date().toISOString(),
      }
    })

  } catch (error: any) {
    console.error('[PaymentStatus] 💥 Error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status', details: error.message },
      { status: 500 }
    )
  }
}

// GET payment status
export async function GET(
  req: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Only admins can view payment status' },
        { status: 403 }
      )
    }

    const db = await getDatabase()

    let invoiceId: ObjectId
    try {
      invoiceId = new ObjectId(params.invoiceId)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid invoice ID format' },
        { status: 400 }
      )
    }

    const invoice = await db.collection('invoices').findOne({
      _id: invoiceId
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: invoiceId.toString(),
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        currency: invoice.currency,
        paymentStatus: invoice.paymentStatus,
        paymentAmount: invoice.paymentAmount,
        paymentNotes: invoice.paymentNotes,
        paymentTrackedAt: invoice.paymentTrackedAt,
      }
    })

  } catch (error: any) {
    console.error('[PaymentStatus] 💥 Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment status', details: error.message },
      { status: 500 }
    )
  }
}
