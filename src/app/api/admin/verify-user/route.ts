// src/app/api/admin/verify-user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const db = await getDatabase()
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log(`[Manual Verification] Checking ${user.role}: ${user.email}`)

    // Get all APPROVED documents for this user (excluding POD and INVOICE)
    const approvedDocs = await db.collection('documents').find({
      userId: new ObjectId(userId),
      verificationStatus: 'APPROVED',
      docType: { $nin: ['POD', 'INVOICE'] }
    }).toArray()

    const approvedDocTypes = approvedDocs.map((d: any) => d.docType)
    console.log(`[Manual Verification] Approved doc types:`, approvedDocTypes)

    let shouldVerify = false
    let missingDocs: string[] = []

    // CLIENT verification: needs COMPANY + AUTHORIZATION + TAX_CLEARANCE
    if (user.role === 'CLIENT') {
      const required = ['COMPANY', 'AUTHORIZATION', 'TAX_CLEARANCE']
      missingDocs = required.filter(type => !approvedDocTypes.includes(type))
      shouldVerify = missingDocs.length === 0
    }

    // TRANSPORTER verification: needs all 6 documents
    if (user.role === 'TRANSPORTER') {
      const required = [
        'COMPANY',
        'BANK_CONFIRMATION', 
        'AUTHORIZATION',
        'INSURANCE',
        'TAX_CLEARANCE',
        'VEHICLE_LIST'
      ]
      missingDocs = required.filter(type => !approvedDocTypes.includes(type))
      shouldVerify = missingDocs.length === 0
    }

    if (shouldVerify) {
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            isVerified: true, 
            verifiedAt: new Date(),
            updatedAt: new Date()
          } 
        }
      )
      console.log(`[Manual Verification] ✅ ${user.role} account verified: ${user.email}`)
      
      return NextResponse.json({
        success: true,
        message: `${user.role} account verified successfully`,
        user: {
          email: user.email,
          role: user.role,
          isVerified: true
        }
      })
    } else {
      console.log(`[Manual Verification] ⚠️ Missing documents:`, missingDocs)
      
      return NextResponse.json({
        success: false,
        message: 'Not all required documents are approved',
        missingDocuments: missingDocs,
        approvedDocuments: approvedDocTypes,
        user: {
          email: user.email,
          role: user.role,
          isVerified: user.isVerified || false
        }
      })
    }
  } catch (err: any) {
    console.error('[Manual Verification] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
