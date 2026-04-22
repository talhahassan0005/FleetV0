// src/app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { uploadFile } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role ?? ''))
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const db = await getDatabase()
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
    const loadObjectId = new ObjectId(loadId)
    const existing = await db.collection('invoices').findOne({ loadId: loadObjectId })

    let invoice
    if (existing) {
      await db.collection('invoices').updateOne(
        { _id: existing._id },
        {
          $set: {
            invoiceNumber, amount, currency, filename: publicId, originalName: file.name, fileUrl: secureUrl,
            issuedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      )
      invoice = await db.collection('invoices').findOne({ _id: existing._id })
    } else {
      const result = await db.collection('invoices').insertOne({
        loadId: loadObjectId,
        invoiceNumber, amount, currency, filename: publicId, originalName: file.name, fileUrl: secureUrl,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      invoice = { _id: result.insertedId, loadId: loadObjectId, invoiceNumber, amount, currency }
    }

    // Auto-share with client as a document
    await db.collection('documents').insertOne({
      loadId: loadObjectId,
      userId: new ObjectId(session.user.id),
      docType: 'INVOICE',
      filename: publicId,
      originalName: file.name,
      fileUrl: secureUrl,
      uploadedByRole: 'ADMIN',
      visibleTo: 'CLIENT,ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await db.collection('loadUpdates').insertOne({
      loadId: loadObjectId,
      userId: new ObjectId(session.user.id),
      message: `QuickBooks invoice ${invoiceNumber} (${currency} ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}) uploaded and shared with client.`,
      createdAt: new Date(),
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role ?? ''))
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const db = await getDatabase()
    const { invoiceId } = await req.json()
    const invoiceObjectId = new ObjectId(invoiceId)

    await db.collection('invoices').updateOne(
      { _id: invoiceObjectId },
      { $set: { status: 'PAID', updatedAt: new Date() } }
    )

    const invoice = await db.collection('invoices').findOne({ _id: invoiceObjectId })
    return NextResponse.json(invoice)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
