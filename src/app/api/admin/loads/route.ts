// src/app/api/admin/loads/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
if (!user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER','ADMIN'].includes(user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const adminRole = (user as any).adminRole
    if (!hasPermission(adminRole, 'loads')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await getDatabase()
    const statusParam = req.nextUrl.searchParams.get('status')
    const skip = parseInt(req.nextUrl.searchParams.get('skip') || '0', 10)
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10)

    const query: any = {}
    if (statusParam) {
      query.status = statusParam
    }

    // Get total count
    const total = await db.collection('loads').countDocuments(query)

    const loads = await db.collection('loads')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
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
        commission: load.commission,
      })),
      total,
    })
  } catch (err: any) {
    console.error('[AdminLoads] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}
