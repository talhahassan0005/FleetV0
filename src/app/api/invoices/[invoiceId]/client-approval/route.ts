// src/app/api/invoices/[invoiceId]/client-approval/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail } from '@/lib/email'

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

    // FIX #1: Update POD payment status when invoice is approved
    if (invoice.podId && action === 'APPROVE') {
      try {
        await db.collection('documents').updateOne(
          { _id: new ObjectId(invoice.podId), docType: 'POD' },
          {
            $set: {
              paymentStatus: 'APPROVED', // Update payment status for transporter POD grid
              clientApprovalStatus: 'APPROVED',
              clientApprovedAt: new Date(),
              clientApprovedBy: new ObjectId(session.user.id),
              rejectionReason: null,
              updatedAt: new Date(),
            }
          }
        )
        console.log('[ClientApproval] ✅ POD payment status updated to APPROVED')
      } catch (err) {
        console.warn('[ClientApproval] ⚠️ Could not update POD payment status:', err)
      }
    } else if (invoice.podId && action === 'REJECT') {
      try {
        await db.collection('documents').updateOne(
          { _id: new ObjectId(invoice.podId), docType: 'POD' },
          {
            $set: {
              paymentStatus: 'REJECTED',
              clientApprovalStatus: 'REJECTED',
              clientApprovedAt: new Date(),
              clientApprovedBy: new ObjectId(session.user.id),
              rejectionReason: rejectionReason.trim(),
              updatedAt: new Date(),
            }
          }
        )
        console.log('[ClientApproval] ✅ POD payment status updated to REJECTED')
      } catch (err) {
        console.warn('[ClientApproval] ⚠️ Could not update POD payment status:', err)
      }
    }

    // FIX #2: Send email notifications to Client, Admin, and Transporter
    try {
      const load = await db.collection('loads').findOne({ _id: invoice.loadId });
      const client = await db.collection('users').findOne({ _id: invoice.clientId });
      const transporter = await db.collection('users').findOne({ _id: invoice.transporterId });
      const admin = await db.collection('users').findOne({ role: 'ADMIN' });

      const loadRef = load?.ref || 'N/A';
      const invoiceNumber = invoice.invoiceNumber || invoiceId;
      const amount = invoice.amount || 0;
      const currency = invoice.currency || 'ZAR';

      if (action === 'APPROVE') {
        if (client?.email) {
          const clientEmailContent = `
            <h2>Invoice Approved Successfully</h2>
            <p>Dear ${client.companyName || 'Client'},</p>
            <p>You have successfully approved the invoice for Load <strong>${loadRef}</strong>.</p>
            <h3>Invoice Details:</h3>
            <ul>
              <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
              <li><strong>Amount:</strong> ${currency} ${amount.toLocaleString()}</li>
              <li><strong>Load Reference:</strong> ${loadRef}</li>
              <li><strong>Status:</strong> APPROVED</li>
            </ul>
            <p>Thank you for your business!</p>
            <p>Best regards,<br/>FleetXchange Team</p>
          `;
          await sendEmail(client.email, `✅ Invoice Approved: ${loadRef}`, clientEmailContent);
          console.log('[ClientApproval] 📧 Email sent to client');
        }

        if (admin?.email) {
          const adminEmailContent = `
            <h2>Client Approved Invoice</h2>
            <p>Dear Admin,</p>
            <p>Client <strong>${client?.companyName || client?.email}</strong> has approved an invoice.</p>
            <h3>Invoice Details:</h3>
            <ul>
              <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
              <li><strong>Amount:</strong> ${currency} ${amount.toLocaleString()}</li>
              <li><strong>Load Reference:</strong> ${loadRef}</li>
              <li><strong>Client:</strong> ${client?.companyName || client?.email}</li>
              <li><strong>Transporter:</strong> ${transporter?.companyName || transporter?.email}</li>
              <li><strong>Status:</strong> APPROVED</li>
            </ul>
            <p>Please process payment accordingly.</p>
          `;
          await sendEmail(admin.email, `💰 Invoice Approved by Client: ${loadRef}`, adminEmailContent);
          console.log('[ClientApproval] 📧 Email sent to admin');
        }

        if (transporter?.email) {
          const transporterEmailContent = `
            <h2>Invoice Approved - Payment Processing</h2>
            <p>Dear ${transporter.companyName || 'Transporter'},</p>
            <p>Great news! The client has approved the invoice for Load <strong>${loadRef}</strong>.</p>
            <h3>Invoice Details:</h3>
            <ul>
              <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
              <li><strong>Load Reference:</strong> ${loadRef}</li>
              <li><strong>Status:</strong> APPROVED</li>
            </ul>
            <p>Payment will be processed shortly.</p>
            <p>Best regards,<br/>FleetXchange Team</p>
          `;
          await sendEmail(transporter.email, `✅ Invoice Approved: ${loadRef}`, transporterEmailContent);
          console.log('[ClientApproval] 📧 Email sent to transporter');
        }
      } else if (action === 'REJECT') {
        if (admin?.email) {
          const adminEmailContent = `
            <h2>Client Rejected Invoice</h2>
            <p>Dear Admin,</p>
            <p>Client <strong>${client?.companyName || client?.email}</strong> has rejected an invoice.</p>
            <h3>Invoice Details:</h3>
            <ul>
              <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
              <li><strong>Amount:</strong> ${currency} ${amount.toLocaleString()}</li>
              <li><strong>Load Reference:</strong> ${loadRef}</li>
              <li><strong>Client:</strong> ${client?.companyName || client?.email}</li>
              <li><strong>Transporter:</strong> ${transporter?.companyName || transporter?.email}</li>
              <li><strong>Status:</strong> REJECTED</li>
              <li><strong>Reason:</strong> ${rejectionReason}</li>
            </ul>
            <p>Please review and take necessary action.</p>
          `;
          await sendEmail(admin.email, `❌ Invoice Rejected by Client: ${loadRef}`, adminEmailContent);
          console.log('[ClientApproval] 📧 Rejection email sent to admin');
        }

        if (transporter?.email) {
          const transporterEmailContent = `
            <h2>Invoice Rejected by Client</h2>
            <p>Dear ${transporter.companyName || 'Transporter'},</p>
            <p>Unfortunately, the client has rejected the invoice for Load <strong>${loadRef}</strong>.</p>
            <h3>Invoice Details:</h3>
            <ul>
              <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
              <li><strong>Load Reference:</strong> ${loadRef}</li>
              <li><strong>Status:</strong> REJECTED</li>
              <li><strong>Reason:</strong> ${rejectionReason}</li>
            </ul>
            <p>Please contact admin for further details.</p>
            <p>Best regards,<br/>FleetXchange Team</p>
          `;
          await sendEmail(transporter.email, `❌ Invoice Rejected: ${loadRef}`, transporterEmailContent);
          console.log('[ClientApproval] 📧 Rejection email sent to transporter');
        }
      }
    } catch (emailError: any) {
      console.error('[ClientApproval] ⚠️ Email notification error:', emailError.message);
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
