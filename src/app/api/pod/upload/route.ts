// src/app/api/pod/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { uploadFile } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'

interface PODUploadRequest {
  loadId: string
  deliveryDate: string
  deliveryTime: string
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only transporters can upload POD
    if (!session?.user || session.user.role !== 'TRANSPORTER') {
      return NextResponse.json(
        { error: 'Only transporters can upload POD' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    const form = await req.formData()

    // Parse form data
    const loadId = form.get('loadId') as string
    const deliveryDate = form.get('deliveryDate') as string
    const deliveryTime = form.get('deliveryTime') as string
    const notes = form.get('notes') as string || ''
    const podFile = form.get('podFile') as File | null
    const invoiceFile = form.get('invoiceFile') as File | null

    // Validation
    if (!loadId || !deliveryDate || !deliveryTime) {
      return NextResponse.json(
        { error: 'Missing required fields: loadId, deliveryDate, deliveryTime' },
        { status: 400 }
      )
    }

    if (!podFile) {
      return NextResponse.json(
        { error: 'POD document is required' },
        { status: 400 }
      )
    }

    if (!invoiceFile) {
      return NextResponse.json(
        { error: 'Invoice document is required' },
        { status: 400 }
      )
    }

    // Verify load exists and belongs to transporter
    const loadId_obj = new ObjectId(loadId)
    const load = await db.collection('loads').findOne({
      _id: loadId_obj,
      transporterId: new ObjectId(session.user.id),
      status: 'ASSIGNED' // Load must be assigned to this transporter
    })

    if (!load) {
      return NextResponse.json(
        { error: 'Load not found or not assigned to you' },
        { status: 404 }
      )
    }

    // Upload POD document
    const podArrayBuffer = await podFile.arrayBuffer()
    const podBuffer = Buffer.from(podArrayBuffer)
    const { secureUrl: podUrl } = await uploadFile(
      podBuffer,
      podFile.name,
      `fleetxchange/pods/${loadId}`
    )

    // Upload Invoice document
    const invoiceArrayBuffer = await invoiceFile.arrayBuffer()
    const invoiceBuffer = Buffer.from(invoiceArrayBuffer)
    const { secureUrl: invoiceUrl } = await uploadFile(
      invoiceBuffer,
      invoiceFile.name,
      `fleetxchange/invoices/${loadId}`
    )

    // Create POD record
    const podData = {
      loadId: loadId_obj,
      transporterId: new ObjectId(session.user.id),
      clientId: load.clientId,
      
      // POD details
      podDocument: {
        filename: podFile.name,
        url: podUrl,
        mimeType: podFile.type,
        uploadedAt: new Date()
      },
      
      // Invoice details from transporter
      transporterInvoice: {
        filename: invoiceFile.name,
        url: invoiceUrl,
        mimeType: invoiceFile.type,
        uploadedAt: new Date()
      },
      
      deliveryDate: new Date(deliveryDate),
      deliveryTime: deliveryTime,
      notes: notes,
      
      // Approval status
      adminApproval: {
        approved: false,
        approvedBy: null,
        approvedAt: null,
        comments: ''
      },
      clientApproval: {
        approved: false,
        approvedBy: null,
        approvedAt: null,
        comments: ''
      },
      
      status: 'PENDING_ADMIN', // Admin approval is first
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('pods').insertOne(podData)
    const podId = result.insertedId.toString()

    // TODO: Send email notifications
    // - Admin notification: New POD uploaded
    // - Transporter confirmation: POD uploaded successfully
    // - Client notification: POD ready for review (after admin approves)

    return NextResponse.json({
      success: true,
      message: 'POD and Invoice uploaded successfully',
      podId: podId,
      data: {
        ...podData,
        _id: podId,
        loadId: loadId,
        transporterId: session.user.id
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('POD upload error:', error)
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

    const db = await getDatabase()
    const userId = new ObjectId(session.user.id)
    const role = session.user.role

    let query: any = {}

    // Different filters based on role
    if (role === 'TRANSPORTER') {
      // Transporter sees their own PODs
      query.transporterId = userId
    } else if (role === 'CLIENT') {
      // Client sees PODs for their loads
      query.clientId = userId
    } else if (role === 'ADMIN') {
      // Admin sees all PODs
      // No filter
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 403 })
    }

    const pods = await db.collection('pods')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    // Serialize ObjectIds
    const serializedPods = pods.map((pod: any) => ({
      ...pod,
      _id: pod._id?.toString?.() || pod._id,
      loadId: pod.loadId?.toString?.() || pod.loadId,
      transporterId: pod.transporterId?.toString?.() || pod.transporterId,
      clientId: pod.clientId?.toString?.() || pod.clientId,
    }))

    return NextResponse.json({
      success: true,
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
