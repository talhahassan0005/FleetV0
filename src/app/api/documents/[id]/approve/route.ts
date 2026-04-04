// src/app/api/documents/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { approved, visibleTo } = await req.json()

    const db = await getDatabase()

    const result = await db.collection('documents').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          visibleTo: approved ? visibleTo || 'CLIENT,TRANSPORTER' : 'ADMIN',
          approved: approved || false,
        },
      },
      { returnDocument: 'after' }
    )

    const document = (result as any).value || result
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: approved ? 'Document approved' : 'Document rejected',
      data: document,
    })
  } catch (err: any) {
    console.error('Approve document error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
