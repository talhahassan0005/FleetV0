// src/app/api/admin/loads/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDatabase } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const adminRole = (session.user as any).adminRole
    if (!hasPermission(adminRole, 'loads')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await getDatabase()
    const statusParam = req.nextUrl.searchParams.get('status')

    const query: any = {}
    if (statusParam) {
      query.status = statusParam
    }

    const loads = await db.collection('loads')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      loads: loads.map(load => ({
        _id: load._id.toString(),
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        status: load.status,
        cargoType: load.cargoType,
        finalPrice: load.finalPrice,
        currency: load.currency || 'ZAR',
        clientId: load.clientId?.toString(),
        createdAt: load.createdAt,
      })),
    })
  } catch (err: any) {
    console.error('[AdminLoads] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}
