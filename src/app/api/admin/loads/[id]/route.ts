// src/app/api/admin/loads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail, loadApprovedEmail, loadApprovedNotificationEmail, loadRejectedEmail } from '@/lib/email'

export async function GET(
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

    const loadId = params.id
    
    // Validate loadId format before creating ObjectId
    if (!loadId || typeof loadId !== 'string' || loadId === 'undefined') {
      console.error('[GetLoad] Invalid load ID:', loadId)
      return NextResponse.json(
        { error: 'Invalid load ID provided' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    let loadObjectId: any
    try {
      loadObjectId = new ObjectId(loadId)
    } catch (err) {
      console.error('[GetLoad] Invalid ObjectId format:', loadId, err)
      return NextResponse.json(
        { error: 'Invalid load ID format' },
        { status: 400 }
      )
    }

    const load = await db.collection('loads').findOne({ _id: loadObjectId })

    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      load: {
        _id: load._id.toString(),
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        cargoType: load.cargoType,
        weight: load.weight,
        description: load.description,
        collectionDate: load.collectionDate,
        deliveryDate: load.deliveryDate,
        finalPrice: load.finalPrice,
        commission: load.commission || 0,
        currency: load.currency || 'ZAR',
        status: load.status,
        clientId: load.clientId?.toString(),
        rejectionReason: load.rejectionReason,
        createdAt: load.createdAt,
        updatedAt: load.updatedAt,
      }
    })
  } catch (err: any) {
    console.error('[GetLoad] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch load' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const body = await req.json()
    const { action, rejectionReason, commission } = body
    const loadId = params.id

    console.log('[AdminLoadAction]', {
      loadId,
      action,
      admin: session.user.email,
    })

    const db = await getDatabase()
    const loadObjectId = new ObjectId(loadId)

    // Handle different actions
    if (action === 'approve') {
      // First fetch the full load to get clientId and details
      const load = await db.collection('loads').findOne({ _id: loadObjectId })
      if (!load) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      const result = await db.collection('loads').updateOne(
        { _id: loadObjectId },
        {
          $set: {
            status: 'APPROVED',
            approvedAt: new Date(),
            approvedBy: session.user.id,
            updatedAt: new Date(),
          }
        }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      console.log('[AdminLoadAction] Load approved:', loadId)

      // Send approval email to client
      try {
        const clientId = load.clientId
        if (clientId) {
          const client = await db.collection('users').findOne({ _id: clientId })
          if (client && client.email) {
            console.log('[AdminLoadAction] Sending approval email to client:', client.email)
            const emailContent = loadApprovedEmail(
              client.companyName || 'Client',
              load.ref,
              load.origin,
              load.destination,
              load.finalPrice || 0,
              load.commission || 0,
              load.currency || 'ZAR'
            )
            const emailResult = await sendEmail(
              client.email,
              `✅ Your Load Approved: ${load.ref}`,
              emailContent
            )
            console.log('[AdminLoadAction] ✅ Approval email sent to client:', emailResult)
          }
        }
      } catch (emailErr) {
        console.error('[AdminLoadAction] ⚠️  Error sending approval email to client:', emailErr)
        // Don't fail the approval if email fails
      }

      // Send notification to all verified transporters
      try {
        console.log('[AdminLoadAction] 🔍 Starting transporter notification...')
        const transporters = await db.collection('users').find({
          role: 'TRANSPORTER',
          isVerified: true,
          email: { $exists: true, $ne: null }
        }).toArray()
        
        console.log('[AdminLoadAction] 📊 Found', transporters.length, 'verified transporters')
        
        let successCount = 0
        let failCount = 0
        
        for (const transporter of transporters) {
          try {
            console.log('[AdminLoadAction] 👤 Processing transporter:', transporter.companyName, '(ID:', transporter._id, ')')
            console.log('[AdminLoadAction] 📧 Preparing notification for:', transporter.email)
            
            const emailContent = loadApprovedNotificationEmail(
              transporter.companyName || 'Transporter',
              load.ref,
              load.origin,
              load.destination,
              load.finalPrice || 0,
              load.currency || 'ZAR'
            )
            
            console.log('[AdminLoadAction] 🚀 Sending notification to', transporter.email, '...')
            const emailResult = await sendEmail(
              transporter.email,
              `🎯 Load Approved & Available: ${load.ref}`,
              emailContent
            )
            console.log('[AdminLoadAction] ✅ Notification sent to', transporter.email)
            successCount++
          } catch (err) {
            console.error('[AdminLoadAction] ❌ Failed to send notification to', transporter.email, ':', err)
            failCount++
          }
        }
        
        console.log('[AdminLoadAction] 📈 Transporter notification RESULT:', successCount, 'sent,', failCount, 'failed')
      } catch (err) {
        console.error('[AdminLoadAction] 💥 Error in transporter notification process:', err)
        // Don't fail the approval if transporter notifications fail
      }

      return NextResponse.json({
        success: true,
        message: 'Load approved successfully',
      })
    }

    if (action === 'reject') {
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        )
      }

      // First fetch the full load to get clientId and details
      const load = await db.collection('loads').findOne({ _id: loadObjectId })
      if (!load) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      const result = await db.collection('loads').updateOne(
        { _id: loadObjectId },
        {
          $set: {
            status: 'REJECTED',
            rejectionReason: rejectionReason.trim(),
            rejectedAt: new Date(),
            rejectedBy: session.user.id,
            updatedAt: new Date(),
          }
        }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      console.log('[AdminLoadAction] Load rejected:', loadId, 'Reason:', rejectionReason)

      // Send rejection email to client
      try {
        const clientId = load.clientId
        if (clientId) {
          const client = await db.collection('users').findOne({ _id: clientId })
          if (client && client.email) {
            console.log('[AdminLoadAction] 📧 Sending rejection email to client:', client.email)
            const emailContent = loadRejectedEmail(
              client.companyName || 'Client',
              load.ref,
              load.origin,
              load.destination,
              rejectionReason.trim()
            )
            const emailResult = await sendEmail(
              client.email,
              `❌ Your Load Rejected: ${load.ref}`,
              emailContent
            )
            console.log('[AdminLoadAction] ✅ Rejection email sent:', emailResult)
          }
        }
      } catch (emailErr) {
        console.error('[AdminLoadAction] ⚠️  Error sending rejection email:', emailErr)
        // Don't fail the rejection if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Load rejected successfully',
      })
    }

    if (action === 'addCommission') {
      if (commission === undefined || commission === null) {
        return NextResponse.json(
          { error: 'Commission amount is required' },
          { status: 400 }
        )
      }

      const commissionAmount = parseFloat(commission)
      if (isNaN(commissionAmount) || commissionAmount <= 0) {
        return NextResponse.json(
          { error: 'Commission must be a positive number' },
          { status: 400 }
        )
      }

      // Get current load
      const load = await db.collection('loads').findOne({ _id: loadObjectId })
      if (!load) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      // Commission is stored SEPARATELY from finalPrice
      // finalPrice stays the same, commission is added to separate field
      const totalCommission = (load.commission || 0) + commissionAmount

      const result = await db.collection('loads').updateOne(
        { _id: loadObjectId },
        {
          $set: {
            commission: totalCommission,
            commissionAddedAt: new Date(),
            commissionAddedBy: session.user.id,
            updatedAt: new Date(),
          }
        }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      console.log('[AdminLoadAction] Commission added:', {
        loadId,
        amountAdded: commissionAmount,
        totalCommission,
        basePrice: load.finalPrice,
      })

      return NextResponse.json({
        success: true,
        message: 'Commission added successfully',
        totalCommission,
      })
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('[AdminLoadAction] Error:', err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
