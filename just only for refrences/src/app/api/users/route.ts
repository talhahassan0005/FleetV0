// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')

  const users = await prisma.user.findMany({
    where: {
      role: role ? { equals: role as any } : { not: 'ADMIN' },
    },
    include: { documents: { where: { loadId: null } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { userId, action } = await req.json()

  if (action === 'verify') {
    const user = await prisma.user.update({
      where: { id: userId },
      data:  { isVerified: true },
    })
    return NextResponse.json(user)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
