// src/app/api/debug/all-loads/route.ts
import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/prisma'

export async function GET() {
  try {
    const db = await getDatabase()
    
    // Get ALL loads regardless of status
    const allLoads = await db.collection('loads').find({}).toArray()
    
    console.log('[DEBUG] Total loads in database:', allLoads.length)
    
    // Get loads grouped by status
    const byStatus: Record<string, number> = {}
    allLoads.forEach((load: any) => {
      byStatus[load.status || 'NO_STATUS'] = (byStatus[load.status || 'NO_STATUS'] || 0) + 1
      console.log('[DEBUG] Load:', {
        _id: load._id.toString(),
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        status: load.status || 'NO_STATUS',
        clientId: load.clientId?.toString?.() || 'NO_CLIENT',
        createdAt: load.createdAt
      })
    })
    
    return NextResponse.json({
      totalLoads: allLoads.length,
      loadsByStatus: byStatus,
      loads: allLoads.map(load => ({
        _id: load._id.toString(),
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        status: load.status || 'NO_STATUS',
        clientId: load.clientId?.toString?.() || null,
        createdAt: load.createdAt
      }))
    })
  } catch (err: any) {
    console.error('[DEBUG] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
