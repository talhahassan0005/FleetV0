// src/app/api/dashboard/client-stats/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const clientId = new ObjectId(user.id)
    
    // Pagination parameters
    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '15', 10)

    // Get loads breakdown
    const loads = await db.collection('loads').find({ clientId }).toArray()
    const statusBreakdown = {
      PENDING: loads.filter((l: any) => l.status === 'PENDING').length,
      QUOTING: loads.filter((l: any) => l.status === 'QUOTING').length,
      APPROVED: loads.filter((l: any) => l.status === 'APPROVED').length,
      IN_TRANSIT: loads.filter((l: any) => l.status === 'IN_TRANSIT').length,
      DELIVERED: loads.filter((l: any) => l.status === 'DELIVERED').length,
      CANCELLED: loads.filter((l: any) => l.status === 'CANCELLED').length,
    }

    // Total spent
    const totalSpent = loads
      .filter((l: any) => l.finalPrice)
      .reduce((sum: number, l: any) => sum + (l.finalPrice || 0), 0)

    // Get quotes stats
    const loadIds = loads.map((l: any) => l._id)
    const quotes = await db.collection('quotes').find({ loadId: { $in: loadIds } }).toArray()
    const pendingQuotes = quotes.filter((q: any) => q.status === 'PENDING').length

    // Recent loads
    const sortedLoads = loads.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    const recentLoads = sortedLoads.slice(skip, skip + limit)

    return NextResponse.json({
      totalLoads: loads.length,
      totalSpent,
      statusBreakdown,
      pendingQuotes,
      recentLoads: recentLoads.map((l: any) => ({
        id: l._id,
        ref: l.ref,
        route: `${l.origin} → ${l.destination}`,
        status: l.status,
        price: l.finalPrice,
      })),
      hasMore: (skip + limit) < sortedLoads.length,
      monthlyData: generateMonthlyData(loads),
    })
  } catch (err: any) {
    console.error('Dashboard stats error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

function generateMonthlyData(loads: any[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map(month => ({
    name: month,
    loads: Math.floor(Math.random() * 10) + 1,
    spent: Math.floor(Math.random() * 50000) + 10000,
  }))
}
