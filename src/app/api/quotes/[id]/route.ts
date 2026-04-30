// src/app/api/quotes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail, quoteApprovedEmail, quoteRejectedEmail } from '@/lib/email'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const { status } = await req.json()

    const quoteId = new ObjectId(params.id)
    const quote = await db.collection('quotes').findOne({ _id: quoteId })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Get load info for authorization  
    const load = await db.collection('loads').findOne({ _id: quote.loadId })
    
    // Verify authorization
    if (session.user.role === 'CLIENT' && load?.clientId?.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.collection('quotes').updateOne(
      { _id: quoteId },
      { $set: { status, updatedAt: new Date() } }
    )

    const updatedQuote = await db.collection('quotes').findOne({ _id: quoteId })

    return NextResponse.json({ success: true, data: updatedQuote })
  } catch (err: any) {
    console.error('Quote update error:', err)
    return NextResponse.json({ error: 'Failed to update quote' }, { status:400 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, rejectionReason } = body

    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACCEPTED or REJECTED' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const quoteId = new ObjectId(params.id)

    // Get the quote
    const quote = await db.collection('quotes').findOne({ _id: quoteId })
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Get the load to verify authorization
    const load = await db.collection('loads').findOne({ _id: quote.loadId })
    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    // Only admins can update quote status
    if (!['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Only admins can accept or reject quotes' },
        { status: 403 }
      )
    }

    // Update quote status
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    // Add rejection reason if provided
    if (status === 'REJECTED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason
    }

    const result = await db.collection('quotes').updateOne(
      { _id: quoteId },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
    }

    // Get transporter and load info for emails
    const transporter = await db.collection('users').findOne({ _id: quote.transporterId })
    const loadRef = load.ref

    // Send email based on status
    if (transporter?.email) {
      try {
        if (status === 'ACCEPTED') {
          const emailContent = quoteApprovedEmail(
            transporter.companyName || 'Transporter',
            loadRef
          )
          await sendEmail(
            transporter.email,
            `✅ Quote Accepted: ${loadRef}`,
            emailContent
          )
          console.log('[UpdateQuote] ✅ Quote accepted email sent to transporter')
        } else if (status === 'REJECTED') {
          const emailContent = quoteRejectedEmail(
            transporter.companyName || 'Transporter',
            loadRef
          )
          await sendEmail(
            transporter.email,
            `❌ Quote Rejected: ${loadRef}`,
            emailContent
          )
          console.log('[UpdateQuote] ✅ Quote rejected email sent to transporter')
        }
      } catch (emailErr) {
        console.error('[UpdateQuote] ⚠️  Error sending quote status email:', emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Quote ${status === 'ACCEPTED' ? 'accepted' : 'rejected'} successfully`,
      quote: { _id: quoteId.toString(), status }
    })
  } catch (err: any) {
    console.error('[PatchQuote] Error:', err)
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    )
  }
}