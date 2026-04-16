// scripts/fix-broken-documents.js
/**
 * Script to identify and optionally delete broken document entries
 * that have LOCAL paths but no actual files on disk
 */

require('dotenv').config({ path: '.env.local' })

const { MongoClient, ObjectId } = require('mongodb')
const fs = require('fs')
const path = require('path')

const MONGO_URL = process.env.MONGO_URL || process.env.DATABASE_URL

if (!MONGO_URL) {
  console.error('❌ Error: MONGO_URL or DATABASE_URL not found in environment variables')
  console.error('Make sure .env.local file exists with database connection string')
  process.exit(1)
}

async function main() {
  console.log('🔍 Connecting to MongoDB...')
  const client = await MongoClient.connect(MONGO_URL)
  
  // Get database name from connection string or use default
  const dbName = new URL(MONGO_URL).pathname.substring(1).split('?')[0] || 'test'
  console.log('📂 Using database:', dbName)
  
  const db = client.db(dbName)

  console.log('📋 Fetching all documents...')
  const documents = await db.collection('documents').find({}).toArray()
  
  console.log(`Found ${documents.length} documents total\n`)

  const brokenDocs = []
  const validDocs = []

  for (const doc of documents) {
    const docInfo = {
      _id: doc._id.toString(),
      originalName: doc.originalName,
      docType: doc.docType,
      filename: doc.filename,
      fileUrl: doc.fileUrl,
      uploadedByRole: doc.uploadedByRole,
      createdAt: doc.createdAt
    }

    // Check if it's a LOCAL file
    if (doc.filename && doc.filename.startsWith('LOCAL:')) {
      const localPath = doc.filename.substring(6)
      const fullPath = path.join(process.cwd(), 'uploads', localPath)
      
      if (!fs.existsSync(fullPath)) {
        console.log('❌ BROKEN:', docInfo.originalName)
        console.log('   Path:', fullPath)
        console.log('   Does not exist on disk\n')
        brokenDocs.push(docInfo)
      } else {
        validDocs.push(docInfo)
      }
    }
    // Check if fileUrl contains LOCAL but file doesn't exist
    else if (doc.fileUrl && doc.fileUrl.includes('LOCAL:')) {
      const localMatch = doc.fileUrl.match(/LOCAL:(.+)$/)
      if (localMatch) {
        const localPath = localMatch[1]
        const fullPath = path.join(process.cwd(), 'uploads', localPath)
        
        if (!fs.existsSync(fullPath)) {
          console.log('❌ BROKEN (old format):', docInfo.originalName)
          console.log('   FileUrl:', doc.fileUrl)
          console.log('   Path:', fullPath)
          console.log('   Does not exist on disk\n')
          brokenDocs.push(docInfo)
        } else {
          validDocs.push(docInfo)
        }
      }
    }
    // Check if it's a Cloudinary URL
    else if (doc.fileUrl && doc.fileUrl.startsWith('http')) {
      validDocs.push(docInfo)
    }
    // Check if it has base64 data
    else if (doc.fileData) {
      validDocs.push(docInfo)
    }
    // Otherwise it might be broken
    else {
      console.log('⚠️  SUSPICIOUS:', docInfo.originalName)
      console.log('   No valid file source found\n')
      brokenDocs.push(docInfo)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Valid documents: ${validDocs.length}`)
  console.log(`❌ Broken documents: ${brokenDocs.length}`)
  console.log('='.repeat(60) + '\n')

  if (brokenDocs.length > 0) {
    console.log('🗑️  BROKEN DOCUMENTS TO DELETE:\n')
    brokenDocs.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.originalName}`)
      console.log(`   ID: ${doc._id}`)
      console.log(`   Type: ${doc.docType}`)
      console.log(`   Uploaded by: ${doc.uploadedByRole}`)
      console.log(`   Date: ${new Date(doc.createdAt).toLocaleDateString()}`)
      console.log('')
    })

    console.log('\n⚠️  To DELETE these broken documents, run:')
    console.log('   node scripts/fix-broken-documents.js --delete\n')
  }

  // Check if --delete flag is provided
  if (process.argv.includes('--delete')) {
    console.log('🗑️  DELETING broken documents...\n')
    
    for (const doc of brokenDocs) {
      console.log(`Deleting: ${doc.originalName} (${doc._id})`)
      await db.collection('documents').deleteOne({ _id: new ObjectId(doc._id) })
    }
    
    console.log(`\n✅ Deleted ${brokenDocs.length} broken documents`)
  }

  await client.close()
  console.log('\n✅ Done!')
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
