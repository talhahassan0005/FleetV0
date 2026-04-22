// src/app/api/admin/migrate-roles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  return migrateRoles()
}

export async function POST(req: NextRequest) {
  return migrateRoles()
}

async function migrateRoles() {
  try {
    const db = await getDatabase()
    
    // Find all users with old role structure
    const users = await db.collection('users').find({}).toArray()
    
    console.log(`Found ${users.length} users to migrate`)
    
    let migrated = 0
    
    for (const user of users) {
      let newRole = user.role // Default to existing role
      
      // Convert admin users based on adminRole
      if (user.role === 'ADMIN') {
        switch (user.adminRole) {
          case 'superadmin':
          case undefined:
          case null:
            newRole = 'SUPER_ADMIN'
            break
          case 'pod_manager':
            newRole = 'POD_MANAGER'
            break
          case 'operations':
            newRole = 'OPERATIONS_ADMIN'
            break
          case 'finance':
            newRole = 'FINANCE_ADMIN'
            break
          default:
            newRole = 'SUPER_ADMIN' // Default fallback
        }
        
        // Update user with new single role
        await db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { role: newRole },
            $unset: { adminRole: "" } // Remove adminRole field
          }
        )
        
        console.log(`✅ ${user.email}: ${user.role}${user.adminRole ? `(${user.adminRole})` : ''} → ${newRole}`)
        migrated++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration completed! Updated ${migrated} admin users.`,
      totalUsers: users.length,
      migratedUsers: migrated
    })
    
  } catch (error: any) {
    console.error('Migration failed:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    )
  }
}