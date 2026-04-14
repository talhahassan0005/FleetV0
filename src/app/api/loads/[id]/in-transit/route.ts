// src/app/api/loads/[id]/in-transit/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'TRANSPORTER') {
      return NextResponse.json(
        { error: 'Only transporters can mark loads as in transit' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    const loadId = new ObjectId(params.id)
    const transporterId = new ObjectId(session.user.id)

    // Get load
    const load = await db.collection('loads').findOne({ _id: loadId })

    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    // Verify transporter is assigned
    if (load.assignedTransporterId?.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not assigned to this load' },
        { status: 403 }
      )
    }

    // Can only change from ASSIGNED to IN_TRANSIT
    if (load.status !== 'ASSIGNED') {
      return NextResponse.json(
        { error: `Cannot mark as in-transit from ${load.status} status` },
        { status: 400 }
      )
    }

    // Update load to IN_TRANSIT
    const result = await db.collection('loads').updateOne(
      { _id: loadId },
      {
        $set: {
          status: 'IN_TRANSIT',
          inTransitAt: new Date(),
          updatedAt: new Date(),
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update load' }, { status: 500 })
    }

    // Create load update log
    await db.collection('loadUpdates').insertOne({
      loadId: loadId,
      userId: transporterId,
      message: 'Load marked as In Transit by transporter',
      createdAt: new Date(),
    })

    console.log('[InTransit] ✅ Load marked IN_TRANSIT:', load.ref)

    return NextResponse.json({
      success: true,
      message: 'Load marked as in transit',
      status: 'IN_TRANSIT',
    })
  } catch (error: any) {
    console.error('[InTransit] Error:', error)
    return NextResponse.json(
      { error: 'Failed to mark load as in transit', details: error.message },
      { status: 500 }
    )
  }
}
