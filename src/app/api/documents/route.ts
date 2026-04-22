// src/app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { uploadFile } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    console.log('[Documents API] Starting fetch...')
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Documents API] User:', session.user.email, 'Role:', session.user.role)
    const db = await getDatabase()
    const userId = new ObjectId(session.user.id)
    const userRole = session.user.role
    
    // Check if user is any type of admin
    const isAdmin = ['SUPER_ADMIN', 'POD_MANAGER', 'OPERATIONS_ADMIN', 'FINANCE_ADMIN'].includes(userRole)
    
    if (isAdmin) {
      console.log('[Documents API] Fetching all documents for ADMIN...')
      const documents = await db.collection('documents')
        .aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $sort: { createdAt: -1 }
          },
          {
            $project: {
              _id: 1,
              userId: 1,
              loadId: 1,
              docType: 1,
              filename: 1,
              originalName: 1,
              fileUrl: 1,
              fileMimeType: 1,
              uploadedByRole: 1,
              visibleTo: 1,
              verificationStatus: 1,
              approved: 1,
              approvedAt: 1,
              approvedBy: 1,
              rejectionReason: 1,
              reviews: 1,
              createdAt: 1,
              updatedAt: 1,
              'user._id': 1,
              'user.name': 1,
              'user.email': 1,
              'user.companyName': 1,
              'user.role': 1,
              'user.isVerified': 1
            }
          }
        ])
        .toArray()

      console.log('[Documents API] Found', documents.length, 'documents')

      const serializedDocs = documents.map((doc: any) => ({
        ...doc,
        _id: doc._id?.toString?.() || doc._id,
        userId: doc.userId?.toString?.() || doc.userId,
        loadId: doc.loadId?.toString?.() || doc.loadId,
        user: doc.user ? {
          _id: doc.user._id?.toString?.() || doc.user._id,
          userId: doc.user._id?.toString?.() || doc.user._id,
          name: doc.user.name,
          email: doc.user.email,
          companyName: doc.user.companyName,
          role: doc.user.role,
          isVerified: doc.user.isVerified || false
        } : null
      }))

      console.log('[Documents API] Returning response...')
      return NextResponse.json({
        success: true,
        data: serializedDocs,
      })
    } else {
      const documents = await db.collection('documents').find({ userId: userId }).sort({ createdAt: -1 }).toArray()

      const serializedDocs = documents.map((doc: any) => ({
        ...doc,
        _id: doc._id?.toString?.() || doc._id,
        userId: doc.userId?.toString?.() || doc.userId,
        loadId: doc.loadId?.toString?.() || doc.loadId,
      }))

      return NextResponse.json({
        success: true,
        data: serializedDocs,
      })
    }
  } catch (err: any) {
    console.error('[Documents API] Error:', err)
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 })
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
    
    // Prepare document object with approval fields for PODs
    const docObject: any = {
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
    }
    
    // Add approval status fields for PODs
    if (docType === 'POD') {
      docObject.adminApprovalStatus = 'PENDING_ADMIN'
      docObject.clientApprovalStatus = 'PENDING_ADMIN' // Will be set to PENDING_CLIENT after admin approves
      docObject.adminApprovedAt = null
      docObject.adminApprovedBy = null
      docObject.adminComments = ''
      docObject.clientApprovedAt = null
      docObject.clientApprovedBy = null
      docObject.clientComments = ''
    }
    
    const docResult = await db.collection('documents').insertOne(docObject)

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
    if (docType === 'INVOICE' && loadId && ['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role ?? '')) {
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
