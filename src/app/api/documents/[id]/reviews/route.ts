// src/app/api/documents/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { comment, status } = await req.json()

    if (!comment || !status) {
      return NextResponse.json(
        { error: 'Missing comment or status' },
        { status: 400 }
      )
    }

    if (!params.id || params.id === 'undefined') {
      console.error('Missing or invalid document ID in params:', params.id)
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    let docId: any
    
    // Try to create ObjectId, handle various formats
    try {
      docId = new ObjectId(params.id)
    } catch (err: any) {
      console.error('ObjectId creation error:', err.message, 'ID:', params.id, 'Type:', typeof params.id)
      return NextResponse.json(
        { error: 'Invalid document ID format', details: err.message },
        { status: 400 }
      )
    }
    
    const userId = new ObjectId(session.user.id)

    const doc = await db.collection('documents').findOne({
      _id: docId,
    })

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if user already reviewed this document
    const existingReview = doc.reviews?.find(
      (r: any) => r.reviewerId?.toString() === session.user.id
    )

    if (existingReview) {
      // If already approved or rejected, don't allow changes - idempotent behavior
      if (existingReview.status === 'APPROVED' || existingReview.status === 'REJECTED') {
        return NextResponse.json(
          { 
            error: `Document already ${existingReview.status.toLowerCase()}. Cannot change approval status.`,
            details: `This document was ${existingReview.status.toLowerCase()} on ${existingReview.timestamp}`
          },
          { status: 400 }
        )
      }
      
      // If pending, allow update
      await db.collection('documents').updateOne(
        { _id: docId, 'reviews.reviewerId': userId },
        {
          $set: {
            'reviews.$.status': status,
            'reviews.$.comment': comment,
            'reviews.$.timestamp': new Date(),
          },
        } as any
      )
    } else {
      // Add new review
      await db.collection('documents').updateOne(
        { _id: docId },
        {
          $push: {
            reviews: {
              reviewerId: userId,
              reviewerRole: session.user.role,
              status,
              comment,
              timestamp: new Date(),
            },
          },
        } as any
      )
    }

    const updated = await db.collection('documents').findOne({
      _id: docId,
    })

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('Review error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
