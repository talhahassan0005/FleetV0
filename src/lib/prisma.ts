// src/lib/prisma.ts
// Direct MongoDB connection without Prisma
import { MongoClient, Db } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const mongoUri = process.env.DATABASE_URL || process.env.MONGO_URL
  if (!mongoUri) {
    throw new Error('DATABASE_URL or MONGO_URL not set')
  }

  try {
    const client = await MongoClient.connect(mongoUri, {
      maxPoolSize: 5,
      minPoolSize: 1,
    })

    const db = client.db('fleetxchange')

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    throw error
  }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

// Simple wrapper for common operations
export const db = {
  users: async () => (await getDatabase()).collection('users'),
  loads: async () => (await getDatabase()).collection('loads'),
  quotes: async () => (await getDatabase()).collection('quotes'),
  documents: async () => (await getDatabase()).collection('documents'),
  invoices: async () => (await getDatabase()).collection('invoices'),
  pods: async () => (await getDatabase()).collection('pods'),
  partialDeliveries: async () => (await getDatabase()).collection('partial_deliveries'),
  loadUpdates: async () => (await getDatabase()).collection('load_updates'),
  trackingLinks: async () => (await getDatabase()).collection('tracking_links'),
}


