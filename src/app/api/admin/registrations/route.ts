// src/app/api/admin/registrations/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('[GetPendingVerifications] Session:', { 
      hasSession: !!session, 
      role: session?.user?.role 
    })

    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()

    // Get all users with pending verification (not yet verified)
    const pendingUsers = await db.collection('users').find({
      isVerified: { $ne: true } // Not yet verified
    }).toArray()

    console.log('[GetPendingVerifications] Found users:', pendingUsers.length)

    // Get registration documents for each user
    const usersWithDocs = await Promise.all(
      pendingUsers.map(async (user: any) => {
        // Get all documents uploaded by the user during registration process
        const documents = await db.collection('documents').find({
          userId: user._id,
          uploadedByRole: user.role // Documents uploaded by user
          // Removed restrictive docType filter to show all uploaded documents
        }).toArray()

        console.log(`[GetPendingVerifications] User ${user.email} has ${documents.length} documents`)

        return {
          id: user._id.toString(),
          _id: user._id.toString(),
          email: user.email,
          companyName: user.companyName || '',
          contactName: user.contactName || '',
          phone: user.phone || '',
          role: user.role,
          createdAt: user.createdAt,
          isVerified: user.isVerified || false,
          documents: documents.map(doc => ({
            id: doc._id.toString(),
            _id: doc._id.toString(),
            docType: doc.docType,
            originalName: doc.originalName,
            fileUrl: doc.fileUrl,
            verificationStatus: doc.verificationStatus || 'PENDING',
            verificationComment: doc.verificationComment || '',
            uploadedAt: doc.uploadedAt || doc.createdAt
          }))
        }
      })
    )

    console.log('[GetPendingVerifications] Returning', usersWithDocs.length, 'users with documents')

    return NextResponse.json({
      success: true,
      data: usersWithDocs,
    })
  } catch (err: any) {
    console.error('[GetPendingVerifications] Error:', err)
    return NextResponse.json(
      { error: 'Server error', message: err.message }, 
      { status: 500 }
    )
  }
}
