// src/app/api/pod/client-approval/route.ts
/**
 * Client POD Approval
 * Clients can approve or reject PODs for their loads
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail } from '@/lib/email'
import { notifyPODApprovedByClient } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Only clients can approve/reject PODs' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    const { podId, action, reason } = await req.json()

    if (!podId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Find the POD
    const pod = await db.collection('documents').findOne({
      _id: new ObjectId(podId),
      docType: 'POD',
    })

    if (!pod) {
      return NextResponse.json(
        { error: 'POD not found' },
        { status: 404 }
      )
    }

    // Verify client owns this load
    const load = await db.collection('loads').findOne({
      _id: pod.loadId,
      clientId: new ObjectId(session.user.id),
    })

    if (!load) {
      return NextResponse.json(
        { error: 'Unauthorized - POD does not belong to your load' },
        { status: 403 }
      )
    }

    // Update POD with client approval
    const updateData: any = {
      clientApprovalStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
      clientApprovedAt: action === 'approve' ? new Date() : null,
      clientRejectedAt: action === 'reject' ? new Date() : null,
      clientApprovedBy: session.user.id,
      rejectionReason: action === 'reject' ? reason : null,
      updatedAt: new Date(),
    }

    await db.collection('documents').updateOne(
      { _id: new ObjectId(podId) },
      { $set: updateData }
    )

    console.log(`[PODApproval] ✅ Client ${action}d POD:`, podId)

    // Get transporter email for notification
    const transporter = await db.collection('users').findOne({
      _id: pod.uploadedBy || new ObjectId(pod.uploadedByUserId || ''),
    })

    // Send email to transporter about POD action
    if (transporter?.email) {
      try {
        await notifyPODApprovedByClient(load, transporter, action as 'approved' | 'rejected')
      } catch (emailErr) {
        console.error('[PODApproval] ⚠️ Failed to send notification:', emailErr)
      }
    }

    // Send email to admin about client action
    const adminEmails = process.env.ADMIN_EMAIL || 'admin@fleet.test'
    try {
      await sendEmail(
        adminEmails,
        `POD ${action === 'approve' ? 'Approved' : 'Rejected'} by Client - Load ${load.ref}`,
        `<h2>POD Action by Client</h2>
         <p>Client <strong>${(session.user as any).email}</strong> has <strong>${action}d</strong> the POD for load <strong>${load.ref}</strong>.</p>
         ${action === 'reject' ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
         <p><strong>Route:</strong> ${load.origin} → ${load.destination}</p>
         <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/pod-management" 
            style="background:#3ab54a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
           Review Action
         </a>`
      )
      console.log(`[PODApproval] ✅ Admin notification sent`)
    } catch (adminEmailErr) {
      console.error('[PODApproval] ⚠️ Failed to notify admin:', adminEmailErr)
    }

    return NextResponse.json({
      success: true,
      message: `POD ${action}ed successfully`,
      pod: {
        _id: pod._id,
        clientApprovalStatus: updateData.clientApprovalStatus,
        approvedAt: updateData.clientApprovedAt,
      },
    })
  } catch (error: any) {
    console.error('[PODApproval] 💥 Error:', error)
    return NextResponse.json(
      { error: 'Failed to process POD approval', details: error.message },
      { status: 500 }
    )
  }
}
