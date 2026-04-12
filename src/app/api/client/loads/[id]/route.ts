// src/app/api/client/loads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()

    const load = await db.collection('loads').findOne({
      _id: new ObjectId(params.id),
      clientId: new ObjectId(session.user.id),
    })

    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    // Fetch quotes for this load
    const quotes = await db.collection('quotes').find({ loadId: load._id }).toArray()
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
          createdAt: quote.createdAt,
        }
      })
    )

    return NextResponse.json({
      success: true,
      load: {
        _id: load._id.toString(),
        ref: load.ref,
        origin: load.origin,
        destination: load.destination,
        cargoType: load.cargoType,
        weight: load.weight,
        description: load.description,
        collectionDate: load.collectionDate,
        deliveryDate: load.deliveryDate,
        status: load.status,
        finalPrice: load.finalPrice,
        currency: load.currency || 'ZAR',
        clientId: load.clientId.toString(),
        createdAt: load.createdAt,
        quotesCount: quotes.length,
        quotes: quotesWithTransporterInfo,
      },
    })
  } catch (err: any) {
    console.error('[ClientLoadDetail] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch load' }, { status: 500 })
  }
}
