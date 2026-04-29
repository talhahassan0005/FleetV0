// src/app/api/admin/loads/[id]/assign/route.ts
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

    const { quoteId, transporterId } = await req.json()
    const loadId = params.id
    const db = await getDatabase()
    
    const loadObjectId = new ObjectId(loadId)
    const quoteObjectId = new ObjectId(quoteId)
    const transporterObjectId = new ObjectId(transporterId)
    
    // Get load and quote details
    const load = await db.collection('loads').findOne({ _id: loadObjectId })
    const quote = await db.collection('quotes').findOne({ _id: quoteObjectId })
    
    if (!load || !quote) {
      return NextResponse.json({ error: 'Load or quote not found' }, { status: 404 })
    }
    
    // Update load status to ASSIGNED
    await db.collection('loads').updateOne(
      { _id: loadObjectId },
      {
        $set: {
          status: 'ASSIGNED',
          assignedTransporterId: transporterObjectId,
          assignedAt: new Date(),
          assignedBy: session.user.id,
          updatedAt: new Date(),
        }
      }
    )
    
    // Accept the selected quote
    await db.collection('quotes').updateOne(
      { _id: quoteObjectId },
      {
        $set: {
          status: 'ACCEPTED',
          updatedAt: new Date()
        }
      }
    )
    
    // Reject all other pending quotes
    await db.collection('quotes').updateMany(
      { loadId: loadObjectId, _id: { $ne: quoteObjectId }, status: 'PENDING' },
      { $set: { status: 'AUTO_REJECTED', updatedAt: new Date() } }
    )
    
    // Send email to client
    const client = await db.collection('users').findOne({ _id: load.clientId })
    const transporter = await db.collection('users').findOne({ _id: transporterObjectId })
    
    if (client && client.email) {
      try {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a2a5e;">Load Assigned</h2>
            <p>Dear ${client.companyName || 'Client'},</p>
            <p>Your load <strong>${load.ref}</strong> has been assigned to a transporter.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Transporter:</strong> ${transporter?.companyName || 'Unknown'}</p>
              <p><strong>Route:</strong> ${load.origin} → ${load.destination}</p>
              <p><strong>Agreed Price:</strong> ${quote.currency} ${quote.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
            <p>You can track your load progress in your dashboard.</p>
            <p>Best regards,<br>Your Logistics Team</p>
          </div>
        `
        await sendEmail(
          client.email,
          `✅ Load Assigned: ${load.ref}`,
          emailContent
        )
      } catch (emailErr) {
        console.error('[AssignLoad] Error sending email to client:', emailErr)
      }
    }
    
    // Send email to transporter
    if (transporter && transporter.email) {
      try {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3ab54a;">Quote Accepted - Load Assigned!</h2>
            <p>Dear ${transporter.companyName || 'Transporter'},</p>
            <p>Congratulations! Your quote for load <strong>${load.ref}</strong> has been accepted.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Route:</strong> ${load.origin} → ${load.destination}</p>
              <p><strong>Cargo:</strong> ${load.cargoType || 'N/A'} (${load.weight || 'N/A'} tons)</p>
              <p><strong>Agreed Price:</strong> ${quote.currency} ${quote.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
            <p>Please log in to your dashboard to view full load details and begin coordination.</p>
            <p>Best regards,<br>Your Logistics Team</p>
          </div>
        `
        await sendEmail(
          transporter.email,
          `✅ Quote Accepted: ${load.ref}`,
          emailContent
        )
      } catch (emailErr) {
        console.error('[AssignLoad] Error sending email to transporter:', emailErr)
      }
    }
    
    // Send rejection emails to other transporters
    const rejectedQuotes = await db.collection('quotes').find({
      loadId: loadObjectId,
      _id: { $ne: quoteObjectId },
      status: 'AUTO_REJECTED'
    }).toArray()
    
    for (const rejQuote of rejectedQuotes) {
      const rejectedTransporter = await db.collection('users').findOne({ _id: rejQuote.transporterId })
      if (rejectedTransporter && rejectedTransporter.email) {
        try {
          const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Quote Not Selected</h2>
              <p>Dear ${rejectedTransporter.companyName || 'Transporter'},</p>
              <p>Thank you for your quote on load <strong>${load.ref}</strong>.</p>
              <p>Unfortunately, another transporter has been selected for this load.</p>
              <p>We appreciate your interest and encourage you to bid on other available loads.</p>
              <p>Best regards,<br>Your Logistics Team</p>
            </div>
          `
          await sendEmail(
            rejectedTransporter.email,
            `Quote Update: ${load.ref}`,
            emailContent
          )
        } catch (emailErr) {
          console.error('[AssignLoad] Error sending rejection email:', emailErr)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Load assigned successfully',
    })
  } catch (err: any) {
    console.error('[AssignLoad] Error:', err)
    return NextResponse.json(
      { error: 'Failed to assign load' },
      { status: 500 }
    )
  }
}
