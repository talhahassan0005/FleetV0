// src/app/api/admin/invoices/[invoiceId]/approve/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Invoice, Load, User } from '@/lib/models'
import { sendEmail } from '@/lib/email'

export async function PATCH(req: Request, { params }: { params: { invoiceId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    const invoice = await Invoice.findById(params.invoiceId)

    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status !== 'DRAFT') {
      return Response.json({ error: 'Invoice must be in DRAFT status to approve' }, { status: 400 })
    }

    // Admin can override client approval - just update admin approval
    invoice.approvedByAdmin = true
    await invoice.save()

    // Get related data for email
    const load = await Load.findById(invoice.loadId)
    const transporter = await User.findById(invoice.transporterId)
    const client = await User.findById(invoice.clientId)

    // Send email to transporter about approval
    try {
      if (transporter?.email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; padding:20px; background:#f5f5f5;">
            <div style="background:white; padding:30px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color:#3ab54a; margin-top:0;">✓ Invoice Approved - ${invoice.invoiceNumber}</h2>
              <p>Hi ${transporter?.companyName},</p>
              <p>Invoice <strong>${invoice.invoiceNumber}</strong> for load <strong>${load?.ref}</strong> has been approved by admin.</p>
              <p><strong>Amount:</strong> ${invoice.currency} ${invoice.amount.toLocaleString()}<br>
              <strong>Client:</strong> ${client?.companyName}</p>
              <p>Please check your portal for next steps.</p>
              <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">
              <p style="color:#999; font-size:12px;">FleetXChange Team</p>
            </div>
          </div>
        `
        await sendEmail(transporter.email, `✓ Invoice Approved - ${invoice.invoiceNumber}`, emailHtml)
      }
    } catch (emailErr) {
      console.error('[AdminInvoiceApprove] Email notification failed:', emailErr)
    }

    return Response.json({
      success: true,
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        approvedByAdmin: invoice.approvedByAdmin,
      },
      message: 'Invoice approved by admin. Transporter notified.',
    })
  } catch (error) {
    console.error('[AdminInvoiceApprove] Error:', error)
    return Response.json({ error: 'Failed to approve invoice' }, { status: 500 })
  }
}
