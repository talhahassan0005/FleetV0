// src/app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const form = await req.formData()
    const file      = form.get('file') as File
    const docType   = (form.get('docType') as string ?? 'OTHER').toUpperCase()
    const loadId    = form.get('loadId') as string | null
    const visibleTo = (form.get('visibleTo') as string ?? 'ADMIN').toUpperCase()

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Choose Cloudinary subfolder based on doc type
    const folder = docType === 'POD' ? 'pods' : docType === 'INVOICE' ? 'invoices' : 'docs'

    const { publicId, secureUrl } = await uploadFile(buffer, file.name, folder)

    const doc = await prisma.document.create({
      data: {
        userId:         session.user.id,
        loadId:         loadId ?? undefined,
        docType:        docType as any,
        filename:       publicId,
        originalName:   file.name,
        fileUrl:        secureUrl,
        uploadedByRole: session.user.role as any,
        visibleTo,
      },
    })

    // If transporter uploads a POD, add update and mark delivered
    if (docType === 'POD' && loadId) {
      await prisma.loadUpdate.create({
        data: { loadId, userId: session.user.id, message: 'Proof of Delivery (POD) uploaded — shared with client.' },
      })
      // Auto-expire tracking on POD upload
      await prisma.trackingLink.updateMany({
        where: { loadId, isActive: true },
        data:  { isActive: false, expiredAt: new Date() },
      })
      // Mark delivered if not already
      const load = await prisma.load.findUnique({ where: { id: loadId } })
      if (load && load.status !== 'DELIVERED') {
        await prisma.load.update({ where: { id: loadId }, data: { status: 'DELIVERED' } })
      }
    }

    // If admin uploads invoice, share with client automatically
    if (docType === 'INVOICE' && loadId && session.user.role === 'ADMIN') {
      await prisma.document.update({
        where: { id: doc.id },
        data:  { visibleTo: 'CLIENT,ADMIN' },
      })
    }

    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
