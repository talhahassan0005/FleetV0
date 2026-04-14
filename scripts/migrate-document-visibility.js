/**
 * Migration Script: Fix Document Visibility
 * 
 * Problem: Old documents have visibleTo: 'ADMIN' only
 * Solution: Update all documents to include uploader's role
 * 
 * Pattern:
 * - CLIENT uploads → visibleTo: 'CLIENT,ADMIN'
 * - TRANSPORTER uploads → visibleTo: 'TRANSPORTER,ADMIN'
 * - ADMIN uploads → visibleTo: 'ADMIN'
 */

require('dotenv').config({ path: '.env.local' })

const { MongoClient, ObjectId } = require('mongodb')

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/mathew'

async function migrateDocumentVisibility() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('fleetxchange')
    const docsCollection = db.collection('documents')
    
    console.log('Starting document visibility migration...')
    
    // Get all documents
    const allDocs = await docsCollection.find({}).toArray()
    console.log(`Found ${allDocs.length} total documents`)
    
    let updated = 0
    let skipped = 0
    
    for (const doc of allDocs) {
      const uploadedByRole = doc.uploadedByRole || 'UNKNOWN'
      const currentVisibleTo = doc.visibleTo || ''
      
      // Determine what visibility should be
      let expectedVisibleTo = ''
      if (uploadedByRole === 'CLIENT') {
        expectedVisibleTo = 'CLIENT,ADMIN'
      } else if (uploadedByRole === 'TRANSPORTER') {
        expectedVisibleTo = 'TRANSPORTER,ADMIN'
      } else if (uploadedByRole === 'ADMIN') {
        expectedVisibleTo = 'ADMIN'
      } else {
        console.log(`⚠️  Document ${doc._id} has unknown role: ${uploadedByRole}`)
        skipped++
        continue
      }
      
      // Check if already correct
      const visibleToSet = new Set(currentVisibleTo.split(',').filter(v => v))
      const expectedSet = new Set(expectedVisibleTo.split(',').filter(v => v))
      
      const isCorrect = visibleToSet.size === expectedSet.size && 
                        Array.from(visibleToSet).every(v => expectedSet.has(v))
      
      if (isCorrect) {
        console.log(`✓ Doc ${doc._id}: Already correct (${currentVisibleTo})`)
        skipped++
        continue
      }
      
      // Update document
      const updateResult = await docsCollection.updateOne(
        { _id: doc._id },
        { 
          $set: { 
            visibleTo: expectedVisibleTo,
            updatedAt: new Date(),
            migrationNote: `Updated from '${currentVisibleTo}' to '${expectedVisibleTo}'`
          } 
        }
      )
      
      if (updateResult.modifiedCount > 0) {
        console.log(`✓ Updated Doc ${doc._id}: ${currentVisibleTo} → ${expectedVisibleTo}`)
        updated++
      }
    }
    
    console.log('\n=== Migration Summary ===')
    console.log(`✓ Updated: ${updated}`)
    console.log(`✓ Skipped: ${skipped}`)
    console.log(`✓ Total: ${allDocs.length}`)
    
    if (updated > 0) {
      console.log('\n✅ Migration completed successfully!')
      
      // Verify by showing sample after migration
      console.log('\nSample documents after migration:')
      const sampleDocs = await docsCollection.find({}).limit(3).toArray()
      sampleDocs.forEach(doc => {
        console.log(`  - ${doc._id}: uploadedByRole=${doc.uploadedByRole}, visibleTo=${doc.visibleTo}`)
      })
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

migrateDocumentVisibility()
