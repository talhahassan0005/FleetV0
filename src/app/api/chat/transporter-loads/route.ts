// src/app/api/chat/transporter-loads/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

/**
 * GET /api/chat/transporter-loads
 * 
 * Returns clients grouped with their loads where this transporter has submitted quotes
 * Format matches client's view (grouped by client instead of individual loads)
 * 
 * Response:
 * {
 *   clients: [
 *     {
 *       _id: string,
 *       name: string,
 *       email: string,
 *       companyName: string,
 *       loads: [
 *         {
 *           _id: string,
 *           ref: string,
 *           origin: string,
 *           destination: string,
 *           status: string,
 *           quoteStatus: 'ACCEPTED' | 'REJECTED' | 'PENDING',
 *           quoteAmount: number,
 *           currency: string
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'TRANSPORTER') {
      console.log('[TransporterLoads] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()

    console.log('[TransporterLoads] Fetching loads for transporter:', session.user.id)

    // Get all quotes from this transporter using MongoDB direct query
    const transporterId = new ObjectId(session.user.id)
    const quotes = await db.collection('quotes')
      .find({ transporterId })
      .toArray()

    console.log('[TransporterLoads] Found quotes:', quotes.length)
    if (quotes.length > 0) {
      console.log('[TransporterLoads] Sample quote:', quotes[0])
    }

    if (quotes.length === 0) {
      console.log('[TransporterLoads] No quotes found, returning empty')
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get all loads for these quotes
    const loadIds = quotes.map((q: any) => q.loadId)
    console.log('[TransporterLoads] Load IDs:', loadIds.length)
    
    const loads = await db.collection('loads')
      .find({ _id: { $in: loadIds } })
      .toArray()

    console.log('[TransporterLoads] Found loads:', loads.length)

    // Get unique client IDs
    const clientIds = [...new Set(loads.map((l: any) => l.clientId.toString()))]
    console.log('[TransporterLoads] Unique clients:', clientIds.length)
    
    const clients = await db.collection('users')
      .find({ _id: { $in: clientIds.map(id => new ObjectId(id)) } })
      .toArray()

    console.log('[TransporterLoads] Found client records:', clients.length)

    // Group loads by client
    const clientMap = new Map()
    
    loads.forEach((load: any) => {
      const clientId = load.clientId.toString()
      const quote = quotes.find((q: any) => q.loadId.toString() === load._id.toString())
      
      const loadData = {
        _id: load._id.toString(),
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        status: load.status,
        quoteStatus: quote?.status || 'PENDING',
        quoteAmount: quote?.price || quote?.quotedPrice || 0,
        currency: load.currency || 'ZAR',
      }

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, [])
      }
      clientMap.get(clientId).push(loadData)
    })

    console.log('[TransporterLoads] Grouped loads by client:', clientMap.size)

    // Build response with clients and their loads
    const clientsWithLoads = clients.map((client: any) => {
      const clientLoads = clientMap.get(client._id.toString()) || []
      
      return {
        _id: client._id.toString(),
        name: client.companyName || client.name || 'Unknown Client',
        email: client.email || '',
        companyName: client.companyName,
        phone: client.phone,
        loads: clientLoads,
      }
    }).filter(client => client.loads.length > 0)

    console.log('[TransporterLoads] Final result:', clientsWithLoads.length, 'clients with loads')

    return NextResponse.json({
      success: true,
      data: clientsWithLoads,
    })
  } catch (err: any) {
    console.error('[TransporterLoads] Error:', err)
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 })
  }
}
