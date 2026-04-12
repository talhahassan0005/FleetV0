// src/app/api/transporter/pod/upload/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Load, POD, User } from '@/lib/models'
import { sendEmail } from '@/lib/email'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  // Check authentication
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'TRANSPORTER') {
    return Response.json({ error: 'Only transporters can upload PODs' }, { status: 403 })
  }

  try {
    await connectToDatabase()

    const body = await req.json()
    const { loadId, deliveryDate, deliveryTime, notes, podFile, mimeType, originalFileName } = body

    // Validate required fields
    if (!loadId || !deliveryDate) {
      return Response.json({ error: 'Missing required fields: loadId, deliveryDate' }, { status: 400 })
    }

    if (!podFile) {
      return Response.json({ error: 'POD file is required' }, { status: 400 })
    }

    // Fetch load to verify it exists and is delivered
    const load = await Load.findById(loadId).populate('clientId')

    if (!load) {
      return Response.json({ error: 'Load not found' }, { status: 404 })
    }

    if (load.status !== 'DELIVERED') {
      return Response.json({ error: 'Load must be marked as DELIVERED before POD upload' }, { status: 400 })
    }

    if (load.assignedTransporterId?.toString() !== session.user.id) {
      return Response.json({ error: 'You can only upload POD for loads assigned to you' }, { status: 403 })
    }

    // Check if POD already exists for this load
    const existingPOD = await POD.findOne({ loadId })
    if (existingPOD) {
      return Response.json({ error: 'POD already exists for this load. Please contact admin.' }, { status: 400 })
    }

    // Create POD record
    const pod = new POD({
      loadId,
      transporterId: session.user.id,
      deliveryDate: new Date(deliveryDate),
      deliveryTime: deliveryTime || null,
      notes,
      podFile,
      mimeType,
      originalFileName,
      status: 'PENDING',
    })

    await pod.save()

    // Get transporter and client info for email
    const transporter = await User.findById(session.user.id)
    const client = load.clientId

    // Send email notifications
    try {
      // Email to admin
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; padding:20px; background:#f5f5f5;">
          <div style="background:white; padding:30px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color:#1a2a5e; margin-top:0;">📋 POD Uploaded - ${load.ref}</h2>
            <p>Transporter <strong>${transporter?.companyName}</strong> uploaded POD for load <strong>${load.ref}</strong>.</p>
            <p><strong>Delivery Date:</strong> ${new Date(deliveryDate).toLocaleDateString()}<br>
            <strong>Route:</strong> ${load.origin} → ${load.destination}</p>
            <p style="margin:30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/admin/pod-management" style="background-color:#3ab54a; color:white; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block; font-weight:bold;">Review POD →</a>
            </p>
            <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">
            <p style="color:#999; font-size:12px;">FleetXChange Team</p>
          </div>
        </div>
      `
      await sendEmail(
        process.env.ADMIN_EMAIL || 'admin@fleetxchange.com',
        `POD Uploaded - Load ${load.ref}`,
        adminEmailHtml
      )

      // Email to client
      if (client?.email) {
        const clientEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; padding:20px; background:#f5f5f5;">
            <div style="background:white; padding:30px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color:#3ab54a; margin-top:0;">✓ POD Received - ${load.ref}</h2>
              <p>Hi ${client?.companyName},</p>
              <p>POD has been uploaded for your load <strong>${load.ref}</strong> by transporter <strong>${transporter?.companyName}</strong>.</p>
              <p><strong>Delivery Date:</strong> ${new Date(deliveryDate).toLocaleDateString()}</p>
              <p>Admin will verify this shortly, and you'll be able to create an invoice.</p>
              <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">
              <p style="color:#999; font-size:12px;">FleetXChange Team</p>
            </div>
          </div>
        `
        await sendEmail(
          client.email,
          `POD Received - Load ${load.ref}`,
          clientEmailHtml
        )
      }
    } catch (emailErr) {
      console.error('[PODUpload] Email notification failed:', emailErr)
      // Don't fail the POD upload if email fails
    }

    return Response.json({
      success: true,
      pod: {
        _id: pod._id,
        loadId: pod.loadId,
        status: pod.status,
        deliveryDate: pod.deliveryDate,
      },
      message: 'POD uploaded successfully. Admin and client have been notified.',
    }, { status: 201 })
  } catch (error) {
    console.error('[PODUpload] Error:', error)
    return Response.json({ error: 'Failed to upload POD' }, { status: 500 })
  }
}
