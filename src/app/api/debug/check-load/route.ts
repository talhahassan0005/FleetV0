import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase()
    
    // Get the load reference from query params
    const ref = req.nextUrl.searchParams.get('ref')
    const id = req.nextUrl.searchParams.get('id')
    
    let load
    if (ref) {
      load = await db.collection('loads').findOne({ ref })
    } else if (id) {
      load = await db.collection('loads').findOne({ _id: new ObjectId(id) })
    }
    
    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      _id: load._id.toString(),
      ref: load.ref,
      origin: load.origin,
      destination: load.destination,
      status: load.status,
      finalPrice: load.finalPrice,
      commission: load.commission || 0,
      currency: load.currency || 'ZAR',
      createdAt: load.createdAt,
      updatedAt: load.updatedAt,
      // All fields for debugging
      allFields: load
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
