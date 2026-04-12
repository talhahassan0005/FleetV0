// src/app/api/client/invoices/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const db = await getDatabase()
  const clientId = session.user.id

  // Query invoices where this client is the recipient:
  const invoices = await db.collection('invoices').find({
    $or: [
      { clientId: new mongoose.Types.ObjectId(clientId) },
      { clientId: clientId },
      { userId: new mongoose.Types.ObjectId(clientId) },
      { partyId: new mongoose.Types.ObjectId(clientId) },
    ],
    invoiceType: 'CLIENT_INVOICE',
  })
  .sort({ createdAt: -1 })
  .toArray()

  return NextResponse.json({ success: true, invoices })
}
