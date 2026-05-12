// src/app/api/dashboard/transporter-stats/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
if (!user || user.role !== 'TRANSPORTER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const transporterId = new ObjectId(user.id)
    
    // Pagination parameters
    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '15', 10)

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
    const sortedQuotes = quotes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const recentQuotesSlice = sortedQuotes.slice(skip, skip + limit)
    
    const recentQuotes = recentQuotesSlice.map(async (q: any) => {
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
      hasMore: (skip + limit) < sortedQuotes.length,
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
