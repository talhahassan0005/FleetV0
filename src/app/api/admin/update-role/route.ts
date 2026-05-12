import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * ADMIN-ONLY: Update admin user role
 * Used for fixing role mismatches
 */
export async function POST(req: NextRequest) {
  try {
    const { email, newRole } = await req.json()

    if (!email || !newRole) {
      return NextResponse.json(
        { error: 'Email and newRole required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    console.log(`[UpdateRole] Updating ${email} to ${newRole}...`)
    
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { role: newRole } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'User not found or role already set' },
        { status: 404 }
      )
    }

    const updated = await db.collection('users').findOne({ email })

    console.log(`[UpdateRole] ✅ Updated ${email}:`, updated?.role)

    return NextResponse.json({
      success: true,
      message: `Updated ${email} role to ${updated?.role}`,
      user: {
        email: updated?.email,
        role: updated?.role,
      }
    })
  } catch (error: any) {
    console.error('[UpdateRole] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
