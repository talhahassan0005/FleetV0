// src/app/api/admin/pods/[podId]/approve/route.ts
/**
 * POD APPROVAL WORKFLOW
 * 
 * Admin approves POD:
 * 1. Updates POD status to APPROVED
 * 2. Auto-forwards POD to Client
 * 3. Sends notifications to both parties
 * 4. Enables invoice creation
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { ObjectId } from 'mongodb'
import { sendEmail, podApprovedByAdminEmail } from '@/lib/email'
import { notifyPODApprovedByClient } from '@/lib/notifications'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { podId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can approve PODs' },
        { status: 403 }
      )
    }

    const adminRole = (session.user as any).adminRole
    if (!requirePermission(adminRole, 'pods')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await getDatabase()
    const { comments = '' } = await req.json()

    let podId: ObjectId
    try {
      podId = new ObjectId(params.podId)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid POD ID format' },
        { status: 400 }
      )
    }

    // Get POD document
    const pod = await db.collection('documents').findOne({
      _id: podId,
      docType: 'POD'
    })

    if (!pod) {
      return NextResponse.json(
        { error: 'POD not found' },
        { status: 404 }
      )
    }

    // Get load details
    const load = await db.collection('loads').findOne({
      _id: pod.loadId
    })

    if (!load) {
      return NextResponse.json(
        { error: 'Load not found' },
        { status: 404 }
      )
    }

    // Get transporter details
    const transporter = await db.collection('users').findOne({
      _id: pod.userId
    })

    // Get client details
    const client = await db.collection('users').findOne({
      _id: load.clientId
    })

    // Update POD: Admin approval + auto-forward to client
    const updateResult = await db.collection('documents').updateOne(
      { _id: podId },
      {
        $set: {
          adminApprovalStatus: 'APPROVED',
          adminApprovedAt: new Date(),
          adminApprovedBy: new ObjectId(session.user.id),
          adminComments: comments,
          
          // Auto-forward to client for review
          clientApprovalStatus: 'PENDING_CLIENT',
          visibleTo: 'ADMIN,CLIENT,TRANSPORTER',
          
          updatedAt: new Date(),
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to approve POD' },
        { status: 500 }
      )
    }

    console.log('[PODApprove] ✅ Admin approved POD:', podId.toString())
    console.log('[PODApprove] � POD Status:')
    console.log('[PODApprove]   - adminApprovalStatus: APPROVED')
    console.log('[PODApprove]   - clientApprovalStatus: PENDING_CLIENT (waiting for client approval)')
    console.log('[PODApprove] �📤 Auto-forwarding POD to client...')

    // Send email to transporter
    if (transporter?.email) {
      try {
        const emailContent = podApprovedByAdminEmail(
          transporter.companyName || 'Transporter',
          load.ref,
          comments
        )
        
        await sendEmail(
          transporter.email,
          `✅ POD Approved: ${load.ref}`,
          emailContent
        )
        console.log('[PODApprove] 📧 Transporter notification sent')
      } catch (emailErr) {
        console.error('[PODApprove] ⚠️ Error sending transporter email:', emailErr)
      }
    }

    // Send email to client - NEW POD REQUIREMENT
    if (client?.email) {
      try {
        const emailContent = `
          <h2>⚠️ Action Required: POD Approval</h2>
          <p>A Proof of Delivery (POD) for your load <strong>${load.ref}</strong> requires your approval.</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Load Details:</strong></p>
            <ul>
              <li>Reference: ${load.ref}</li>
              <li>Route: ${load.origin} → ${load.destination}</li>
              <li>Cargo Type: ${load.cargoType}</li>
              <li>Amount: ${load.currency || 'ZAR'} ${load.finalPrice?.toLocaleString() || 'N/A'}</li>
            </ul>
          </div>
          <p><strong>Admin Comments:</strong> "${comments || 'No comments'}"</p>
          <p>Please review and approve the POD in your portal. Once approved, invoices will be available for payment.</p>
          <a href="http://localhost:3000/client/invoices" style="background-color: #3ab54a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
            Review POD & Approve
          </a>
        `
        
        await sendEmail(
          client.email,
          `⚠️ POD Requires Approval: ${load.ref}`,
          emailContent
        )
        console.log('[PODApprove] 📧 Client notification sent')
      } catch (emailErr) {
        console.error('[PODApprove] ⚠️ Error sending client email:', emailErr)
      }
    }

    // Create load update
    await db.collection('loadUpdates').insertOne({
      loadId: load._id,
      userId: new ObjectId(session.user.id),
      message: `POD approved by admin and forwarded to client for approval`,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'POD approved and forwarded to client',
      data: {
        podId: podId.toString(),
        status: 'PENDING_CLIENT',
        forwardedAt: new Date().toISOString(),
      }
    })

  } catch (error: any) {
    console.error('[PODApprove] 💥 Error:', error)
    return NextResponse.json(
      { error: 'Failed to approve POD', details: error.message },
      { status: 500 }
    )
  }
}

// Client approval of POD
export async function PUT(
  req: NextRequest,
  { params }: { params: { podId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Only clients can approve PODs' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    const { comments = '' } = await req.json()

    let podId: ObjectId
    try {
      podId = new ObjectId(params.podId)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid POD ID format' },
        { status: 400 }
      )
    }

    // Get POD document
    const pod = await db.collection('documents').findOne({
      _id: podId,
      docType: 'POD'
    })

    if (!pod) {
      return NextResponse.json(
        { error: 'POD not found' },
        { status: 404 }
      )
    }

    // Get load details
    const load = await db.collection('loads').findOne({
      _id: pod.loadId
    })

    if (!load) {
      return NextResponse.json(
        { error: 'Load not found' },
        { status: 404 }
      )
    }

    // Verify client owns this load
    if (load.clientId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // POD must be approved by admin first
    if (pod.adminApprovalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'POD must be approved by admin first' },
        { status: 400 }
      )
    }

    // Update POD: Client approval
    const updateResult = await db.collection('documents').updateOne(
      { _id: podId },
      {
        $set: {
          clientApprovalStatus: 'APPROVED',
          clientApprovedAt: new Date(),
          clientApprovedBy: new ObjectId(session.user.id),
          clientComments: comments,
          updatedAt: new Date(),
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to approve POD' },
        { status: 500 }
      )
    }

    console.log('[PODClientApprove] ✅ Client approved POD:', podId.toString())

    // Get transporter details to notify
    const transporter = await db.collection('users').findOne({
      _id: pod.userId
    })

    // Send email to transporter using notification system
    if (transporter?.email) {
      try {
        await notifyPODApprovedByClient(load, transporter, 'approved')
        console.log('[PODClientApprove] 📧 Transporter notification sent')
      } catch (emailErr) {
        console.error('[PODClientApprove] ⚠️ Error sending notification:', emailErr)
      }
    }

    // Create load update
    await db.collection('loadUpdates').insertOne({
      loadId: load._id,
      userId: new ObjectId(session.user.id),
      message: `POD approved by client - Both admin and client approval complete`,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'POD approved by client',
      data: {
        podId: podId.toString(),
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
      }
    })

  } catch (error: any) {
    console.error('[PODClientApprove] 💥 Error:', error)
    return NextResponse.json(
      { error: 'Failed to approve POD', details: error.message },
      { status: 500 }
    )
  }
}
