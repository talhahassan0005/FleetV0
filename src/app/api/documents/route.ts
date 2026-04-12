// src/app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { uploadFile } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(session.user.id)
    const userRole = session.user.role

    console.log('[GetDocuments] Query user:', {
      userId: session.user.id,
      userIdObjectId: userId.toString(),
      role: userRole,
    })

    // Get ALL documents first to inspect
    const allDocs = await db.collection('documents').find({}).toArray()
    console.log('[GetDocuments] Total documents in DB:', allDocs.length)
    allDocs.forEach((doc: any) => {
      console.log('[GetDocuments] DB Doc:', {
        id: doc._id?.toString?.(),
        userId: doc.userId?.toString?.(),
        uploadedByRole: doc.uploadedByRole,
        visibleTo: doc.visibleTo,
      })
    })
    
    // Build query based on user role
    let query: any = {}
    
    if (userRole === 'ADMIN') {
      // ADMIN can see ALL documents
      console.log('[GetDocuments] ADMIN user - fetching ALL documents')
      query = {} // Empty query = all documents
    } else {
      // CLIENT and TRANSPORTER see only their own documents
      console.log('[GetDocuments] Regular user - fetching only own documents')
      query = { userId: userId }
    }
    
    // Get documents based on query
    const documents = await db.collection('documents').find(query).sort({ createdAt: -1 }).toArray()

    console.log('[GetDocuments] Found matching documents:', documents.length, 'with query:', query)
    documents.forEach((doc: any) => {
      console.log('[GetDocuments] Result Doc:', {
        id: doc._id?.toString?.(),
        userId: doc.userId?.toString?.(),
        uploadedByRole: doc.uploadedByRole,
        visibleTo: doc.visibleTo,
      })
    })

    // Convert ObjectIds to strings for JSON serialization
    const serializedDocs = documents.map((doc: any) => {
      const serialized: any = {
        ...doc,
        _id: doc._id?.toString?.() || doc._id,
      }
      // Also serialize userId if it exists
      if (doc.userId) {
        serialized.userId = doc.userId?.toString?.() || doc.userId
      }
      // Serialize loadId if it exists
      if (doc.loadId) {
        serialized.loadId = doc.loadId?.toString?.() || doc.loadId
      }
      return serialized
    })

    return NextResponse.json({
      success: true,
      data: serializedDocs,
    })
  } catch (err: any) {
    console.error('Documents fetch error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const db = await getDatabase()
    const form = await req.formData()
    const file      = form.get('file') as File
    const docType   = (form.get('docType') as string ?? 'OTHER').toUpperCase()
    const loadId    = form.get('loadId') as string | null
    const visibleTo = (form.get('visibleTo') as string ?? 'ADMIN').toUpperCase()

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Check if Cloudinary is configured
    const useCloudinary = !!process.env.CLOUDINARY_API_KEY
    let fileUrl = ''
    let publicId = ''

    if (useCloudinary) {
      // Use Cloudinary for production
      const folder = docType === 'POD' ? 'pods' : docType === 'INVOICE' ? 'invoices' : 'docs'
      const { publicId: id, secureUrl } = await uploadFile(buffer, file.name, folder)
      publicId = id
      fileUrl = secureUrl
    } else {
      // Store as base64 in MongoDB for development
      const base64Data = buffer.toString('base64')
      const mimeType = file.type || 'application/octet-stream'
      publicId = `DATA:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      fileUrl = `data:${mimeType};base64,${base64Data}` // Full base64
    }

    // Ensure document is always visible to uploader + their role + ADMIN
    const roles = new Set([session.user.role, 'ADMIN'])
    if (visibleTo) {
      visibleTo.split(',').forEach(r => roles.add(r))
    }
    const finalVisibleTo = Array.from(roles).join(',')
    
    const docResult = await db.collection('documents').insertOne({
      userId:         new ObjectId(session.user.id),
      loadId:         loadId ? new ObjectId(loadId) : undefined,
      docType:        docType,
      filename:       publicId,
      originalName:   file.name,
      fileUrl:        fileUrl,
      fileData:       !useCloudinary ? buffer.toString('base64') : undefined, // Store base64 if not using Cloudinary
      fileMimeType:   file.type || 'application/octet-stream',
      uploadedByRole: session.user.role,
      visibleTo:      finalVisibleTo,
      createdAt:      new Date(),
      updatedAt:      new Date(),
    })

    console.log('[PostDocument] Saved document:', {
      docId: docResult.insertedId.toString(),
      userId: session.user.id,
      docType,
      uploadedByRole: session.user.role,
      visibleTo,
    })

    const docId = docResult.insertedId

    // If transporter uploads a POD, add update and mark delivered
    if (docType === 'POD' && loadId) {
      await db.collection('loadUpdates').insertOne({
        loadId: new ObjectId(loadId),
        userId: new ObjectId(session.user.id),
        message: 'Proof of Delivery (POD) uploaded — shared with client.',
        createdAt: new Date(),
      })
      // Auto-expire tracking on POD upload
      await db.collection('trackingLinks').updateMany(
        { loadId: new ObjectId(loadId), isActive: true },
        { $set: { isActive: false, expiredAt: new Date() } }
      )
      // Mark delivered if not already
      const load = await db.collection('loads').findOne({ _id: new ObjectId(loadId) })
      if (load && load.status !== 'DELIVERED') {
        await db.collection('loads').updateOne(
          { _id: new ObjectId(loadId) },
          { $set: { status: 'DELIVERED', updatedAt: new Date() } }
        )
      }
    }

    // If admin uploads invoice, share with client automatically
    if (docType === 'INVOICE' && loadId && session.user.role === 'ADMIN') {
      await db.collection('documents').updateOne(
        { _id: docId },
        { $set: { visibleTo: 'CLIENT,ADMIN', updatedAt: new Date() } }
      )
    }

    return NextResponse.json({ _id: docId, ...({
      userId:         session.user.id,
      loadId:         loadId ?? undefined,
      docType:        docType,
      filename:       publicId,
      originalName:   file.name,
      fileUrl:        fileUrl,
      uploadedByRole: session.user.role,
      visibleTo:      visibleTo,
    })}, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
