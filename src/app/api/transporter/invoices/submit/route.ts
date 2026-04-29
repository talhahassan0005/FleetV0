// src/app/api/transporter/invoices/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'TRANSPORTER') {
      return NextResponse.json(
        { error: 'Only transporters can submit invoices' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { podId, invoiceNumber, amount, currency, tonnage, invoicePdfUrl, invoicePdfName, notes } = body

    // Validation
    if (!podId || !invoiceNumber || !amount || !tonnage || !invoicePdfUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: podId, invoiceNumber, amount, tonnage, invoicePdfUrl' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const podObjectId = new ObjectId(podId)
    const transporterId = new ObjectId(session.user.id)

    // Get POD details
    const pod = await db.collection('pods').findOne({ _id: podObjectId })
    if (!pod) {
      return NextResponse.json({ error: 'POD not found' }, { status: 404 })
    }

    // Verify POD belongs to this transporter
    if (pod.transporterId.toString() !== transporterId.toString()) {
      return NextResponse.json({ error: 'Unauthorized - POD does not belong to you' }, { status: 403 })
    }

    // Verify POD is approved
    if (pod.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'POD must be approved before submitting invoice' },
        { status: 400 }
      )
    }

    // Get load details
    const load = await db.collection('loads').findOne({ _id: pod.loadId })
    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    // Check if invoice already exists for this POD
    const existingInvoice = await db.collection('transporter_invoices').findOne({ podId: podObjectId })
    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice already submitted for this POD' },
        { status: 400 }
      )
    }

    // Create transporter invoice
    const invoiceData = {
      loadId: pod.loadId,
      transporterId,
      clientId: load.clientId,
      podId: podObjectId,
      
      invoiceNumber,
      amount: parseFloat(amount),
      currency: currency || 'ZAR',
      tonnage: parseFloat(tonnage),
      
      invoicePdfUrl,
      invoicePdfName,
      
      status: 'PENDING_ADMIN_REVIEW',
      
      submittedAt: new Date(),
      notes: notes || '',
      
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('transporter_invoices').insertOne(invoiceData)

    // Send email to admin
    try {
      const transporter = await db.collection('users').findOne({ _id: transporterId })
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a2a5e;">New Transporter Invoice Submitted</h2>
          <p>A transporter has submitted an invoice for review.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Transporter:</strong> ${transporter?.companyName || 'Unknown'}</p>
            <p><strong>Load Reference:</strong> ${load.ref}</p>
            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p><strong>Amount:</strong> ${currency} ${parseFloat(amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            <p><strong>Tonnage:</strong> ${tonnage} tons</p>
          </div>
          <p>Please review and approve/reject this invoice in the admin portal.</p>
          <p style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/transporter-invoices" style="background-color: #3ab54a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Review Invoice</a>
          </p>
        </div>
      `
      await sendEmail(
        process.env.ADMIN_EMAIL || 'admin@fleetxchange.africa',
        `New Transporter Invoice: ${invoiceNumber}`,
        emailContent
      )
    } catch (emailErr) {
      console.error('[SubmitInvoice] Error sending email:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice submitted successfully',
      invoiceId: result.insertedId.toString()
    }, { status: 201 })

  } catch (error: any) {
    console.error('[SubmitInvoice] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit invoice', details: error.message },
      { status: 500 }
    )
  }
}
