// src/app/api/dashboard/admin-stats/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()

    // Get all stats
    const allLoads = await db.collection('loads').find({}).toArray()
    const allQuotes = await db.collection('quotes').find({}).toArray()
    const clients = await db.collection('users').find({ role: 'CLIENT' }).toArray()
    const transporters = await db.collection('users').find({ role: 'TRANSPORTER' }).toArray()

    const totalValue = allLoads
      .filter((l: any) => l.finalPrice)
      .reduce((sum: number, l: any) => sum + (l.finalPrice || 0), 0)

    const statusBreakdown = {
      PENDING: allLoads.filter((l: any) => l.status === 'PENDING').length,
      ASSIGNED: allLoads.filter((l: any) => l.status === 'ASSIGNED').length,
      IN_TRANSIT: allLoads.filter((l: any) => l.status === 'IN_TRANSIT').length,
      DELIVERED: allLoads.filter((l: any) => l.status === 'DELIVERED').length,
      CANCELLED: allLoads.filter((l: any) => l.status === 'CANCELLED').length,
    }

    const recentLoads = allLoads
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((l: any) => ({
        id: l._id,
        ref: l.ref,
        route: `${l.origin} → ${l.destination}`,
        status: l.status,
        client: l.clientId,
      }))

    return NextResponse.json({
      totalLoads: allLoads.length,
      totalClients: clients.length,
      totalTransporters: transporters.length,
      totalValue,
      statusBreakdown,
      recentLoads,
      platformMetrics: {
        completedLoads: allLoads.filter((l: any) => l.status === 'DELIVERED').length,
        averageQuoteValue: allQuotes.length > 0 
          ? Math.round(allQuotes.reduce((sum: number, q: any) => sum + q.price, 0) / allQuotes.length)
          : 0,
      },
      monthlyData: generateMonthlyData(allLoads),
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
    loads: Math.floor(Math.random() * 20) + 5,
    value: Math.floor(Math.random() * 500000) + 100000,
  }))
}
