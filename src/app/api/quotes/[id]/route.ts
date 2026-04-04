// src/app/api/quotes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const { status } = await req.json()

    const quoteId = new ObjectId(params.id)
    const quote = await db.collection('quotes').findOne({ _id: quoteId })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Get load info for authorization  
    const load = await db.collection('loads').findOne({ _id: quote.loadId })
    
    // Verify authorization
    if (session.user.role === 'CLIENT' && load?.clientId?.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.collection('quotes').updateOne(
      { _id: quoteId },
      { $set: { status, updatedAt: new Date() } }
    )

    const updatedQuote = await db.collection('quotes').findOne({ _id: quoteId })

    return NextResponse.json({ success: true, data: updatedQuote })
  } catch (err: any) {
    console.error('Quote update error:', err)
    return NextResponse.json({ error: 'Failed to update quote' }, { status:400 })
  }
}
