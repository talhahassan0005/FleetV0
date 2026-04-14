// src/app/api/documents/[id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!params.id) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    let docId: any
    try {
      docId = new ObjectId(params.id)
    } catch (err) {
      console.error('ObjectId creation error:', err, 'ID:', params.id)
      return NextResponse.json(
        { error: 'Invalid document ID format' },
        { status: 400 }
      )
    }

    const doc = await db.collection('documents').findOne({
      _id: docId,
    })

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if user has access
    const userId = new ObjectId(session.user.id)
    const canAccess = 
      doc.userId.toString() === userId.toString() ||
      (doc.visibleTo && doc.visibleTo.includes(session.user.role))

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // If fileData exists (MongoDB base64), return it
    if (doc.fileData) {
      const buffer = Buffer.from(doc.fileData, 'base64')
      const mimeType = doc.fileMimeType || 'application/octet-stream'
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `inline; filename="${doc.originalName}"`,
        },
      })
    }

    // If Cloudinary URL exists, redirect to it
    if (doc.fileUrl && doc.fileUrl.startsWith('http')) {
      return NextResponse.redirect(doc.fileUrl)
    }

    return NextResponse.json({ error: 'File not available' }, { status: 404 })
  } catch (err: any) {
    console.error('Download document error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
