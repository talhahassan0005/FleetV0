// src/app/api/documents/[id]/view/route.ts
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

    const db = await getDatabase()
    const documentId = new ObjectId(params.id)
    
    const document = await db.collection('documents').findOne({
      _id: documentId
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check authorization - user must own the document OR be admin viewing it
    const userId = new ObjectId(session.user.id)
    const isOwner = document.userId.toString() === userId.toString()
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if document has fileUrl (Cloudinary URL)
    if (document.fileUrl && document.fileUrl.startsWith('http')) {
      // Redirect to Cloudinary
      return NextResponse.redirect(document.fileUrl)
    }

    // Check if document has base64 fileData
    if (document.fileData) {
      const base64Data = document.fileData
      const mimeType = document.fileMimeType || 'application/octet-stream'
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64')
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
          'Content-Disposition': `inline; filename="${document.originalName}"`,
          'Cache-Control': 'public, max-age=86400', // Cache for 1 day
        },
      })
    }

    // Check if document has data URI in fileUrl
    if (document.fileUrl && document.fileUrl.startsWith('data:')) {
      const dataURI = document.fileUrl
      const matches = dataURI.match(/^data:([^;]+);base64,(.+)$/)
      
      if (!matches) {
        return NextResponse.json({ error: 'Invalid document format' }, { status: 400 })
      }

      const mimeType = matches[1]
      const base64Data = matches[2]
      const buffer = Buffer.from(base64Data, 'base64')
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
          'Content-Disposition': `inline; filename="${document.originalName}"`,
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    return NextResponse.json({ error: 'Document has no file content' }, { status: 400 })
  } catch (err: any) {
    console.error('[ViewDocument] Error:', err)
    return NextResponse.json(
      { error: 'Failed to retrieve document' },
      { status: 500 }
    )
  }
}
