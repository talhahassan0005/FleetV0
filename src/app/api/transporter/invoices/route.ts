import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'TRANSPORTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const db = await getDatabase()

  const invoices = await db.collection('invoices').find({
    $or: [
      { transporterId: new mongoose.Types.ObjectId(session.user.id) },
      { transporterId: session.user.id },
    ],
    invoiceType: 'TRANSPORTER_INVOICE',
  })
  .project({
    invoiceNumber: 1,
    loadId: 1,
    paymentStatus: 1,
    amount: 1,
    currency: 1,
    createdAt: 1,
    qbLink: 1,
  })
  .sort({ createdAt: -1 })
  .toArray()

  return NextResponse.json({ success: true, invoices })
}
