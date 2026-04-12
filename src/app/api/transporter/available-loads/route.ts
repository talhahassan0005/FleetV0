// src/app/api/transporter/available-loads/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('[AvailableLoads] Session user:', session?.user?.id)
    
    if (!session?.user?.role || session.user.role !== 'TRANSPORTER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if transporter is verified
    const db = await getDatabase()
    const transporter = await db.collection('users').findOne({
      _id: new ObjectId(session.user.id),
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
        message: 'Please verify your account to view available loads',
        loads: []
      })
    }

    // Get all loads first to debug
    const allLoads = await db.collection('loads').find({}).toArray()
    console.log('[AvailableLoads] Total loads in database:', allLoads.length)
    allLoads.forEach((load: any) => {
      console.log('[AvailableLoads] Load:', { 
        _id: load._id.toString(), 
        ref: load.ref, 
        status: load.status,
        clientId: load.clientId?.toString?.() || load.clientId
      })
    })

    // Get loads that are PENDING or QUOTING status
    const pendingLoads = await db.collection('loads')
      .find({ status: { $in: ['PENDING', 'QUOTING'] } })
      .toArray()
    console.log('[AvailableLoads] Pending/Quoting loads:', pendingLoads.length)

    // Get quotes from this transporter
    const myQuotes = await db.collection('quotes')
      .find({ transporterId: new ObjectId(session.user.id) })
      .project({ loadId: 1 })
      .toArray()
    console.log('[AvailableLoads] My quotes count:', myQuotes.length)
    
    const quotedLoadIds = myQuotes.map(q => q.loadId?.toString?.() || q.loadId)
    console.log('[AvailableLoads] Quoted load IDs:', quotedLoadIds)

    // Get final available loads
    const loads = await db.collection('loads')
      .find({
        status: { $in: ['PENDING', 'QUOTING', 'APPROVED'] }, // Include APPROVED by admin
        _id: { $nin: quotedLoadIds.map(id => new ObjectId(id)) }
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log('[AvailableLoads] Available loads after filter:', loads.length)

    return NextResponse.json({
      success: true,
      verified: true,
      loads: loads.map(load => ({
        _id: load._id.toString(),
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        cargoType: load.cargoType,
        weight: load.weight,
        description: load.description,
        status: load.status,
        createdAt: load.createdAt,
      }))
    })
  } catch (err: any) {
    console.error('[AvailableLoads] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch available loads' },
      { status: 500 }
    )
  }
}
