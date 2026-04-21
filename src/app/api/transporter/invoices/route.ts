import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'TRANSPORTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const db = await getDatabase()

  const invoices = await db.collection('invoices').find({
    $or: [
      { transporterId: new mongoose.Types.ObjectId(session.user.id) },
      { transporterId: session.user.id },
    ],
    invoiceType: 'TRANSPORTER_INVOICE',
  })
  .project({
    invoiceNumber: 1,
    loadId: 1,
    paymentStatus: 1,
    amount: 1,
    currency: 1,
    createdAt: 1,
    // QB fields and markup intentionally excluded from transporter view
  })
  .sort({ createdAt: -1 })
  .toArray()

  return NextResponse.json({ success: true, invoices })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'TRANSPORTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const invoiceNumber = formData.get('invoiceNumber') as string
    const amount = parseFloat(formData.get('amount') as string)
    const currency = formData.get('currency') as string || 'ZAR'
    const loadId = formData.get('loadId') as string

    if (!file || !invoiceNumber || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload file to Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const cloudinary = require('cloudinary').v2
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'transporter-invoices', resource_type: 'auto' },
        (error: any, result: any) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const fileUrl = (uploadResult as any).secure_url

    const db = await getDatabase()
    const invoice = {
      invoiceNumber,
      amount,
      currency,
      loadId: loadId ? new mongoose.Types.ObjectId(loadId) : null,
      transporterId: new mongoose.Types.ObjectId(session.user.id),
      invoiceType: 'TRANSPORTER_INVOICE',
      paymentStatus: 'UNPAID',
      fileUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('invoices').insertOne(invoice)

    return NextResponse.json({ 
      success: true, 
      invoiceId: result.insertedId.toString(),
      message: 'Invoice uploaded successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('[TransporterInvoice] Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload invoice',
      details: error.message 
    }, { status: 500 })
  }
}
