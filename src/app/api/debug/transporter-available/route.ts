// src/app/api/debug/transporter-available/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const transporterId = req.nextUrl.searchParams.get('transporterId')
    
    if (!transporterId) {
      return NextResponse.json({ error: 'transporterId required' }, { status: 400 })
    }

    const db = await getDatabase()
    
    // Get all loads with PENDING, QUOTING, or APPROVED status
    const pendingLoads = await db.collection('loads')
      .find({ status: { $in: ['PENDING', 'QUOTING', 'APPROVED'] } })
      .toArray()
    
    console.log('[DEBUG] Loads with PENDING/QUOTING/APPROVED status:', pendingLoads.length)
    
    // Get quotes from this transporter
    const myQuotes = await db.collection('quotes')
      .find({ transporterId: new ObjectId(transporterId) })
      .toArray()
    
    console.log('[DEBUG] Quotes from transporter:', myQuotes.length)
    
    const quotedLoadIds = myQuotes.map(q => q.loadId?.toString?.() || q.loadId)
    console.log('[DEBUG] Quoted load IDs:', quotedLoadIds)
    
    // Get final available loads
    const availableLoads = await db.collection('loads')
      .find({
        status: { $in: ['PENDING', 'QUOTING', 'APPROVED'] },
        _id: { $nin: quotedLoadIds.map(id => new ObjectId(id)) }
      })
      .toArray()
    
    console.log('[DEBUG] Available loads after excluding quoted:', availableLoads.length)
    
    return NextResponse.json({
      totalLoadsInDB: (await db.collection('loads').countDocuments({})),
      pendingQuotingCount: pendingLoads.length,
      myQuotesCount: myQuotes.length,
      quotedLoadIds: quotedLoadIds,
      availableCount: availableLoads.length,
      availableLoads: availableLoads.map(load => ({
        _id: load._id.toString(),
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        status: load.status,
        clientId: load.clientId?.toString?.() || null
      }))
    })
  } catch (err: any) {
    console.error('[DEBUG] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
