// Manually verify user account
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const db = await getDatabase()
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all approved documents for this user
    const approvedDocs = await db.collection('documents').find({
      userId: new ObjectId(userId),
      verificationStatus: 'APPROVED'
    }).toArray()

    const approvedDocTypes = approvedDocs.map((d: any) => d.docType)

    console.log(`[Verify User] User: ${user.email}, Role: ${user.role}`)
    console.log(`[Verify User] Approved docs:`, approvedDocTypes)

    let canVerify = false
    let reason = ''

    // CLIENT verification: needs COMPANY + CUSTOMS
    if (user.role === 'CLIENT') {
      const hasCompany = approvedDocTypes.includes('COMPANY')
      const hasCustoms = approvedDocTypes.includes('CUSTOMS')
      
      if (hasCompany && hasCustoms) {
        canVerify = true
      } else {
        reason = `Missing documents: ${!hasCompany ? 'COMPANY ' : ''}${!hasCustoms ? 'CUSTOMS' : ''}`
      }
    }

    // TRANSPORTER verification: needs COMPANY + REGISTRATION
    if (user.role === 'TRANSPORTER') {
      const hasCompany = approvedDocTypes.includes('COMPANY')
      const hasRegistration = approvedDocTypes.includes('REGISTRATION')
      
      if (hasCompany && hasRegistration) {
        canVerify = true
      } else {
        reason = `Missing documents: ${!hasCompany ? 'COMPANY ' : ''}${!hasRegistration ? 'REGISTRATION' : ''}`
      }
    }

    if (!canVerify) {
      return NextResponse.json({
        success: false,
        message: `Cannot verify: ${reason}`,
        approvedDocs: approvedDocTypes
      }, { status: 400 })
    }

    // Verify the account
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

    console.log(`[Verify User] ✅ Account verified: ${user.email}`)

    return NextResponse.json({
      success: true,
      message: `Account verified successfully`,
      user: {
        email: user.email,
        role: user.role,
        isVerified: true
      }
    })

  } catch (error: any) {
    console.error('[Verify User] Error:', error)
    return NextResponse.json(
      { error: 'Failed to verify user', details: error.message },
      { status: 500 }
    )
  }
}
