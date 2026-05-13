// src/app/api/transporter/available-loads/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    if (!user?.role || user.role !== 'TRANSPORTER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const db = await getDatabase()

    // Check if transporter exists and is verified
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
        message: 'Please verify your account to view available loads',
        loads: []
      })
    }

    // Get load IDs this transporter has already quoted on
    const myQuotes = await db.collection('quotes')
      .find({ transporterId: new ObjectId(user.id) })
      .project({ loadId: 1 })
      .toArray()

    // Build a clean ObjectId[] with no nulls — fixes TS Filter<Document> type error
    const quotedLoadIds = myQuotes.reduce<ObjectId[]>((acc, q) => {
      try {
        if (q.loadId) acc.push(new ObjectId(q.loadId.toString()))
      } catch {}
      return acc
    }, [])

    const skip = parseInt(req.nextUrl.searchParams.get('skip') || '0', 10)
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10)

    // Typed as Record<string, any> so MongoDB Filter<Document> accepts it
    const loadFilter: Record<string, any> = {
      status: 'APPROVED',
      ...(quotedLoadIds.length > 0 && { _id: { $nin: quotedLoadIds } })
    }

    const total = await db.collection('loads').countDocuments(loadFilter)

    const loads = await db.collection('loads')
      .find(loadFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

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
      })),
      total,
    })
  } catch (err: any) {
    console.error('[AvailableLoads] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch available loads' },
      { status: 500 }
    )
  }
}