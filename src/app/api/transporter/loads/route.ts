// src/app/api/transporter/loads/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'TRANSPORTER') {
      console.log('[TransporterLoads] Unauthorized - Missing user or wrong role')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const transporterIdObjectId = new ObjectId(session.user.id)

    console.log('[TransporterLoads] Fetching quotes for transporter:', session.user.id)

    // Get all quotes from this transporter
    const quotes = await db
      .collection('quotes')
      .find({ transporterId: transporterIdObjectId })
      .toArray()

    console.log('[TransporterLoads] Found quotes:', quotes.length)

    if (quotes.length === 0) {
      console.log('[TransporterLoads] No quotes found, returning empty array')
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get associated loads
    const loadIds = [...new Set(quotes.map(q => q.loadId.toString()))]
    console.log('[TransporterLoads] Fetching loads with IDs:', loadIds)
    
    const loads = await db
      .collection('loads')
      .find({
        _id: { $in: loadIds.map(id => new ObjectId(id)) }
      })
      .toArray()

    console.log('[TransporterLoads] Found loads:', loads.length)

    // Build response with client info for each load
    const loadsWithClient = await Promise.all(loads.map(async load => {
      // Get this transporter's quote for this load
      const quote = quotes.find(q => q.loadId.toString() === load._id.toString())

      // Get client details
      const client = await db
        .collection('users')
        .findOne({ _id: load.clientId })

      return {
        _id: load._id.toString(),
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        cargoType: load.cargoType,
        weight: load.weight,
        collectionDate: load.collectionDate,
        deliveryDate: load.deliveryDate,
        status: load.status,
        quoteStatus: quote?.status,
        quoteAmount: quote?.amount,
        client: {
          _id: client?._id.toString(),
          name: client?.name || 'Unknown Client',
          email: client?.email || '',
          companyName: client?.companyName,
        },
        createdAt: load.createdAt,
      }
    }))

    console.log('[TransporterLoads] Returning success with', loadsWithClient.length, 'loads')
    
    return NextResponse.json({
      success: true,
      data: loadsWithClient,
    })
  } catch (err: any) {
    console.error('[TransporterLoads] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}
