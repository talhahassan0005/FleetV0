// src/app/api/admin/users/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDatabase } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

import { requirePermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const adminRole = (session.user as any).adminRole
    if (!requirePermission(adminRole, 'users')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await getDatabase()
    const roleParam = req.nextUrl.searchParams.get('role')

    const query: any = { role: { $ne: 'ADMIN' } }
    if (roleParam) {
      query.role = roleParam
    }

    const users = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        _id: u._id.toString(),
        email: u.email,
        companyName: u.companyName,
        role: u.role,
        isVerified: u.isVerified,
        verificationStatus: u.verificationStatus,
        createdAt: u.createdAt,
      })),
    })
  } catch (err: any) {
    console.error('[AdminUsers] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
