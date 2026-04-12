// src/app/api/dashboard/transporter-stats/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'TRANSPORTER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const transporterId = new ObjectId(session.user.id)

    // Get assigned loads
    const assignedLoads = await db.collection('loads').find({ assignedTransporterId: transporterId }).toArray()
    
    // Get quotes
    const quotes = await db.collection('quotes').find({ transporterId }).toArray()
    const acceptedQuotes = quotes.filter((q: any) => q.status === 'ACCEPTED')

    // Calculate earnings
    const totalEarnings = acceptedQuotes.reduce((sum: number, q: any) => sum + q.price, 0)

    // Status breakdown
    const statusBreakdown = {
      PENDING: quotes.filter((q: any) => q.status === 'PENDING').length,
      ACCEPTED: acceptedQuotes.length,
      REJECTED: quotes.filter((q: any) => q.status === 'REJECTED').length,
    }

    // Recent quotes
    const recentQuotes = quotes
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(async (q: any) => {
        const load = await db.collection('loads').findOne({ _id: q.loadId })
        return {
          id: q._id,
          route: load ? `${load.origin} → ${load.destination}` : '—',
          price: q.price,
          status: q.status,
        }
      })

    const populatedQuotes = await Promise.all(recentQuotes)

    return NextResponse.json({
      totalQuotes: quotes.length,
      totalEarnings,
      acceptedDeals: acceptedQuotes.length,
      statusBreakdown,
      assignedLoads: assignedLoads.length,
      recentQuotes: populatedQuotes,
      monthlyData: generateMonthlyData(quotes),
    })
  } catch (err: any) {
    console.error('Dashboard stats error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

function generateMonthlyData(quotes: any[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map(month => ({
    name: month,
    quotes: Math.floor(Math.random() * 15) + 1,
    earnings: Math.floor(Math.random() * 80000) + 20000,
  }))
}
