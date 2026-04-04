import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

/**
 * GET /api/loads - Get all loads with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase()
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    
    const filter: any = {}
    if (status) filter.status = status
    if (clientId) filter.clientId = clientId
    
    const loads = await db.collection('loads').find(filter).sort({ createdAt: -1 }).limit(50).toArray()
    
    return NextResponse.json({ success: true, loads, count: loads.length })
  } catch (err: any) {
    console.error('[GetLoads] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch loads' }, { status: 500 })
  }
}

/**
 * POST /api/loads - Create a new load
 * Required fields: origin, destination, weight, itemType, description, postedPrice, clientId
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[CreateLoad] Request body:', JSON.stringify(body, null, 2))
    
    const { origin, destination, weight, itemType, description, postedPrice, clientId, collectionDate, deliveryDate } = body

    // Check which fields are missing
    const missing: string[] = []
    if (!origin) missing.push('origin')
    if (!destination) missing.push('destination')
    if (weight === undefined || weight === null || weight === '') missing.push('weight')
    if (!itemType) missing.push('itemType')
    if (!description) missing.push('description')
    if (postedPrice === undefined || postedPrice === null || postedPrice === '') missing.push('postedPrice')
    if (!clientId) missing.push('clientId')

    console.log('[CreateLoad] Validation result:', {
      allPresent: missing.length === 0,
      missingFields: missing,
    })

    if (missing.length > 0) {
      console.log('[CreateLoad] Validation failed, missing:', missing.join(', '))
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    // Generate reference number
    const ref = `LOAD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    
    // Convert clientId from string to ObjectId
    let clientObjectId: any
    try {
      clientObjectId = new ObjectId(clientId)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid client ID format' },
        { status: 400 }
      )
    }
    
    const result = await db.collection('loads').insertOne({
      ref,
      origin,
      destination,
      cargoType: itemType,  // Map itemType to cargoType
      weight,
      description,
      finalPrice: postedPrice,  // Map postedPrice to finalPrice
      currency: 'ZAR',
      clientId: clientObjectId,
      status: 'PENDING',
      collectionDate,
      deliveryDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('[CreateLoad] Saved load:', {
      loadId: result.insertedId.toString(),
      ref,
      clientId: clientId,
      clientObjectId: clientObjectId.toString(),
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Load created successfully',
        load: { 
          _id: result.insertedId, 
          ref,
          origin, 
          destination, 
          cargoType: itemType,
          weight, 
          description, 
          finalPrice: postedPrice,
          currency: 'ZAR',
          clientId,
          status: 'PENDING'
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[CreateLoad] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create load' },
      { status: 500 }
    )
  }
}
