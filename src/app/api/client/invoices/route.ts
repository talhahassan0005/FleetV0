// src/app/api/client/invoices/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Load, POD, Invoice, User } from '@/lib/models'
import { sendEmail } from '@/lib/email'

function generateInvoiceNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(5, '0')
  return `INV-${year}-${month}-${random}`
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== 'CLIENT') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    const body = await req.json()
    const { loadId, amount, currency, itemDescription, notes } = body

    // Validate required fields
    if (!loadId || !amount) {
      return Response.json({ error: 'Missing required fields: loadId, amount' }, { status: 400 })
    }

    // Fetch load
    const load = await Load.findById(loadId).populate('assignedTransporterId')

    if (!load) {
      return Response.json({ error: 'Load not found' }, { status: 404 })
    }

    if (load.clientId.toString() !== session.user.id) {
      return Response.json({ error: 'Unauthorized: Load does not belong to you' }, { status: 403 })
    }

    // Check if POD exists and is approved
    const pod = await POD.findOne({ loadId })

    if (!pod) {
      return Response.json({ error: 'No POD found for this load. Transporter must upload POD first.' }, { status: 400 })
    }

    if (pod.status !== 'APPROVED') {
      return Response.json({ error: `POD must be APPROVED before creating invoice. Current status: ${pod.status}` }, { status: 400 })
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ loadId })

    if (existingInvoice) {
      return Response.json({ error: 'Invoice already exists for this load' }, { status: 400 })
    }

    // Create invoice
    const invoiceNumber = generateInvoiceNumber()
    const invoice = new Invoice({
      invoiceNumber,
      loadId,
      transporterId: load.assignedTransporterId,
      clientId: session.user.id,
      podId: pod._id,
      amount,
      currency,
      itemDescription,
      notes,
      status: 'DRAFT',
      approvedByClient: false,
      approvedByAdmin: false,
    })

    await invoice.save()

    // Get transporter and admin info for email
    const transporter = await User.findById(load.assignedTransporterId)
    const client = await User.findById(session.user.id)

    // Send email notifications
    try {
      // Email to transporter
      if (transporter?.email) {
        const transporterEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; padding:20px; background:#f5f5f5;">
            <div style="background:white; padding:30px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color:#1a2a5e; margin-top:0;">📄 Invoice Created - ${load.ref}</h2>
              <p>Hi ${transporter?.companyName},</p>
              <p>Invoice <strong>${invoiceNumber}</strong> has been created by client <strong>${client?.companyName}</strong> for load <strong>${load.ref}</strong>.</p>
              <p><strong>Amount:</strong> ${currency} ${amount.toLocaleString()}</p>
              <p>Admin will review and send this to you officially.</p>
              <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">
              <p style="color:#999; font-size:12px;">FleetXChange Team</p>
            </div>
          </div>
        `
        await sendEmail(transporter.email, `📄 Invoice Created - ${invoiceNumber}`, transporterEmailHtml)
      }

      // Email to admin
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; padding:20px; background:#f5f5f5;">
          <div style="background:white; padding:30px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color:#1a2a5e; margin-top:0;">📄 Invoice Created - ${invoiceNumber}</h2>
            <p>Client <strong>${client?.companyName}</strong> created invoice <strong>${invoiceNumber}</strong> for load <strong>${load.ref}</strong>.</p>
            <p><strong>Amount:</strong> ${currency} ${amount.toLocaleString()}<br>
            <strong>Transporter:</strong> ${transporter?.companyName}</p>
            <p style="margin:30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/admin/invoice-management" style="background-color:#3ab54a; color:white; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block; font-weight:bold;">Review Invoice →</a>
            </p>
            <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">
            <p style="color:#999; font-size:12px;">FleetXChange Team</p>
          </div>
        </div>
      `
      await sendEmail(
        process.env.ADMIN_EMAIL || 'admin@fleetxchange.com',
        `Invoice Created - ${invoiceNumber}`,
        adminEmailHtml
      )
    } catch (emailErr) {
      console.error('[ClientInvoice] Email notification failed:', emailErr)
    }

    return Response.json({
      success: true,
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        loadId: invoice.loadId,
        amount: invoice.amount,
        status: invoice.status,
      },
      message: 'Invoice created successfully. Admin will review and send to transporter.',
    }, { status: 201 })
  } catch (error) {
    console.error('[ClientInvoice] Error:', error)
    return Response.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== 'CLIENT') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    console.log('[ClientInvoice] 📊 Fetching invoices for client:', session.user.id)

    // Get all invoices for this client with related load data
    const invoices = await Invoice.find({
      clientId: session.user.id,
      invoiceType: 'CLIENT_INVOICE' // Only CLIENT_INVOICE type invoices
    })
      .populate({
        path: 'loadId',
        select: 'ref origin destination finalPrice currency'
      })
      .sort({ createdAt: -1 })
      .lean()

    console.log('[ClientInvoice] ✅ Found', invoices.length, 'invoices for client')

    // Map to response format
    const mappedInvoices = invoices.map((inv: any) => ({
      _id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      invoiceType: inv.invoiceType || 'CLIENT_INVOICE',
      amount: inv.amount,
      currency: inv.currency,
      paymentStatus: inv.paymentStatus || 'UNPAID',
      paymentAmount: inv.paymentAmount || 0,
      createdAt: inv.createdAt,
      dueDate: inv.dueDate,
      loadRef: inv.loadId?.ref || null,
      status: inv.status,
      qbLink: inv.qbLink || null
    }))

    return Response.json({
      success: true,
      invoices: mappedInvoices,
      count: mappedInvoices.length
    })
  } catch (error) {
    console.error('[ClientInvoice] ❌ Error fetching invoices:', error)
    return Response.json(
      { error: 'Failed to fetch invoices', details: String(error) },
      { status: 500 }
    )
  }
}
