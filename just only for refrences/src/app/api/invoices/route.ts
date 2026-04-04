// src/app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const form          = await req.formData()
    const file          = form.get('file') as File
    const loadId        = form.get('loadId') as string
    const invoiceNumber = (form.get('invoiceNumber') as string) || `INV-${Date.now()}`
    const amount        = parseFloat(form.get('amount') as string ?? '0')
    const currency      = (form.get('currency') as string) || 'ZAR'

    if (!file || !loadId) return NextResponse.json({ error: 'File and loadId required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const { publicId, secureUrl } = await uploadFile(buffer, file.name, 'invoices')

    // Upsert invoice (replace if one already exists)
    const existing = await prisma.invoice.findFirst({ where: { loadId } })

    const invoice = existing
      ? await prisma.invoice.update({
          where: { id: existing.id },
          data:  { invoiceNumber, amount, currency, filename: publicId, originalName: file.name, fileUrl: secureUrl, issuedAt: new Date() },
        })
      : await prisma.invoice.create({
          data: { loadId, invoiceNumber, amount, currency, filename: publicId, originalName: file.name, fileUrl: secureUrl },
        })

    // Auto-share with client as a document
    await prisma.document.create({
      data: {
        loadId,
        userId:         session.user.id,
        docType:        'INVOICE',
        filename:       publicId,
        originalName:   file.name,
        fileUrl:        secureUrl,
        uploadedByRole: 'ADMIN',
        visibleTo:      'CLIENT,ADMIN',
      },
    })

    await prisma.loadUpdate.create({
      data: {
        loadId,
        userId:  session.user.id,
        message: `QuickBooks invoice ${invoiceNumber} (${currency} ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}) uploaded and shared with client.`,
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { invoiceId } = await req.json()
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data:  { status: 'PAID' },
  })
  return NextResponse.json(invoice)
}
