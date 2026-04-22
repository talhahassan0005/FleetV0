// src/app/api/admin/registrations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, rejectionReason } = await req.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const userId = new ObjectId(params.id)

    // Update user verification status
    const updatedUser = await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          verificationStatus: status,
          isVerified: status === 'APPROVED',
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update all registration documents for this user
    if (status === 'APPROVED') {
      await db.collection('documents').updateMany(
        {
          userId: userId,
          documentCategory: 'REGISTRATION',
        },
        {
          $set: {
            verificationStatus: 'APPROVED',
            visibleTo: 'CLIENT,TRANSPORTER,ADMIN',
            updatedAt: new Date(),
          },
        }
      )
    } else if (status === 'REJECTED') {
      await db.collection('documents').updateMany(
        {
          userId: userId,
          documentCategory: 'REGISTRATION',
        },
        {
          $set: {
            verificationStatus: 'REJECTED',
            verificationComment: rejectionReason || 'Document rejected',
            updatedAt: new Date(),
          },
        }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (err: any) {
    console.error('Verification update error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
