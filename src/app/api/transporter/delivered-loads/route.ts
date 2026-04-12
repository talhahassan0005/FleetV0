// src/app/api/transporter/delivered-loads/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Load, POD } from '@/lib/models'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== 'TRANSPORTER') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    // Get loads assigned to transporter with DELIVERED status (without POD yet)
    const loads = await Load.find({
      assignedTransporterId: session.user.id,
      status: 'DELIVERED',
    }).sort({ createdAt: -1 })

    // Filter out loads that already have PODs
    const loadIds = loads.map(l => l._id)
    const podsWithLoads = await POD.find({ loadId: { $in: loadIds } }).select('loadId')
    const podsLoadIds = new Set(podsWithLoads.map(p => p.loadId.toString()))

    const deliveredLoads = loads.filter(load => !podsLoadIds.has(load._id.toString()))

    return Response.json({
      success: true,
      loads: deliveredLoads.map(load => ({
        _id: load._id,
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        cargoType: load.cargoType,
        weight: load.weight,
        status: load.status,
        collectionDate: load.collectionDate,
      })),
      count: deliveredLoads.length,
    })
  } catch (error) {
    console.error('[DeliveredLoads] Error:', error)
    return Response.json({ error: 'Failed to fetch delivered loads' }, { status: 500 })
  }
}
