// src/app/api/load/[id]/progress/route.ts
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
    const loadId = new ObjectId(params.id)

    // Get the load
    const load = await db.collection('loads').findOne({ _id: loadId })

    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    // Authorization: User must be involved in this load
    const userId = new ObjectId(session.user.id)
    const canView = 
      load.clientId?.toString() === userId.toString() ||
      load.transporterId?.toString() === userId.toString() ||
      session.user.role === 'ADMIN'

    if (!canView) {
      return NextResponse.json(
        { error: 'You do not have access to this load' },
        { status: 403 }
      )
    }

    const totalLoadTonnage = load.weightInTons || load.tonnage || 0

    // Get all invoices for this load (excluding drafts and rejected)
    const invoices = await db.collection('invoices')
      .find({
        loadId,
        status: { $nin: ['DRAFT', 'REJECTED'] }
      })
      .toArray()

    // Calculate delivered tonnage
    const tonnageDelivered = invoices.reduce((sum, inv) => {
      return sum + (inv.tonnageForThisInvoice || 0)
    }, 0)

    const percentageComplete = totalLoadTonnage > 0 
      ? Math.round((tonnageDelivered / totalLoadTonnage) * 100)
      : 0

    // Get partial invoice details
    const partialInvoices = invoices.map(inv => ({
      invoiceId: inv._id?.toString?.() || inv._id,
      invoiceNumber: inv.clientInvoice.invoiceNumber,
      tonnage: inv.tonnageForThisInvoice,
      amount: inv.clientInvoice.amount,
      status: inv.status,
      paymentStatus: inv.paymentStatus,
      createdAt: inv.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: {
        loadId: loadId.toString(),
        totalLoadTonnage,
        tonnageDelivered,
        percentageComplete,
        remaining: totalLoadTonnage - tonnageDelivered,
        isFullyDelivered: tonnageDelivered >= totalLoadTonnage,
        invoiceCount: invoices.length,
        partialInvoices
      }
    })

  } catch (error: any) {
    console.error('Load progress fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch load progress', details: error.message },
      { status: 500 }
    )
  }
}
