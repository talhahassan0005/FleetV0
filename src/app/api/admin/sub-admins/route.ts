// src/app/api/admin/sub-admins/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Only superadmin can manage sub-admins
function isSuperAdmin(session: any) {
  return session?.user?.role === 'ADMIN' && (!session.user.adminRole || session.user.adminRole === 'superadmin')
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = await getDatabase()
  const admins = await db.collection('users')
    .find({ role: 'ADMIN' })
    .project({ password: 0 })
    .sort({ createdAt: -1 })
    .toArray()

  return NextResponse.json({
    success: true,
    admins: admins.map(a => ({
      _id: a._id.toString(),
      email: a.email,
      companyName: a.companyName,
      adminRole: a.adminRole || 'superadmin',
      createdAt: a.createdAt,
    }))
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, password, companyName, adminRole } = await req.json()

  const validRoles = ['superadmin', 'pod_manager', 'operations', 'finance']
  if (!email || !password || !adminRole || !validRoles.includes(adminRole)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const db = await getDatabase()
  const existing = await db.collection('users').findOne({ email: email.toLowerCase() })
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const result = await db.collection('users').insertOne({
    email: email.toLowerCase(),
    password: hashed,
    companyName: companyName || email,
    role: 'ADMIN',
    adminRole,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return NextResponse.json({ success: true, id: result.insertedId.toString() }, { status: 201 })
}
