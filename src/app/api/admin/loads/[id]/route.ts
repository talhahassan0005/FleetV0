// src/app/api/admin/loads/[id]/route.ts
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
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const loadId = params.id
    
    // Validate loadId format before creating ObjectId
    if (!loadId || typeof loadId !== 'string' || loadId === 'undefined') {
      console.error('[GetLoad] Invalid load ID:', loadId)
      return NextResponse.json(
        { error: 'Invalid load ID provided' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    let loadObjectId: any
    try {
      loadObjectId = new ObjectId(loadId)
    } catch (err) {
      console.error('[GetLoad] Invalid ObjectId format:', loadId, err)
      return NextResponse.json(
        { error: 'Invalid load ID format' },
        { status: 400 }
      )
    }

    const load = await db.collection('loads').findOne({ _id: loadObjectId })

    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

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
        finalPrice: load.finalPrice,
        commission: load.commission || 0,
        currency: load.currency || 'ZAR',
        status: load.status,
        clientId: load.clientId?.toString(),
        rejectionReason: load.rejectionReason,
        createdAt: load.createdAt,
        updatedAt: load.updatedAt,
      }
    })
  } catch (err: any) {
    console.error('[GetLoad] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch load' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { action, rejectionReason, commission } = body
    const loadId = params.id

    console.log('[AdminLoadAction]', {
      loadId,
      action,
      admin: session.user.email,
    })

    const db = await getDatabase()
    const loadObjectId = new ObjectId(loadId)

    // Handle different actions
    if (action === 'approve') {
      const result = await db.collection('loads').updateOne(
        { _id: loadObjectId },
        {
          $set: {
            status: 'APPROVED',
            approvedAt: new Date(),
            approvedBy: session.user.id,
            updatedAt: new Date(),
          }
        }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      console.log('[AdminLoadAction] Load approved:', loadId)

      return NextResponse.json({
        success: true,
        message: 'Load approved successfully',
      })
    }

    if (action === 'reject') {
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        )
      }

      const result = await db.collection('loads').updateOne(
        { _id: loadObjectId },
        {
          $set: {
            status: 'REJECTED',
            rejectionReason: rejectionReason.trim(),
            rejectedAt: new Date(),
            rejectedBy: session.user.id,
            updatedAt: new Date(),
          }
        }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      console.log('[AdminLoadAction] Load rejected:', loadId, 'Reason:', rejectionReason)

      return NextResponse.json({
        success: true,
        message: 'Load rejected successfully',
      })
    }

    if (action === 'addCommission') {
      if (commission === undefined || commission === null) {
        return NextResponse.json(
          { error: 'Commission amount is required' },
          { status: 400 }
        )
      }

      const commissionAmount = parseFloat(commission)
      if (isNaN(commissionAmount) || commissionAmount <= 0) {
        return NextResponse.json(
          { error: 'Commission must be a positive number' },
          { status: 400 }
        )
      }

      // Get current load to calculate new price
      const load = await db.collection('loads').findOne({ _id: loadObjectId })
      if (!load) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      const currentFinalPrice = load.finalPrice || 0
      const newFinalPrice = currentFinalPrice + commissionAmount

      const result = await db.collection('loads').updateOne(
        { _id: loadObjectId },
        {
          $set: {
            finalPrice: newFinalPrice,
            commission: (load.commission || 0) + commissionAmount,
            commissionAddedAt: new Date(),
            commissionAddedBy: session.user.id,
            updatedAt: new Date(),
          }
        }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      console.log('[AdminLoadAction] Commission added:', {
        loadId,
        amount: commissionAmount,
        newFinalPrice,
      })

      return NextResponse.json({
        success: true,
        message: 'Commission added successfully',
        newFinalPrice,
      })
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('[AdminLoadAction] Error:', err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
