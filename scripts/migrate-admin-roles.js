// scripts/migrate-admin-roles.js
require('dotenv').config()
const { MongoClient } = require('mongodb')

async function migrateAdminRoles() {
  const client = new MongoClient(process.env.DATABASE_URL)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    
    // Find all ADMIN users without adminRole
    const admins = await db.collection('users').find({
      role: 'ADMIN',
      adminRole: { $exists: false }
    }).toArray()
    
    console.log(`Found ${admins.length} admin users without adminRole`)
    
    if (admins.length > 0) {
      // Update all existing admins to superadmin
      const result = await db.collection('users').updateMany(
        {
          role: 'ADMIN',
          adminRole: { $exists: false }
        },
        {
          $set: {
            adminRole: 'superadmin',
            updatedAt: new Date()
          }
        }
      )
      
      console.log(`Updated ${result.modifiedCount} admin users to superadmin`)
      
      // List updated users
      const updatedAdmins = await db.collection('users').find({
        role: 'ADMIN',
        adminRole: 'superadmin'
      }).toArray()
      
      console.log('Updated admin users:')
      updatedAdmins.forEach(admin => {
        console.log(`- ${admin.email} (${admin.adminRole})`)
      })
    } else {
      console.log('All admin users already have adminRole set')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await client.close()
    console.log('Database connection closed')
  }
}

migrateAdminRoles()