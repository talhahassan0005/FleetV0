// src/app/api/tracking/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchLiveTracking } from '@/lib/tracking'

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const link = await prisma.trackingLink.findUnique({
    where: { token: params.token },
    include: {
      load: {
        include: {
          updates:             { orderBy: { createdAt: 'asc' } },
          assignedTransporter: { select: { companyName: true, phone: true } },
        },
      },
    },
  })

  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Auto-expire if delivered
  if (link.load.status === 'DELIVERED' && link.isActive) {
    await prisma.trackingLink.update({
      where: { id: link.id },
      data:  { isActive: false, expiredAt: new Date() },
    })
    return NextResponse.json({ expired: true, load: { ref: link.load.ref, origin: link.load.origin, destination: link.load.destination } })
  }

  if (!link.isActive) {
    return NextResponse.json({ expired: true, load: { ref: link.load.ref, origin: link.load.origin, destination: link.load.destination } })
  }

  // Future: fetch live GPS data from your tracking API
  // const liveData = await fetchLiveTracking(link.externalTrackingId)

  return NextResponse.json({ expired: false, load: link.load, liveData: null })
}
