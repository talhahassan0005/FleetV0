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

    if (!session?.user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
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

    // Update POD: Admin approval is final - no client approval needed
    // Client only gets tracking updates, not POD approval workflow
    const updateResult = await db.collection('documents').updateOne(
      { _id: podId },
      {
        $set: {
          adminApprovalStatus: 'APPROVED',
          adminApprovedAt: new Date(),
          adminApprovedBy: new ObjectId(session.user.id),
          adminComments: comments,
          
          // Admin approval is sufficient - auto-mark client side as approved too
          // This enables invoice creation without requiring client action
          clientApprovalStatus: 'APPROVED',
          clientApprovedAt: new Date(),
          visibleTo: 'ADMIN,TRANSPORTER',
          
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
    console.log('[PODApprove] POD Status:')
    console.log('[PODApprove]   - adminApprovalStatus: APPROVED')
    console.log('[PODApprove]   - clientApprovalStatus: APPROVED (auto-approved, no client action needed)')
    console.log('[PODApprove] POD fully approved - ready for invoice creation')

    // Send email to transporter - POD fully approved
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

    // No client email needed - client is not part of POD approval workflow

    // Create load update
    await db.collection('loadUpdates').insertOne({
      loadId: load._id,
      userId: new ObjectId(session.user.id),
      message: `POD approved by admin - ready for invoice creation`,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'POD approved by admin',
      data: {
        podId: podId.toString(),
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
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