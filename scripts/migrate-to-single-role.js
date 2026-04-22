// scripts/migrate-to-single-role.js
require('dotenv').config({ path: '../.env' })
const { MongoClient } = require('mongodb')

async function migrateToSingleRole() {
  const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL or MONGODB_URI not found')
    process.exit(1)
  }
  
  const client = new MongoClient(dbUrl)
  
  try {
    await client.connect()
    console.log('🔗 Connected to MongoDB')
    
    const db = client.db()
    
    // Find all users with dual role system
    const users = await db.collection('users').find({}).toArray()
    
    console.log(`📊 Found ${users.length} users to migrate`)
    
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
    }
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
  } finally {
    await client.close()
  }
}

migrateToSingleRole()