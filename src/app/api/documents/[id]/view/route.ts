// src/app/api/documents/[id]/view/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import path from 'path'
import fs from 'fs/promises'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('[ViewDocument] Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      docId: params.id
    })
    
    if (!session?.user) {
      console.log('[ViewDocument] No session - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const documentId = new ObjectId(params.id)
    
    const document = await db.collection('documents').findOne({
      _id: documentId
    })

    if (!document) {
      console.log('[ViewDocument] Document not found')
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    console.log('[ViewDocument] Document found:', {
      id: document._id.toString(),
      filename: document.filename,
      fileUrl: document.fileUrl?.substring(0, 100),
      hasFileData: !!document.fileData,
      fileMimeType: document.fileMimeType,
      originalName: document.originalName
    })

    // Check authorization - user must own the document OR be admin OR be client/transporter viewing shared documents
    const userId = new ObjectId(session.user.id)
    const isOwner = document.userId?.toString() === userId.toString()
    const isAdmin = ['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role ?? '')
    const isClient = session.user.role === 'CLIENT'
    const isTransporter = session.user.role === 'TRANSPORTER'
    
    // Allow access if:
    // 1. User owns the document
    // 2. User is admin (can view all documents)
    // 3. Client viewing transporter documents
    // 4. Transporter viewing client documents
    const canView = isOwner || isAdmin || 
                    (isClient && document.uploadedByRole === 'TRANSPORTER') ||
                    (isTransporter && document.uploadedByRole === 'CLIENT')

    if (!canView) {
      console.log('[ViewDocument] Access denied:', { isOwner, isAdmin, userRole: session.user.role, docRole: document.uploadedByRole })
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    console.log('[ViewDocument] Access granted:', { isOwner, isAdmin, userRole: session.user.role })

    // CASE 1: Cloudinary URL - redirect directly to viewable URL
    if (document.fileUrl && document.fileUrl.startsWith('http')) {
      let cleanUrl = document.fileUrl.replace('/fl_attachment/', '/')
      
      // Convert raw PDF to viewable image transformation
      if (cleanUrl.includes('/raw/upload/') && cleanUrl.toLowerCase().includes('.pdf')) {
        cleanUrl = cleanUrl.replace('/raw/upload/', '/image/upload/f_auto,q_auto,pg_1/')
      }
      
      return NextResponse.redirect(cleanUrl)
    }

    // CASE 2: Check if fileUrl contains LOCAL path (broken format from old uploads)
    if (document.fileUrl && document.fileUrl.includes('LOCAL:')) {
      console.log('[ViewDocument] Detected broken LOCAL path in fileUrl, extracting path')
      // Extract the LOCAL path from fileUrl like '/documents/LOCAL:pods/...'
      const localMatch = document.fileUrl.match(/LOCAL:(.+)$/)
      if (localMatch) {
        try {
          const localPath = localMatch[1]
          const fullPath = path.join(process.cwd(), 'uploads', localPath)
          
          console.log('[ViewDocument] Attempting to read from extracted path:', fullPath)
          
          try {
            await fs.access(fullPath)
            const fileBuffer = await fs.readFile(fullPath)
            const mimeType = document.fileMimeType || 'application/octet-stream'
            
            console.log('[ViewDocument] File read successfully, size:', fileBuffer.length)
            
            return new NextResponse(fileBuffer, {
              status: 200,
              headers: {
                'Content-Type': mimeType,
                'Content-Length': fileBuffer.length.toString(),
                'Content-Disposition': `inline; filename="${document.originalName}"`,
                'Cache-Control': 'public, max-age=86400',
              },
            })
          } catch {
            console.error('[ViewDocument] File not found at extracted path:', fullPath)
            return NextResponse.json({ 
              error: 'File not found on disk',
              details: 'This is an old document that was not properly uploaded. Please re-upload the document.'
            }, { status: 404 })
          }
        } catch (err: any) {
          console.error('[ViewDocument] Error processing broken LOCAL path:', err)
        }
      }
    }

    // CASE 3: LOCAL file path (filename starts with "LOCAL:")
    if (document.filename && document.filename.startsWith('LOCAL:')) {
      try {
        const localPath = document.filename.substring(6) // Remove "LOCAL:" prefix
        const fullPath = path.join(process.cwd(), 'uploads', localPath)
        
        console.log('[ViewDocument] Attempting to read LOCAL file:', fullPath)
        
        // Check if file exists
        try {
          await fs.access(fullPath)
        } catch {
          console.error('[ViewDocument] LOCAL file not found:', fullPath)
          return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
        }
        
        // Read file from disk
        const fileBuffer = await fs.readFile(fullPath)
        const mimeType = document.fileMimeType || 'application/octet-stream'
        
        console.log('[ViewDocument] LOCAL file read successfully, size:', fileBuffer.length)
        
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': fileBuffer.length.toString(),
            'Content-Disposition': `inline; filename="${document.originalName}"`,
            'Cache-Control': 'public, max-age=86400',
          },
        })
      } catch (err: any) {
        console.error('[ViewDocument] Error reading LOCAL file:', err)
        return NextResponse.json({ error: 'Failed to read file from disk' }, { status: 500 })
      }
    }

    // CASE 3: Base64 data in fileData field
    if (document.fileData) {
      try {
        const base64Data = document.fileData
        const mimeType = document.fileMimeType || 'application/octet-stream'
        
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64')
        
        console.log('[ViewDocument] Serving from fileData field, size:', buffer.length)
        
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': buffer.length.toString(),
            'Content-Disposition': `inline; filename="${document.originalName}"`,
            'Cache-Control': 'public, max-age=86400',
          },
        })
      } catch (err: any) {
        console.error('[ViewDocument] Error decoding fileData:', err)
        return NextResponse.json({ error: 'Failed to decode file data' }, { status: 500 })
      }
    }

    // CASE 4: Data URI in fileUrl (data:mime;base64,...)
    if (document.fileUrl && document.fileUrl.startsWith('data:')) {
      try {
        const dataURI = document.fileUrl
        const matches = dataURI.match(/^data:([^;]+);base64,(.+)$/)
        
        if (!matches) {
          console.error('[ViewDocument] Invalid data URI format')
          return NextResponse.json({ error: 'Invalid document format' }, { status: 400 })
        }

        const mimeType = matches[1]
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')
        
        console.log('[ViewDocument] Serving from data URI, size:', buffer.length)
        
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': buffer.length.toString(),
            'Content-Disposition': `inline; filename="${document.originalName}"`,
            'Cache-Control': 'public, max-age=86400',
          },
        })
      } catch (err: any) {
        console.error('[ViewDocument] Error processing data URI:', err)
        return NextResponse.json({ error: 'Failed to process data URI' }, { status: 500 })
      }
    }

    // CASE 5: Relative path in fileUrl (try to read from uploads folder)
    if (document.fileUrl && !document.fileUrl.startsWith('http') && !document.fileUrl.startsWith('data:')) {
      try {
        const fullPath = path.join(process.cwd(), 'uploads', document.fileUrl)
        
        console.log('[ViewDocument] Attempting to read relative path:', fullPath)
        
        // Check if file exists
        try {
          await fs.access(fullPath)
        } catch {
          console.error('[ViewDocument] File not found at relative path:', fullPath)
          // Fall through to error below
        }
        
        // Read file from disk
        const fileBuffer = await fs.readFile(fullPath)
        const mimeType = document.fileMimeType || 'application/octet-stream'
        
        console.log('[ViewDocument] Relative path file read successfully, size:', fileBuffer.length)
        
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': fileBuffer.length.toString(),
            'Content-Disposition': `inline; filename="${document.originalName}"`,
            'Cache-Control': 'public, max-age=86400',
          },
        })
      } catch (err: any) {
        console.error('[ViewDocument] Error reading relative path file:', err)
        // Fall through to error below
      }
    }

    // No valid file content found
    console.error('[ViewDocument] No valid file content found for document:', {
      id: document._id.toString(),
      filename: document.filename,
      fileUrl: document.fileUrl,
      hasFileData: !!document.fileData
    })
    
    return NextResponse.json({ 
      error: 'Document has no file content',
      details: 'The document exists but no file data could be retrieved. Please contact support.'
    }, { status: 400 })
  } catch (err: any) {
    console.error('[ViewDocument] Error:', err)
    return NextResponse.json(
      { error: 'Failed to retrieve document', details: err.message },
      { status: 500 }
    )
  }
}
