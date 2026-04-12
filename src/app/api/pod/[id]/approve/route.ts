// src/app/api/pod/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const podId = new ObjectId(params.id)
    const userId = new ObjectId(session.user.id)
    const role = session.user.role

    const body = await req.json()
    const { approvalType, comments = '' } = body // approvalType: 'admin' or 'client'

    if (!approvalType || !['admin', 'client'].includes(approvalType)) {
      return NextResponse.json(
        { error: 'Invalid approval type. Must be "admin" or "client"' },
        { status: 400 }
      )
    }

    // Get current POD
    const pod = await db.collection('pods').findOne({ _id: podId })
    if (!pod) {
      return NextResponse.json({ error: 'POD not found' }, { status: 404 })
    }

    // Authorization checks
    if (approvalType === 'admin' && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admin can approve POD for admin' },
        { status: 403 }
      )
    }

    if (approvalType === 'client' && pod.clientId.toString() !== userId.toString() && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only the client can approve this POD' },
        { status: 403 }
      )
    }

    // Can't approve if already approved by this party
    if (approvalType === 'admin' && pod.adminApproval.approved) {
      return NextResponse.json(
        { error: 'Admin has already approved this POD' },
        { status: 400 }
      )
    }

    if (approvalType === 'client' && pod.clientApproval.approved) {
      return NextResponse.json(
        { error: 'Client has already approved this POD' },
        { status: 400 }
      )
    }

    // Update approval status
    const updateData: any = {}
    if (approvalType === 'admin') {
      updateData.adminApproval = {
        approved: true,
        approvedBy: userId,
        approvedAt: new Date(),
        comments
      }
      // After admin approves, status changes to PENDING_CLIENT
      updateData.status = 'PENDING_CLIENT'
    } else {
      updateData.clientApproval = {
        approved: true,
        approvedBy: userId,
        approvedAt: new Date(),
        comments
      }
      // Check if admin already approved
      if (pod.adminApproval.approved) {
        // Both approvals complete
        updateData.status = 'APPROVED'
      }
    }

    updateData.updatedAt = new Date()

    const result = await db.collection('pods').findOneAndUpdate(
      { _id: podId },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Failed to update POD' }, { status: 500 })
    }

    // TODO: Send email notifications
    // - If Admin approved: Send to client about POD review needed
    // - If Client approved (and admin already approved):
    //   - Send to transporter: POD fully approved
    //   - Send to invoicing system: Ready to create invoice

    return NextResponse.json({
      success: true,
      message: `POD ${approvalType} approval completed`,
      data: {
        ...result.value,
        _id: result.value._id?.toString?.() || result.value._id,
        loadId: result.value.loadId?.toString?.() || result.value.loadId,
        transporterId: result.value.transporterId?.toString?.() || result.value.transporterId,
        clientId: result.value.clientId?.toString?.() || result.value.clientId,
      }
    })

  } catch (error: any) {
    console.error('POD approval error:', error)
    return NextResponse.json(
      { error: 'Failed to approve POD', details: error.message },
      { status: 500 }
    )
  }
}
