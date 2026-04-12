// src/app/api/invoice/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

interface InvoiceCreateBody {
  podId: string
  tonnageForThisInvoice: number // Partial tonnage
  transporterInvoiceNumber?: string
  transporterInvoiceAmount: number
  comments?: string
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admin can create invoices
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admin can create invoices' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    const body = await req.json() as InvoiceCreateBody

    const { podId, tonnageForThisInvoice, transporterInvoiceNumber, transporterInvoiceAmount, comments = '' } = body

    // Validation
    if (!podId || !tonnageForThisInvoice || !transporterInvoiceAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: podId, tonnageForThisInvoice, transporterInvoiceAmount' },
        { status: 400 }
      )
    }

    if (tonnageForThisInvoice <= 0) {
      return NextResponse.json(
        { error: 'Tonnage must be greater than 0' },
        { status: 400 }
      )
    }

    // Get POD
    const podId_obj = new ObjectId(podId)
    const pod = await db.collection('pods').findOne({ _id: podId_obj })

    if (!pod) {
      return NextResponse.json({ error: 'POD not found' }, { status: 404 })
    }

    // POD must be fully approved before invoice creation
    if (pod.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'POD must be fully approved (both admin and client) before creating invoice' },
        { status: 400 }
      )
    }

    // Get load to check total tonnage
    const load = await db.collection('loads').findOne({
      _id: pod.loadId
    })

    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    const totalLoadTonnage = load.weightInTons || load.tonnage || 0

    // Check if this partial tonnage exceeds total load tonnage
    // Get total tonnage already invoiced
    const existingInvoices = await db.collection('invoices').find({
      loadId: pod.loadId,
      status: { $nin: ['DRAFT', 'REJECTED'] }
    }).toArray()

    const alreadyInvoiced = existingInvoices.reduce((sum, inv) => {
      return sum + (inv.tonnageForThisInvoice || 0)
    }, 0)

    const totalWillBeInvoiced = alreadyInvoiced + tonnageForThisInvoice

    if (totalWillBeInvoiced > totalLoadTonnage) {
      return NextResponse.json(
        { error: `Cannot create invoice for ${tonnageForThisInvoice} tons. Already invoiced: ${alreadyInvoiced} tons. Total load: ${totalLoadTonnage} tons. Remaining: ${totalLoadTonnage - alreadyInvoiced} tons` },
        { status: 400 }
      )
    }

    // Generate invoice number (format: FX-YYYY-MM-XXXXX for now, QuickBooks format will be added later)
    const invoiceNumber = `FX-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Calculate markup (will be configurable, for now use placeholder)
    const markupPercentage = 10 // 10% markup (client will provide exact value)
    const markupAmount = transporterInvoiceAmount * (markupPercentage / 100)
    const clientInvoiceAmount = transporterInvoiceAmount + markupAmount

    // Create invoice
    const invoiceData = {
      loadId: pod.loadId,
      transporterId: pod.transporterId,
      clientId: pod.clientId,
      podId: podId_obj,

      // Partial invoice details
      tonnageForThisInvoice,
      totalLoadTonnage,
      tonnageDeliveredSoFar: alreadyInvoiced + tonnageForThisInvoice,

      // Transporter's invoice
      transporterInvoice: {
        invoiceNumber: transporterInvoiceNumber || `TR-${Date.now()}`,
        amount: transporterInvoiceAmount,
        date: pod.podDocument.uploadedAt, // Use POD upload date
        pdfUrl: pod.transporterInvoice.url
      },

      // Client invoice (with markup)
      clientInvoice: {
        invoiceNumber, // System generated
        amount: clientInvoiceAmount,
        date: new Date(),
        markup: markupAmount,
        markupPercentage,
        sentVia: 'quickbooks' // Will integrate with QB later
      },

      paymentStatus: 'UNPAID',
      paymentTrackedBy: null,
      paymentNotes: '',
      comments: comments,

      status: 'PENDING_ADMIN_APPROVAL', // Admin needs to verify before sending to client
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('invoices').insertOne(invoiceData)
    const invoiceId = result.insertedId.toString()

    // TODO: Send email notifications
    // - Admin: New invoice created, needs approval
    // - Transporter: Invoice created for their POD
    // - Client: Invoice ready (after admin approval)

    // TODO: Update PartialDelivery tracking
    // - Add this invoice to the load's partial delivery record
    // - Update tonnageDelivered percentage

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoiceId,
      data: {
        ...invoiceData,
        _id: invoiceId,
        loadId: pod.loadId.toString(),
        transporterId: pod.transporterId.toString(),
        clientId: pod.clientId.toString(),
        podId: podId
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Invoice creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice', details: error.message },
      { status: 500 }
    )
  }
}
