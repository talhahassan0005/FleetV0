// src/app/api/pod/[id]/view/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import fs from 'fs'
import path from 'path'

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
    
    let podId: ObjectId
    try {
      podId = new ObjectId(params.id)
    } catch (err) {
      return NextResponse.json({ error: 'Invalid POD ID' }, { status: 400 })
    }
    
    const pod = await db.collection('documents').findOne({
      _id: podId,
      docType: 'POD'
    })

    if (!pod) {
      return NextResponse.json({ error: 'POD not found' }, { status: 404 })
    }

    // Check authorization - must be admin, client of that load, or transporter who uploaded it
    const userId = new ObjectId(session.user.id)
    const role = session.user.role
    
    const isAdmin = role === 'ADMIN'
    const isTransporter = pod.userId.toString() === userId.toString() && role === 'TRANSPORTER'
    
    // Check if client has access (client of the load)
    let isClientOfLoad = false
    if (role === 'CLIENT') {
      const load = await db.collection('loads').findOne({
        _id: pod.loadId,
        clientId: userId
      })
      isClientOfLoad = !!load
    }

    if (!isAdmin && !isTransporter && !isClientOfLoad) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Handle LOCAL: prefix — file is stored on disk
    if (pod.filename?.startsWith('LOCAL:')) {
      const localPath = pod.filename.replace('LOCAL:', '')
      // Files are stored in /public/documents/ or uploads folder
      const possiblePaths = [
        path.join(process.cwd(), 'public', 'documents', localPath),
        path.join(process.cwd(), 'uploads', localPath),
        path.join(process.cwd(), 'public', localPath),
      ]

      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath)
          const mimeType = pod.fileMimeType || 'application/octet-stream'
          return new Response(fileBuffer, {
            headers: {
              'Content-Type': mimeType,
              'Content-Disposition': `inline; filename="${pod.originalName}"`,
            },
          })
        }
      }
    }

    // Handle regular URL
    if (pod.fileUrl && pod.fileUrl.startsWith('http')) {
      // Redirect to Cloudinary
      return NextResponse.redirect(pod.fileUrl)
    }

    // Try serving from public folder
    if (pod.fileUrl) {
      const publicPath = path.join(process.cwd(), 'public', pod.fileUrl)
      if (fs.existsSync(publicPath)) {
        const fileBuffer = fs.readFileSync(publicPath)
        return new Response(fileBuffer, {
          headers: { 'Content-Type': pod.fileMimeType || 'application/octet-stream' },
        })
      }
    }

    console.error('[POD View] File not found. Tried paths for:', pod.filename)
    return NextResponse.json(
      { error: 'POD file not found on disk' },
      { status: 404 }
    )
  } catch (error) {
    console.error('[POD View] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve POD' },
      { status: 500 }
    )
  }
}
