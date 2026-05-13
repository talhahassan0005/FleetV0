// src/app/api/transporter/loads/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
if (!user?.id || user.role !== 'TRANSPORTER') {
      console.log('[TransporterLoads] Unauthorized - Missing user or wrong role')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const transporterIdObjectId = new ObjectId(user.id)

    console.log('[TransporterLoads] Fetching quotes for transporter:', user.id)

    // Get all quotes from this transporter
    const quotes = await db
      .collection('quotes')
      .find({ transporterId: transporterIdObjectId })
      .toArray()

    console.log('[TransporterLoads] Found quotes:', quotes.length)

    if (quotes.length === 0) {
      return NextResponse.json({ success: true, data: [], total: 0 })
    }

    const skip = parseInt(req.nextUrl.searchParams.get('skip') || '0', 10)
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10)

    // Get associated loads
    const loadIds = [...new Set(quotes.map(q => q.loadId.toString()))]
    const loadObjectIds = loadIds.map(id => new ObjectId(id))

    const total = await db.collection('loads').countDocuments({
      _id: { $in: loadObjectIds }
    })

    const loads = await db
      .collection('loads')
      .find({ _id: { $in: loadObjectIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
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
        // finalPrice, commission, markup intentionally excluded from transporter view
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
      total,
    })
  } catch (err: any) {
    console.error('[TransporterLoads] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}