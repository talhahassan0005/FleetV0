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
        // Return the string-matched loads with transporters
        const loadsWithTransporters = await Promise.all(loadsString.map(async load => {
          // Get all quotes for this load
          const quotes = await db
            .collection('quotes')
            .find({ loadId: load._id })
            .toArray()

          // Get transporter details for each quote
          const transporters = await Promise.all(quotes.map(async quote => {
            const transporter = await db
              .collection('users')
              .findOne({ _id: quote.transporterId })
            
            return {
              _id: quote.transporterId.toString(),
              name: transporter?.name || 'Unknown',
              email: transporter?.email || '',
              companyName: transporter?.companyName,
              quoteStatus: quote.status,
              quoteAmount: quote.amount,
            }
          }))

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
            transporters,
            // markup, commission intentionally excluded
          }
        }))

        // Transform to group by transporter
        const transporterMap: { [key: string]: any } = {}

        loadsWithTransporters.forEach(load => {
          load.transporters.forEach((transporter: any) => {
            if (!transporterMap[transporter._id]) {
              transporterMap[transporter._id] = {
                _id: transporter._id,
                name: transporter.name,
                email: transporter.email,
                companyName: transporter.companyName,
                loads: [],
              }
            }
            
            transporterMap[transporter._id].loads.push({
              _id: load._id,
              ref: load.ref,
              origin: load.origin,
              destination: load.destination,
              cargoType: load.cargoType,
              weight: load.weight,
              collectionDate: load.collectionDate,
              finalPrice: load.finalPrice,
              currency: load.currency,
              status: load.status,
              quoteStatus: transporter.quoteStatus,
              quoteAmount: transporter.quoteAmount,
            })
          })
        })

        const transportersGrouped = Object.values(transporterMap)
        
        return NextResponse.json({
          success: true,
          data: transportersGrouped,
        })
      }
    }

    // Format loads with nested transporters for chat modal
    const loadsWithTransporters = await Promise.all(loads.map(async load => {
      // Get all quotes for this load
      const quotes = await db
        .collection('quotes')
        .find({ loadId: load._id })
        .toArray()

      // Get transporter details for each quote
      const transporters = await Promise.all(quotes.map(async quote => {
        const transporter = await db
          .collection('users')
          .findOne({ _id: quote.transporterId })
        
        return {
          _id: quote.transporterId.toString(),
          name: transporter?.name || 'Unknown',
          email: transporter?.email || '',
          companyName: transporter?.companyName,
          quoteStatus: quote.status,
          quoteAmount: quote.amount,
        }
      }))

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
        transporters, // ← nested transporters with quote details
      }
    }))

    // Transform to group by transporter instead of by load
    const transporterMap: { [key: string]: any } = {}

    loadsWithTransporters.forEach(load => {
      load.transporters.forEach((transporter: any) => {
        if (!transporterMap[transporter._id]) {
          transporterMap[transporter._id] = {
            _id: transporter._id,
            name: transporter.name,
            email: transporter.email,
            companyName: transporter.companyName,
            loads: [],
          }
        }
        
        // Add this load with quote status and amount for this transporter
        transporterMap[transporter._id].loads.push({
          _id: load._id,
          ref: load.ref,
          origin: load.origin,
          destination: load.destination,
          cargoType: load.cargoType,
          weight: load.weight,
          collectionDate: load.collectionDate,
          finalPrice: load.finalPrice,
          currency: load.currency,
          status: load.status,
          quoteStatus: transporter.quoteStatus,
          quoteAmount: transporter.quoteAmount,
        })
      })
    })

    const transportersGrouped = Object.values(transporterMap)

    return NextResponse.json({
      success: true,
      data: transportersGrouped, // ← return grouped by transporter
    })
  } catch (err: any) {
    console.error('[ClientLoads] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}
