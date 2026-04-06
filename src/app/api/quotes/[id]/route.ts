// src/app/api/quotes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const { status } = await req.json()

    const quoteId = new ObjectId(params.id)
    const quote = await db.collection('quotes').findOne({ _id: quoteId })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Get load info for authorization  
    const load = await db.collection('loads').findOne({ _id: quote.loadId })
    
    // Verify authorization
    if (session.user.role === 'CLIENT' && load?.clientId?.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.collection('quotes').updateOne(
      { _id: quoteId },
      { $set: { status, updatedAt: new Date() } }
    )

    const updatedQuote = await db.collection('quotes').findOne({ _id: quoteId })

    return NextResponse.json({ success: true, data: updatedQuote })
  } catch (err: any) {
    console.error('Quote update error:', err)
    return NextResponse.json({ error: 'Failed to update quote' }, { status:400 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACCEPTED or REJECTED' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const quoteId = new ObjectId(params.id)
    const userId = new ObjectId(session.user.id)

    // Get the quote
    const quote = await db.collection('quotes').findOne({ _id: quoteId })
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Get the load to verify authorization
    const load = await db.collection('loads').findOne({ _id: quote.loadId })
    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    // Only the load owner (client) can update quote status
    if (load.clientId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'Only the load owner can update quote status' },
        { status: 403 }
      )
    }

    // Update quote status
    const result = await db.collection('quotes').updateOne(
      { _id: quoteId },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
    }

    // If quote is accepted, reject all other quotes for this load
    if (status === 'ACCEPTED') {
      await db.collection('quotes').updateMany(
        { loadId: quote.loadId, _id: { $ne: quoteId }, status: 'PENDING' },
        { $set: { status: 'AUTO_REJECTED', updatedAt: new Date() } }
      )

      // Update load status to ASSIGNED
      await db.collection('loads').updateOne(
        { _id: quote.loadId },
        {
          $set: {
            status: 'ASSIGNED',
            assignedTransporterId: quote.transporterId,
            updatedAt: new Date()
          }
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Quote ${status === 'ACCEPTED' ? 'accepted' : 'rejected'} successfully`,
      quote: { _id: quoteId.toString(), status }
    })
  } catch (err: any) {
    console.error('[PatchQuote] Error:', err)
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    )
  }
}
