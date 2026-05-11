// src/app/api/client/loads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req)
if (!user?.id || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()

    const load = await db.collection('loads').findOne({
      _id: new ObjectId(params.id),
      clientId: new ObjectId(user.id),
    })

    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    // Count quotes only — transporter prices are NOT exposed to client
    // Client only sees the final price set by admin (which includes commission)
    const quotesCount = await db.collection('quotes').countDocuments({ loadId: load._id })

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
        quotesCount: quotesCount,
        quotes: [], // Hidden from client — admin reviews quotes internally
      },
    })
  } catch (err: any) {
    console.error('[ClientLoadDetail] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch load' }, { status: 500 })
  }
}