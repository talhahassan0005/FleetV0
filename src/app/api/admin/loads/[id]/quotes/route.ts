// src/app/api/admin/loads/[id]/quotes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const loadId = params.id
    const db = await getDatabase()
    
    const loadObjectId = new ObjectId(loadId)
    
    // Fetch quotes for this load
    const quotes = await db.collection('quotes').find({ loadId: loadObjectId }).toArray()
    
    const quotesWithTransporterInfo = await Promise.all(
      quotes.map(async (quote) => {
        const transporter = await db.collection('users').findOne({ _id: quote.transporterId })
        return {
          _id: quote._id.toString(),
          transporterId: quote.transporterId.toString(),
          transporterName: transporter?.companyName || 'Unknown',
          price: quote.price,
          currency: quote.currency || 'ZAR',
          notes: quote.notes,
          status: quote.status,
          rejectionReason: quote.rejectionReason,
          createdAt: quote.createdAt,
        }
      })
    )

    return NextResponse.json({
      success: true,
      quotes: quotesWithTransporterInfo,
    })
  } catch (err: any) {
    console.error('[AdminLoadQuotes] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
