const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/mathew'

async function migrateLoadsClientId() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db('fleetxchange')
    const loadsCollection = db.collection('loads')

    console.log('Starting loads clientId migration...')
    const allLoads = await loadsCollection.find({}).toArray()
    console.log('Found ' + allLoads.length + ' total loads')

    let updated = 0

    for (const load of allLoads) {
      if (typeof load.clientId === 'string' || !load.ref) {
        const objectId = typeof load.clientId === 'string' ? new ObjectId(load.clientId) : load.clientId
        const payload = {}
        if (typeof load.clientId === 'string') payload.clientId = objectId
        if (!load.ref) payload.ref = `LOAD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        
        await loadsCollection.updateOne(
          { _id: load._id },
          { $set: payload }
        )
        console.log(`Updated Load ${load._id}: fixed issues`)
        updated++
      } else if (load.clientId && load.clientId._bsontype === 'ObjectId') {
        console.log('Load ' + load._id + ': Already has ObjectId clientId and ref')
      }
    }

    console.log('\n=== Migration Summary ===')
    console.log('Updated: ' + updated)
    console.log('Total: ' + allLoads.length)
  } catch (err) {
    console.error('Migration failed:', err)
  } finally {
    await client.close()
  }
}
migrateLoadsClientId()
