// src/app/api/chat/conversations/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()

    // Get users based on role (clients talk to transporters and vice versa)
    const targetRole =
      session.user.role === 'CLIENT'
        ? 'TRANSPORTER'
        : session.user.role === 'TRANSPORTER'
          ? 'CLIENT'
          : undefined

    const userId = new ObjectId(session.user.id)
    const users = await db.collection('users').find({
      _id: { $ne: userId },
      role: targetRole,
    }).project({
      _id: 1,
      companyName: 1,
      email: 1,
      phone: 1,
      role: 1,
    }).sort({ companyName: 1 }).toArray()

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (err: any) {
    console.error('Conversations fetch error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
