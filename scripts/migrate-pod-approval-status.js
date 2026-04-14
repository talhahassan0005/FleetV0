// scripts/migrate-pod-approval-status.js
/**
 * Migration script to add approval status fields to existing POD documents
 * Run: node scripts/migrate-pod-approval-status.js
 */

const { MongoClient } = require('mongodb')

async function migrate() {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fleetxchange'
  const client = new MongoClient(mongoUrl)

  try {
    await client.connect()
    const db = client.db()
    
    console.log('[Migration] Starting POD approval status migration...')
    
    // Find all PODs without approval status
    const podsToUpdate = await db.collection('documents').find({
      docType: 'POD',
      adminApprovalStatus: { $exists: false }
    }).toArray()
    
    console.log(`[Migration] Found ${podsToUpdate.length} PODs needing update`)
    
    if (podsToUpdate.length > 0) {
      // Update all PODs to have approval status fields
      const result = await db.collection('documents').updateMany(
        {
          docType: 'POD',
          adminApprovalStatus: { $exists: false }
        },
        {
          $set: {
            adminApprovalStatus: 'PENDING_ADMIN',
            clientApprovalStatus: 'PENDING_ADMIN',
            adminApprovedAt: null,
            adminApprovedBy: null,
            adminComments: '',
            clientApprovedAt: null,
            clientApprovedBy: null,
            clientComments: ''
          }
        }
      )
      
      console.log(`[Migration] ✅ Updated ${result.modifiedCount} POD documents`)
    }
    
    // Also update any PODs that were already approved by admin but don't have clientApprovalStatus
    const approvedPodsToUpdate = await db.collection('documents').find({
      docType: 'POD',
      adminApprovalStatus: 'APPROVED',
      clientApprovalStatus: { $exists: false }
    }).toArray()
    
    console.log(`[Migration] Found ${approvedPodsToUpdate.length} approved PODs needing client status`)
    
    if (approvedPodsToUpdate.length > 0) {
      const result2 = await db.collection('documents').updateMany(
        {
          docType: 'POD',
          adminApprovalStatus: 'APPROVED',
          clientApprovalStatus: { $exists: false }
        },
        {
          $set: {
            clientApprovalStatus: 'PENDING_CLIENT',
            clientApprovedAt: null,
            clientApprovedBy: null,
            clientComments: ''
          }
        }
      )
      
      console.log(`[Migration] ✅ Updated ${result2.modifiedCount} approved POD documents`)
    }
    
    console.log('[Migration] ✅ POD approval status migration complete!')
    
  } catch (error) {
    console.error('[Migration] 💥 Error:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

migrate()
