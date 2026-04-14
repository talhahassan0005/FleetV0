// src/app/api/tracking/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/prisma'
import { fetchLiveTracking } from '@/lib/tracking'

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const db = await getDatabase()
  const link = await db.collection('trackingLinks').findOne({ token: params.token })

  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get load details
  const load = await db.collection('loads').findOne({ _id: link.loadId })

  // Auto-expire if delivered
  if (load && load.status === 'DELIVERED' && link.isActive) {
    await db.collection('trackingLinks').updateOne(
      { _id: link._id },
      { $set: { isActive: false, expiredAt: new Date() } }
    )
    return NextResponse.json({ expired: true, load: { ref: load.ref, origin: load.origin, destination: load.destination } })
  }

  if (!link.isActive) {
    return NextResponse.json({ expired: true, load: { ref: load?.ref, origin: load?.origin, destination: load?.destination } })
  }

  // Future: fetch live GPS data from your tracking API
  // const liveData = await fetchLiveTracking(link.externalTrackingId)

  return NextResponse.json({ expired: false, load, liveData: null })
}
