// src/app/api/admin/client-invoices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { 
      transporterInvoiceId, 
      quickbooksInvoiceNumber, 
      quickbooksInvoicePdfUrl, 
      quickbooksInvoicePdfName,
      amount, 
      currency, 
      tonnage,
      notes 
    } = body

    // Validation
    if (!transporterInvoiceId || !quickbooksInvoiceNumber || !quickbooksInvoicePdfUrl || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const transporterInvoiceObjectId = new ObjectId(transporterInvoiceId)

    // Get transporter invoice
    const transporterInvoice = await db.collection('transporter_invoices').findOne({ 
      _id: transporterInvoiceObjectId 
    })

    if (!transporterInvoice) {
      return NextResponse.json({ error: 'Transporter invoice not found' }, { status: 404 })
    }

    // Verify transporter invoice is approved
    if (transporterInvoice.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Transporter invoice must be approved first' },
        { status: 400 }
      )
    }

    // Check if client invoice already exists for this transporter invoice
    const existingClientInvoice = await db.collection('client_invoices').findOne({ 
      transporterInvoiceId: transporterInvoiceObjectId 
    })

    if (existingClientInvoice) {
      return NextResponse.json(
        { error: 'Client invoice already exists for this transporter invoice' },
        { status: 400 }
      )
    }

    // Create client invoice
    const clientInvoiceData = {
      loadId: transporterInvoice.loadId,
      clientId: transporterInvoice.clientId,
      transporterInvoiceId: transporterInvoiceObjectId,
      
      quickbooksInvoiceNumber,
      quickbooksInvoicePdfUrl,
      quickbooksInvoicePdfName,
      
      amount: parseFloat(amount),
      currency: currency || transporterInvoice.currency,
      tonnage: tonnage || transporterInvoice.tonnage,
      
      status: 'PENDING_SEND',
      paymentStatus: 'UNPAID',
      
      notes: notes || '',
      
      createdAt: new Date(),
      createdBy: new ObjectId(session.user.id),
      updatedAt: new Date()
    }

    const result = await db.collection('client_invoices').insertOne(clientInvoiceData)

    return NextResponse.json({
      success: true,
      message: 'Client invoice created successfully',
      invoiceId: result.insertedId.toString()
    }, { status: 201 })

  } catch (error: any) {
    console.error('[CreateClientInvoice] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create client invoice', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    
    // Get all client invoices
    const invoices = await db.collection('client_invoices')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Get details for each invoice
    const invoicesWithDetails = await Promise.all(
      invoices.map(async (invoice) => {
        const load = await db.collection('loads').findOne({ _id: invoice.loadId })
        const client = await db.collection('users').findOne({ _id: invoice.clientId })
        const transporterInvoice = await db.collection('transporter_invoices').findOne({ 
          _id: invoice.transporterInvoiceId 
        })
        
        return {
          _id: invoice._id.toString(),
          quickbooksInvoiceNumber: invoice.quickbooksInvoiceNumber,
          quickbooksInvoicePdfUrl: invoice.quickbooksInvoicePdfUrl,
          quickbooksInvoicePdfName: invoice.quickbooksInvoicePdfName,
          amount: invoice.amount,
          currency: invoice.currency,
          tonnage: invoice.tonnage,
          status: invoice.status,
          paymentStatus: invoice.paymentStatus,
          paymentDate: invoice.paymentDate,
          paymentNotes: invoice.paymentNotes,
          createdAt: invoice.createdAt,
          sentAt: invoice.sentAt,
          notes: invoice.notes,
          loadRef: load?.ref || 'Unknown',
          loadRoute: load ? `${load.origin} → ${load.destination}` : 'Unknown',
          clientName: client?.companyName || 'Unknown',
          clientEmail: client?.email || '',
          transporterInvoiceNumber: transporterInvoice?.invoiceNumber || 'Unknown'
        }
      })
    )

    return NextResponse.json({
      success: true,
      invoices: invoicesWithDetails
    })

  } catch (error: any) {
    console.error('[GetClientInvoices] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client invoices', details: error.message },
      { status: 500 }
    )
  }
}
