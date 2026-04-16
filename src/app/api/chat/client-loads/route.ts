// src/app/api/chat/client-loads/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Load, Quote, User } from '@/lib/models'
import { ObjectId } from 'mongodb'

/**
 * GET /api/chat/client-loads
 * 
 * Returns all loads for the current client with all transporters who quoted
 * regardless of quote status (ACCEPTED, REJECTED, PENDING all included)
 * 
 * Response:
 * {
 *   loads: [
 *     {
 *       _id: string,
 *       ref: string,
 *       origin: string,
 *       destination: string,
 *       status: string,
 *       transporters: [
 *         {
 *           _id: string,
 *           name: string,
 *           email: string,
 *           quoteId: string,
 *           quoteStatus: 'ACCEPTED' | 'REJECTED' | 'PENDING',
 *           quoteAmount: number
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Get all loads for this client
    const clientId = new ObjectId(session.user.id)
    const loads = await Load.find({ clientId })
      .select('_id ref origin destination status createdAt')
      .sort({ createdAt: -1 })
      .lean()

    if (loads.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // For each load, find all quotes and transporter details
    const loadIds = loads.map((l: any) => l._id)
    const quotes = await Quote.find({ loadId: { $in: loadIds } })
      .select('_id loadId transporterId price status')
      .lean()

    // Get all transporter details
    const transporterIds = quotes.map((q: any) => q.transporterId)
    const transporters = await User.find({ _id: { $in: transporterIds } })
      .select('_id companyName email phone')
      .lean()

    const transporterMap = new Map(transporters.map((t: any) => [t._id.toString(), t]))

    // Build response with loads and their transporters
    const loadsWithTransporters = loads.map((load: any) => {
      const loadQuotes = quotes.filter((q: any) => q.loadId.toString() === load._id.toString())
      
      return {
        _id: load._id,
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        status: load.status,
        transporters: loadQuotes.map((quote: any) => {
          const transporter = transporterMap.get(quote.transporterId.toString())
          return {
            _id: quote.transporterId,
            name: transporter?.companyName || 'Unknown',
            email: transporter?.email || '',
            quoteId: quote._id,
            quoteStatus: quote.status,
            quoteAmount: quote.price,
          }
        }),
      }
    })

    // Filter to only loads with at least one quote
    const loadsWithQuotes = loadsWithTransporters.filter((l: any) => l.transporters.length > 0)

    return NextResponse.json({
      success: true,
      data: loadsWithQuotes,
    })
  } catch (err: any) {
    console.error('Client loads fetch error:', err)
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 })
  }
}
