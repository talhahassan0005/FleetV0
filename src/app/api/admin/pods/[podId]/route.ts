// src/app/api/admin/pods/[podId]/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { podId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDatabase()
    const body = await req.json()
    const { status, rejectionReason } = body

    const podId = new ObjectId(params.podId)
    const pod = await db.collection('documents').findOne({ _id: podId, docType: 'POD' })

    if (!pod) {
      return Response.json({ error: 'POD not found' }, { status: 404 })
    }

    // Map old status to new approval status
    let updateData: any = {
      updatedAt: new Date()
    }

    if (status === 'APPROVED') {
      updateData.adminApprovalStatus = 'APPROVED'
      updateData.adminApprovedAt = new Date()
      updateData.adminApprovedBy = new ObjectId(session.user.id)
      updateData.clientApprovalStatus = 'PENDING_CLIENT' // Forward to client
    } else if (status === 'PENDING' && rejectionReason) {
      updateData.adminApprovalStatus = 'PENDING_ADMIN'
      updateData.rejectionReason = rejectionReason
    }

    // Update POD
    await db.collection('documents').updateOne(
      { _id: podId },
      { $set: updateData }
    )

    // Get transporter and load info for email
    const transporter = await db.collection('users').findOne({ _id: pod.userId })
    const load = await db.collection('loads').findOne({ _id: pod.loadId })
    const client = load ? await db.collection('users').findOne({ _id: load.clientId }) : null

    // Send email notifications
    try {
      if (status === 'APPROVED') {
        // Email to transporter
        if (transporter?.email) {
          const transporterEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; padding:20px; background:#f5f5f5;">
              <div style="background:white; padding:30px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color:#3ab54a; margin-top:0;">✓ POD Approved - ${load?.ref}</h2>
                <p>Hi ${transporter?.companyName},</p>
                <p>Your POD for load <strong>${load?.ref}</strong> has been approved by admin.</p>
                <p>The client can now create an invoice for this delivery.</p>
                <p style="margin:30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/transporter" style="background-color:#3ab54a; color:white; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block; font-weight:bold;">Check Dashboard →</a>
                </p>
                <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">
                <p style="color:#999; font-size:12px;">FleetXChange Team</p>
              </div>
            </div>
          `
          await sendEmail(transporter.email, `✓ POD Approved - Load ${load?.ref}`, transporterEmailHtml)
        }

        // Email to client
        if (client?.email) {
          const clientEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; padding:20px; background:#f5f5f5;">
              <div style="background:white; padding:30px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color:#3ab54a; margin-top:0;">✓ POD Approved - Ready to Invoice - ${load?.ref}</h2>
                <p>Hi ${client?.companyName},</p>
                <p>POD for load <strong>${load?.ref}</strong> has been verified and approved.</p>
                <p>You can now review and approve the POD to proceed with invoicing.</p>
                <p style="margin:30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/client/pods" style="background-color:#3ab54a; color:white; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block; font-weight:bold;">Review POD →</a>
                </p>
                <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">
                <p style="color:#999; font-size:12px;">FleetXChange Team</p>
              </div>
            </div>
          `
          await sendEmail(client.email, `✓ POD Approved - Ready to Invoice - Load ${load?.ref}`, clientEmailHtml)
        }
      } else if (status === 'PENDING' && rejectionReason) {
        // Email to transporter about rejection
        if (transporter?.email) {
          const rejectionEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; padding:20px; background:#f5f5f5;">
              <div style="background:white; padding:30px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color:#dc2626; margin-top:0;">✗ POD Rejected - ${load?.ref}</h2>
                <p>Hi ${transporter?.companyName},</p>
                <p>Your POD for load <strong>${load?.ref}</strong> was rejected.</p>
                <p><strong>Reason:</strong></p>
                <div style="background:#f9fafb; padding:15px; border-left:4px solid #dc2626; margin:15px 0;">
                  ${rejectionReason}
                </div>
                <p>Please review and submit a corrected POD.</p>
                <p style="margin:30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/transporter/upload-pod" style="background-color:#3ab54a; color:white; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block; font-weight:bold;">Upload New POD →</a>
                </p>
                <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">
                <p style="color:#999; font-size:12px;">FleetXChange Team</p>
              </div>
            </div>
          `
          await sendEmail(transporter.email, `✗ POD Rejected - Load ${load?.ref}`, rejectionEmailHtml)
        }
      }
    } catch (emailErr) {
      console.error('[AdminPODApproval] Email notification failed:', emailErr)
    }

    return Response.json({
      success: true,
      pod: {
        _id: podId.toString(),
        status: status,
        loadRef: load?.ref,
      },
      message: `POD ${status === 'APPROVED' ? 'approved' : 'rejected'}. Parties notified.`,
    })
  } catch (error) {
    console.error('[AdminPODApproval] Error:', error)
    return Response.json({ error: 'Failed to update POD' }, { status: 500 })
  }
}
