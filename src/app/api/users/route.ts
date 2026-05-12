// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
if (!user || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER','ADMIN'].includes(user?.role ?? ''))
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const db = await getDatabase()
  const { searchParams } = new URL(req.url)
  const roleParam = searchParams.get('role')

  const filter: any = roleParam ? { role: roleParam } : { role: { $ne: 'ADMIN' } }
  const users = await db.collection('users').find(filter).sort({ createdAt: -1 }).toArray()

  return NextResponse.json(users)
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req)
if (!user || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER','ADMIN'].includes(user?.role ?? ''))
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const db = await getDatabase()
  const { userId, action } = await req.json()

  if (action === 'verify') {
    const userObjectId = new ObjectId(userId)
    await db.collection('users').updateOne(
      { _id: userObjectId },
      { $set: { isVerified: true, updatedAt: new Date() } }
    )
    const user = await db.collection('users').findOne({ _id: userObjectId })
    return NextResponse.json(user)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
