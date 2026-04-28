// src/app/api/auth/upload-documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { uploadFile } from '@/lib/cloudinary'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

interface DocumentFile {
  file: File
  type: string
}

export async function POST(req: NextRequest) {
  try {
    console.log('[UploadDocuments] Request received')
    
    // Get session with detailed logging
    const session = await getServerSession(authOptions)
    console.log('[UploadDocuments] Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email
    })
    
    if (!session?.user?.email) {
      console.log('[UploadDocuments] No session or email - returning 401')
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    console.log('[UploadDocuments] Connecting to database...')
    const db = await getDatabase()
    
    // Get user
    console.log('[UploadDocuments] Finding user:', session.user.email)
    const user = await db.collection('users').findOne({
      email: session.user.email.toLowerCase(),
    })

    if (!user) {
      console.error('[UploadDocuments] User not found in database:', session.user.email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[UploadDocuments] User found:', { userId: user._id.toString(), role: user.role })

    // Parse FormData
    console.log('[UploadDocuments] Parsing form data...')
    const formData = await req.formData()
    const documentsArray: DocumentFile[] = []

    let idx = 0
    while (true) {
      const file = formData.get(`documents[${idx}]`) as File | null
      const type = formData.get(`documentTypes[${idx}]`) as string | null

      if (!file) break
      if (type) {
        console.log(`[UploadDocuments] Found document ${idx}:`, { name: file.name, type, size: file.size })
        documentsArray.push({ file, type })
      }
      idx++
    }

    if (documentsArray.length === 0) {
      console.log('[UploadDocuments] No documents provided in form data')
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      )
    }

    console.log(`[UploadDocuments] User ${user.email} uploading ${documentsArray.length} documents`)

    // Upload documents to Cloudinary
    const uploadedDocs: { id: any; type: string; status: string }[] = []
    for (const doc of documentsArray) {
      try {
        console.log(`[UploadDocuments] Processing ${doc.type}: ${doc.file.name}`)
        const buffer = Buffer.from(await doc.file.arrayBuffer())
        console.log(`[UploadDocuments] Buffer created, size: ${buffer.length} bytes`)
        
        console.log(`[UploadDocuments] Uploading to Cloudinary...`)
        const { publicId, secureUrl } = await uploadFile(
          buffer,
          doc.file.name,
          'verification-docs'
        )

        console.log(`[UploadDocuments] Cloudinary upload success:`, { publicId, secureUrl: secureUrl.substring(0, 50) })

        // Create document record in MongoDB
        const roles = new Set([user.role, 'ADMIN'])
        const visibleTo = Array.from(roles).join(',')
        
        console.log(`[UploadDocuments] Creating document record in MongoDB...`)
        const docResult = await db.collection('documents').insertOne({
          userId: new ObjectId(user._id),
          docType: doc.type,
          filename: publicId,
          originalName: doc.file.name,
          fileUrl: secureUrl,
          uploadedByRole: user.role,
          visibleTo: visibleTo,
          documentCategory: 'VERIFICATION',
          verificationStatus: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        console.log(`[UploadDocuments] Document record created:`, docResult.insertedId.toString())

        uploadedDocs.push({
          id: docResult.insertedId,
          type: doc.type,
          status: 'PENDING',
        })
      } catch (uploadErr: any) {
        console.error(`[UploadDocuments] Failed to upload ${doc.type}:`, {
          error: uploadErr.message,
          stack: uploadErr.stack,
          fileName: doc.file.name
        })
        throw new Error(`Failed to upload document: ${doc.file.name}. Error: ${uploadErr.message}`)
      }
    }

    // Update user to mark that documents have been submitted
    console.log('[UploadDocuments] Updating user verification status...')
    await db.collection('users').updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          documentsSubmitted: true,
          documentSubmissionDate: new Date(),
          verificationStatus: 'PENDING',
          updatedAt: new Date(),
        },
      }
    )

    console.log(`[UploadDocuments] ✅ Successfully uploaded ${uploadedDocs.length} documents for user ${user.email}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Documents uploaded successfully. Our team will review and verify your account within 24-48 hours.',
        documentsUploaded: uploadedDocs.length,
        documents: uploadedDocs,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[UploadDocuments] ❌ Error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    })
    return NextResponse.json(
      {
        error: err.message || 'Failed to upload documents. Please try again.',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    )
  }
}
