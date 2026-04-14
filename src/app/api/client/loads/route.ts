// src/app/api/client/loads/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const clientIdString = session.user.id
    const clientIdObjectId = new ObjectId(clientIdString)

    console.log('[GetClientLoads] Query parameters:', {
      sessionUserId: clientIdString,
      sessionUserIdType: typeof clientIdString,
      convertedToObjectId: clientIdObjectId.toString(),
    })

    // Get ALL loads to inspect for debugging
    const allLoads = await db.collection('loads').find({}).toArray()
    console.log('[GetClientLoads] Total loads in DB:', allLoads.length)
    
    // Show first 5 loads with their clientId types
    allLoads.slice(0, 5).forEach((load: any, idx: number) => {
      console.log(`[GetClientLoads] Load ${idx + 1}:`, {
        id: load._id?.toString?.(),
        ref: load.ref,
        clientId: load.clientId,
        clientIdType: typeof load.clientId,
        clientIdIsObjectId: load.clientId && load.clientId._bsontype === 'ObjectId',
        clientIdString: load.clientId?.toString?.(),
        matchesQuery: String(load.clientId) === clientIdString || load.clientId?.toString?.() === clientIdString,
      })
    })

    // Query by ObjectId
    const loads = await db
      .collection('loads')
      .find({
        clientId: clientIdObjectId,
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log('[GetClientLoads] ObjectId query found:', loads.length, 'loads')

    // If no results with ObjectId query, try string query
    if (loads.length === 0) {
      console.log('[GetClientLoads] No matches with ObjectId, trying string query...')
      const loadsString = await db
        .collection('loads')
        .find({
          clientId: clientIdString,
        })
        .sort({ createdAt: -1 })
        .toArray()
      
      console.log('[GetClientLoads] String query found:', loadsString.length, 'loads')
      
      if (loadsString.length > 0) {
        console.log('[GetClientLoads] ⚠️  ISSUE DETECTED: clientId stored as STRING, not ObjectId!')
        // Return the string-matched loads
        return NextResponse.json({
          success: true,
          loads: await Promise.all(loadsString.map(async load => {
            const quotesCount = await db.collection('quotes').countDocuments({ loadId: load._id })
            return {
              _id: load._id.toString(),
              ref: load.ref,
              origin: load.origin,
              destination: load.destination,
              cargoType: load.cargoType,
              weight: load.weight,
              collectionDate: load.collectionDate,
              finalPrice: load.finalPrice,
              currency: load.currency || 'ZAR',
              status: load.status,
              clientId: load.clientId.toString?.() || load.clientId,
              createdAt: load.createdAt,
              quotesCount,
            }
          })),
        })
      }
    }

    return NextResponse.json({
      success: true,
      loads: await Promise.all(loads.map(async load => {
        const quotesCount = await db.collection('quotes').countDocuments({ loadId: load._id })
        return {
          _id: load._id.toString(),
          ref: load.ref,
          origin: load.origin,
          destination: load.destination,
          cargoType: load.cargoType,
          weight: load.weight,
          collectionDate: load.collectionDate,
          finalPrice: load.finalPrice,
          currency: load.currency || 'ZAR',
          status: load.status,
          clientId: load.clientId.toString(),
          createdAt: load.createdAt,
          quotesCount,
        }
      })),
    })
  } catch (err: any) {
    console.error('[ClientLoads] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}
