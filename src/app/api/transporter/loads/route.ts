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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = await getDatabase()

    const loads = await db
      .collection('loads')
      .find({
        assignedTransporterId: new ObjectId(session.user.id),
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      loads: loads.map(load => ({
        _id: load._id.toString(),
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        cargoType: load.cargoType,
        weight: load.weight,
        collectionDate: load.collectionDate,
        deliveryDate: load.deliveryDate,
        status: load.status,
        assignedTransporterId: load.assignedTransporterId?.toString(),
        createdAt: load.createdAt,
      })),
    })
  } catch (err: any) {
    console.error('[TransporterLoads] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}
