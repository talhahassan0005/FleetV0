// src/app/api/transporter/my-quotes/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
console.log('[MyQuotes] Session user:', user?.id)
    
    if (!user?.role || user.role !== 'TRANSPORTER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if transporter is verified
    const db = await getDatabase()
    const transporter = await db.collection('users').findOne({
      _id: new ObjectId(user.id),
      role: 'TRANSPORTER'
    })

    if (!transporter) {
      return NextResponse.json(
        { error: 'Transporter not found' },
        { status: 404 }
      )
    }

    if (!transporter.isVerified) {
      return NextResponse.json({
        verified: false,
        message: 'Please verify your account to view your quotes',
        quotes: []
      })
    }

    // Get all quotes for this transporter with related load info
    const quotes = await db.collection('quotes')
      .find({ transporterId: new ObjectId(user.id) })
      .sort({ createdAt: -1 })
      .toArray()

    console.log('[MyQuotes] Found quotes:', quotes.length)

    // Fetch load details for each quote
    const quotesWithLoads = await Promise.all(
      quotes.map(async (quote) => {
        const load = await db.collection('loads').findOne({
          _id: quote.loadId
        })

        console.log('[MyQuotes] Quote:', { 
          quoteId: quote._id.toString(), 
          loadId: quote.loadId.toString(),
          hasLoad: !!load
        })

        return {
          _id: quote._id.toString(),
          loadId: quote.loadId.toString(),
          quotedPrice: quote.price || quote.quotedPrice || 0,
          currency: quote.currency || 'ZAR',
          status: quote.status || 'PENDING',
          createdAt: quote.createdAt || quote.updatedAt || new Date(),
          rejectionReason: quote.rejectionReason || undefined,
          load: load ? {
            _id: load._id.toString(),
            ref: load.ref,
            origin: load.origin,
            destination: load.destination,
            cargoType: load.cargoType,
            weight: load.weight,
            status: load.status,
          } : null
        }
      })
    )

    console.log('[MyQuotes] Returning quotes with loads:', quotesWithLoads.length)

    return NextResponse.json({
      success: true,
      verified: true,
      quotes: quotesWithLoads
    })
  } catch (err: any) {
    console.error('[MyQuotes] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch your quotes' },
      { status: 500 }
    )
  }
}
