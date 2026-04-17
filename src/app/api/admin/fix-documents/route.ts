// Fix existing documents without verificationStatus
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 })
    }

    const db = await getDatabase()
    
    // Find all documents with reviews but no verificationStatus
    const docsWithoutStatus = await db.collection('documents').find({
      reviews: { $exists: true, $ne: [] },
      verificationStatus: { $exists: false }
    }).toArray()

    console.log(`[Fix Documents] Found ${docsWithoutStatus.length} documents without verificationStatus`)

    let fixed = 0
    let verified = 0

    for (const doc of docsWithoutStatus) {
      // Get the latest review status
      const latestReview = doc.reviews[doc.reviews.length - 1]
      const status = latestReview.status

      // Update document with verificationStatus
      await db.collection('documents').updateOne(
        { _id: doc._id },
        { $set: { verificationStatus: status, updatedAt: new Date() } }
      )

      console.log(`[Fix Documents] Updated doc ${doc._id}: ${doc.docType} -> ${status}`)
      fixed++

      // Check if user should be verified
      if (status === 'APPROVED' && doc.userId) {
        const user = await db.collection('users').findOne({ _id: doc.userId })
        
        if (user && !user.isVerified) {
          // Get all approved documents for this user
          const approvedDocs = await db.collection('documents').find({
            userId: doc.userId,
            verificationStatus: 'APPROVED'
          }).toArray()

          const approvedDocTypes = approvedDocs.map((d: any) => d.docType)

          // CLIENT verification: needs COMPANY + CUSTOMS
          if (user.role === 'CLIENT') {
            const hasCompany = approvedDocTypes.includes('COMPANY')
            const hasCustoms = approvedDocTypes.includes('CUSTOMS')
            
            if (hasCompany && hasCustoms) {
              await db.collection('users').updateOne(
                { _id: doc.userId },
                { 
                  $set: { 
                    isVerified: true, 
                    verifiedAt: new Date(),
                    updatedAt: new Date()
                  } 
                }
              )
              console.log(`[Fix Documents] ✅ CLIENT verified: ${user.email}`)
              verified++
            }
          }

          // TRANSPORTER verification: needs COMPANY + REGISTRATION
          if (user.role === 'TRANSPORTER') {
            const hasCompany = approvedDocTypes.includes('COMPANY')
            const hasRegistration = approvedDocTypes.includes('REGISTRATION')
            
            if (hasCompany && hasRegistration) {
              await db.collection('users').updateOne(
                { _id: doc.userId },
                { 
                  $set: { 
                    isVerified: true, 
                    verifiedAt: new Date(),
                    updatedAt: new Date()
                  } 
                }
              )
              console.log(`[Fix Documents] ✅ TRANSPORTER verified: ${user.email}`)
              verified++
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed} documents, verified ${verified} accounts`,
      fixed,
      verified
    })

  } catch (error: any) {
    console.error('[Fix Documents] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fix documents', details: error.message },
      { status: 500 }
    )
  }
}
