// src/app/api/admin/pods/for-invoice-creation/route.ts
/**
 * GET PODs approved by both admin and client, ready for invoice creation
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can view PODs for invoice creation' },
        { status: 403 }
      )
    }

    const db = await getDatabase()

    // Get PODs approved by BOTH admin and client
    const readyPODs = await db.collection('documents').find({
      docType: 'POD',
      adminApprovalStatus: 'APPROVED',
      clientApprovalStatus: 'APPROVED'
    })
    .sort({ createdAt: -1 })
    .toArray()

    console.log('[ForInvoiceCreation] Found', readyPODs.length, 'PODs ready for invoicing')

    // Enrich with load and transporter details
    const enrichedPODs = await Promise.all(
      readyPODs.map(async (pod: any) => {
        const load = await db.collection('loads').findOne({
          _id: pod.loadId
        })

        const transporter = await db.collection('users').findOne({
          _id: pod.userId
        })

        return {
          _id: pod._id.toString(),
          loadRef: load?.ref,
          origin: load?.origin,
          destination: load?.destination,
          transporterName: transporter?.companyName,
          transporterId: transporter?._id.toString(),
          podFileName: pod.originalName,
          podUrl: pod.fileUrl,
          loadId: pod.loadId.toString(),
          amount: load?.finalPrice,
          currency: load?.currency || 'ZAR',
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: enrichedPODs,
      count: enrichedPODs.length,
    })

  } catch (error: any) {
    console.error('[ForInvoiceCreation] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PODs', details: error.message },
      { status: 500 }
    )
  }
}
