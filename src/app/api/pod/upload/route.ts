// src/app/api/pod/upload/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('[PODUpload] 🚀 Uploaded by:', session?.user?.email, 'Role:', session?.user?.role)
    
    // Only transporters can upload POD
    if (!session?.user?.role || session.user.role !== 'TRANSPORTER') {
      return NextResponse.json(
        { error: 'Only transporters can upload POD' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    
    // Parse JSON body instead of FormData (files are already uploaded to Cloudinary)
    const body = await req.json()
    
    const {
      loadId,
      deliveryDate,
      deliveryTime,
      notes = '',
      podFileUrl,
      podFileName,
      podPublicId,
      invoiceFileUrl,
      invoiceFileName,
      invoicePublicId
    } = body

    console.log('[PODUpload] 📦 POD File URL:', podFileUrl)
    console.log('[PODUpload] 📄 Invoice File URL:', invoiceFileUrl)
    console.log('[PODUpload] 📅 Delivery:', deliveryDate, 'Time:', deliveryTime)
    console.log('[PODUpload] 📝 Notes:', notes)

    if (!podFileUrl || !podFileName) {
      console.log('[PODUpload] ❌ No POD file URL found')
      return NextResponse.json(
        { error: 'POD file URL is required' },
        { status: 400 }
      )
    }

    if (!invoiceFileUrl || !invoiceFileName) {
      console.log('[PODUpload] ❌ No invoice file URL found')
      return NextResponse.json(
        { error: 'Invoice file URL is required' },
        { status: 400 }
      )
    }

    if (!loadId) {
      console.log('[PODUpload] ❌ No loadId found')
      return NextResponse.json(
        { error: 'Load ID is required' },
        { status: 400 }
      )
    }

    // Verify load exists and get details
    let loadObjectId: ObjectId
    try {
      loadObjectId = new ObjectId(loadId)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid load ID format' },
        { status: 400 }
      )
    }

    const load = await db.collection('loads').findOne({
      _id: loadObjectId
    })

    if (!load) {
      return NextResponse.json(
        { error: 'Load not found' },
        { status: 404 }
      )
    }

    // Verify transporter is assigned to this load
    const transporterId = new ObjectId(session.user.id)
    
    // Get all quotes for this transporter on this load
    const allQuotes = await db.collection('quotes').find({
      loadId: loadObjectId,
      transporterId: transporterId
    }).toArray()

    console.log('[PODUpload] 🔍 Found quotes for transporter:', allQuotes.length)
    allQuotes.forEach((q: any) => {
      console.log('[PODUpload]   Quote:', {
        id: q._id.toString(),
        loadId: q.loadId.toString(),
        status: q.status,
        quotedPrice: q.quotedPrice
      })
    })

    // Check if transporter has ANY quote (approved or assigned)
    const quote = allQuotes.find((q: any) => 
      ['APPROVED', 'ASSIGNED', 'ACCEPTED'].includes(q.status)
    )

    if (!quote) {
      console.log('[PODUpload] ❌ No valid quote found. Transporter not assigned to this load')
      return NextResponse.json(
        { error: 'You are not assigned to this load' },
        { status: 403 }
      )
    }

    console.log('[PODUpload] ✅ Quote found with status:', quote.status)

    // Files are already uploaded to Cloudinary from frontend
    // Just use the provided URLs
    console.log('[PODUpload] ✅ Using pre-uploaded POD URL:', podFileUrl)
    console.log('[PODUpload] ✅ Using pre-uploaded Invoice URL:', invoiceFileUrl)

    // Create POD document record
    const podDocResult = await db.collection('documents').insertOne({
      userId: transporterId,
      loadId: loadObjectId,
      docType: 'POD',
      filename: podPublicId || podFileName,
      originalName: podFileName,
      fileUrl: podFileUrl,
      fileMimeType: 'application/octet-stream',
      uploadedByRole: 'TRANSPORTER',
      visibleTo: 'ADMIN,CLIENT,TRANSPORTER',
      
      // NEW: POD approval tracking
      adminApprovalStatus: 'PENDING_ADMIN', // PENDING_ADMIN -> APPROVED -> FORWARDED_TO_CLIENT
      adminApprovedAt: null,
      adminApprovedBy: null,
      
      clientApprovalStatus: 'PENDING_CLIENT', // Will be updated when admin forwards
      clientApprovedAt: null,
      clientApprovedBy: null,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('[PODUpload] 📄 POD document created with admin approval status: PENDING_ADMIN')

    // Create Invoice document record (with POD reference for syncing)
    const invoiceDocResult = await db.collection('documents').insertOne({
      userId: transporterId,
      loadId: loadObjectId,
      docType: 'INVOICE',
      filename: invoicePublicId || invoiceFileName,
      originalName: invoiceFileName,
      fileUrl: invoiceFileUrl,
      fileMimeType: 'application/octet-stream',
      uploadedByRole: 'TRANSPORTER',
      visibleTo: 'CLIENT,ADMIN,TRANSPORTER',
      // LINK TO POD: For syncing approvals
      relatedPodId: podDocResult.insertedId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('[PODUpload] 📄 Invoice document created:', invoiceDocResult.insertedId.toString())

    // Create load update
    await db.collection('loadUpdates').insertOne({
      loadId: loadObjectId,
      userId: transporterId,
      message: 'Proof of Delivery (POD) and Invoice uploaded by transporter',
      createdAt: new Date(),
    })

    // Mark load as DELIVERED
    await db.collection('loads').updateOne(
      { _id: loadObjectId },
      {
        $set: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          updatedAt: new Date(),
        }
      }
    )

    console.log('[PODUpload] ✅ Load marked DELIVERED')

    // Deactivate tracking link
    await db.collection('trackingLinks').updateMany(
      { loadId: loadObjectId, isActive: true },
      { $set: { isActive: false, expiredAt: new Date() } }
    )

    return NextResponse.json({
      success: true,
      message: 'POD and Invoice uploaded successfully',
      data: {
        pod: {
          _id: podDocResult.insertedId.toString(),
          loadId: loadId,
          filename: podPublicId || podFileName,
          originalName: podFileName,
          fileUrl: podFileUrl,
          uploadedAt: new Date().toISOString(),
        },
        invoice: {
          _id: invoiceDocResult.insertedId.toString(),
          loadId: loadId,
          filename: invoicePublicId || invoiceFileName,
          originalName: invoiceFileName,
          fileUrl: invoiceFileUrl,
          uploadedAt: new Date().toISOString(),
        },
        deliveryDate: deliveryDate,
        deliveryTime: deliveryTime,
        notes: notes,
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('[PODUpload] 💥 Error:', error)
    return NextResponse.json(
      { error: 'Failed to upload POD', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Add RBAC check for admin users
    if (session.user.role === 'ADMIN') {
      const adminRole = (session.user as any).adminRole
      if (!requirePermission(adminRole, 'pods')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const db = await getDatabase()
    const userId = new ObjectId(session.user.id)
    const role = session.user.role

    let query: any = { docType: 'POD' }

    // Different filters based on role
    if (role === 'TRANSPORTER') {
      // Transporter sees their own PODs
      query.userId = userId
    } else if (role === 'CLIENT') {
      // Client sees PODs for their loads (get client's loads first)
      const clientLoads = await db.collection('loads')
        .find({ clientId: userId })
        .project({ _id: 1 })
        .toArray()
      const loadIds = clientLoads.map(l => l._id)
      query.loadId = { $in: loadIds }
    } else if (role === 'ADMIN') {
      // Admin sees all PODs (for approval/management)
      // Keep only docType filter - no additional filters
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 403 })
    }

    const pods = await db.collection('documents')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    console.log('[PODUpload-GET] 📦 Found documents:', pods.length, 'for role:', role)
    if (pods.length > 0) {
      console.log('[PODUpload-GET] Sample document:', {
        id: pods[0]._id.toString(),
        docType: pods[0].docType,
        adminApprovalStatus: pods[0].adminApprovalStatus,
        clientApprovalStatus: pods[0].clientApprovalStatus,
        approved: pods[0].approved
      })
    }

    // Serialize ObjectIds
    const serializedPods = pods.map((pod: any) => ({
      ...pod,
      _id: pod._id?.toString?.() || pod._id,
      userId: pod.userId?.toString?.() || pod.userId,
      loadId: pod.loadId?.toString?.() || pod.loadId,
      // Ensure approval status fields are included
      adminApprovalStatus: pod.adminApprovalStatus || 'PENDING_ADMIN',
      clientApprovalStatus: pod.clientApprovalStatus || undefined,
      approved: pod.approved || undefined,
      rejectionReason: pod.rejectionReason || undefined,
      adminApprovedAt: pod.adminApprovedAt || undefined,
      adminApprovedBy: pod.adminApprovedBy?.toString?.() || undefined,
      clientApprovedAt: pod.clientApprovedAt || undefined,
      clientApprovedBy: pod.clientApprovedBy?.toString?.() || undefined,
    }))

    return NextResponse.json({
      success: true,
      message: 'PODs retrieved successfully',
      data: serializedPods
    })

  } catch (error: any) {
    console.error('POD fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PODs', details: error.message },
      { status: 500 }
    )
  }
}
