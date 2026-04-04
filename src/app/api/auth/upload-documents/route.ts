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
    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    
    // Get user
    const user = await db.collection('users').findOne({
      email: session.user.email.toLowerCase(),
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse FormData
    const formData = await req.formData()
    const documentsArray: DocumentFile[] = []

    let idx = 0
    while (true) {
      const file = formData.get(`documents[${idx}]`) as File | null
      const type = formData.get(`documentTypes[${idx}]`) as string | null

      if (!file) break
      if (type) {
        documentsArray.push({ file, type })
      }
      idx++
    }

    if (documentsArray.length === 0) {
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
        const buffer = Buffer.from(await doc.file.arrayBuffer())
        const { publicId, secureUrl } = await uploadFile(
          buffer,
          doc.file.name,
          'verification-docs'
        )

        console.log(`[UploadDocuments] Uploaded ${doc.type}: ${publicId}`)

        // Create document record in MongoDB
        // Document must be visible to: uploader's role + ADMIN
        const roles = new Set([user.role, 'ADMIN'])
        const visibleTo = Array.from(roles).join(',')
        
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

        uploadedDocs.push({
          id: docResult.insertedId,
          type: doc.type,
          status: 'PENDING',
        })
      } catch (uploadErr) {
        console.error(`[UploadDocuments] Failed to upload ${doc.type}:`, uploadErr)
        throw new Error(`Failed to upload document: ${doc.file.name}`)
      }
    }

    // Update user to mark that documents have been submitted
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

    console.log(`[UploadDocuments] Successfully uploaded ${uploadedDocs.length} documents for user ${user.email}`)

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
    console.error('[UploadDocuments] Error:', err)
    return NextResponse.json(
      {
        error: err.message || 'Failed to upload documents. Please try again.',
      },
      { status: 500 }
    )
  }
}
