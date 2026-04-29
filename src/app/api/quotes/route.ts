// src/app/api/quotes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { sendEmail, quoteReceivedEmail } from '@/lib/email'

const schema = z.object({
  loadId: z.string(),
  price:  z.number().positive(),
  notes:  z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'TRANSPORTER')
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const db = await getDatabase()
    const body = schema.parse(await req.json())
    const loadId = new ObjectId(body.loadId)
    const userId = new ObjectId(session.user.id)

    console.log('[CreateQuote] 📝 Quote submission:', {
      transporter: session.user.email,
      loadId: body.loadId,
      price: body.price
    })

    // Check if transporter has ALREADY quoted on this load (allow only ONE quote per load per transporter)
    const existingQuotes = await db.collection('quotes').find({
      loadId,
      transporterId: userId,
    }).toArray()

    if (existingQuotes.length > 0) {
      console.log('[CreateQuote] ❌ Transporter already has quote on this load:', {
        count: existingQuotes.length,
        quotes: existingQuotes.map(q => ({ 
          id: q._id.toString(), 
          status: q.status, 
          price: q.price 
        }))
      })
      return NextResponse.json(
        { error: 'You have already submitted a quote for this load. One quote per load only.' },
        { status: 400 }
      )
    }

    console.log('[CreateQuote] ✅ No existing quotes found. Proceeding...')

    const load = await db.collection('loads').findOne({ _id: loadId })
    if (!load || !['APPROVED', 'QUOTED'].includes(load.status)) {
      console.log('[CreateQuote] ❌ Load not available:', {
        exists: !!load,
        status: load?.status
      })
      return NextResponse.json({ error: 'Load not available for quoting.' }, { status: 400 })
    }

    console.log('[CreateQuote] 📦 Load found:', { ref: load.ref, status: load.status })

    const result = await db.collection('quotes').insertOne({
      loadId, 
      transporterId: userId, 
      price: body.price, 
      notes: body.notes, 
      status: 'PENDING', 
      createdAt: new Date(), 
      updatedAt: new Date(),
    })

    console.log('[CreateQuote] ✅ Quote created:', result.insertedId.toString())

    // Update load status to QUOTED if this is the first quote
    if (load.status === 'APPROVED') {
      await db.collection('loads').updateOne(
        { _id: loadId },
        { $set: { status: 'QUOTED', updatedAt: new Date() } }
      )
      console.log('[CreateQuote] ✅ Load status updated to QUOTED')
    }

    const user = await db.collection('users').findOne({ _id: userId })
    await db.collection('loadUpdates').insertOne({
      loadId,
      userId,
      message: `Quote submitted by ${user?.companyName}: ${load.currency} ${body.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      createdAt: new Date(),
    })

    // Send email to client notifying them of the new quote
    try {
      const client = await db.collection('users').findOne({ _id: load.clientId })
      if (client && client.email) {
        const emailContent = quoteReceivedEmail(
          client.companyName || 'Client',
          user?.companyName || 'Transporter',
          load.ref,
          body.price,
          load.currency || 'ZAR'
        )
        await sendEmail(
          client.email,
          `📬 New Quote Received: ${load.ref}`,
          emailContent
        )
        console.log('[CreateQuote] ✅ Quote received email sent to client:', client.email)
      }
    } catch (emailErr) {
      console.error('[CreateQuote] ⚠️  Error sending quote email:', emailErr)
      // Don't fail the quote creation if email fails
    }

    return NextResponse.json({ 
      _id: result.insertedId, 
      loadId: body.loadId, 
      transporterId: session.user.id, 
      price: body.price, 
      notes: body.notes,
      message: 'Quote submitted successfully! Client will review and contact you.'
    }, { status: 201 })
  } catch (err: any) {
    console.error('[CreateQuote] 💥 Error:', err)
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'TRANSPORTER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDatabase()
    const loadId = req.nextUrl.searchParams.get('loadId')

    if (!loadId) {
      return NextResponse.json({ error: 'loadId query parameter is required' }, { status: 400 })
    }

    console.log('[CheckQuote] 🔍 Checking if transporter has already quoted:', {
      transporter: session.user.email,
      loadId
    })

    let loadObjectId: ObjectId
    try {
      loadObjectId = new ObjectId(loadId)
    } catch (err) {
      return NextResponse.json({ error: 'Invalid loadId format' }, { status: 400 })
    }

    const existingQuote = await db.collection('quotes').findOne({
      loadId: loadObjectId,
      transporterId: new ObjectId(session.user.id),
    })

    if (existingQuote) {
      console.log('[CheckQuote] ❌ Transporter already has quote:', {
        quoteId: existingQuote._id.toString(),
        status: existingQuote.status,
        price: existingQuote.price
      })
      return NextResponse.json({
        hasQuoted: true,
        quote: {
          _id: existingQuote._id.toString(),
          price: existingQuote.price,
          status: existingQuote.status,
          notes: existingQuote.notes,
          createdAt: existingQuote.createdAt,
        },
        message: 'You have already submitted a quote for this load. One quote per load only.'
      }, { status: 200 })
    }

    console.log('[CheckQuote] ✅ Transporter has not quoted yet')
    return NextResponse.json({
      hasQuoted: false,
      message: 'You can submit a quote for this load.'
    }, { status: 200 })
  } catch (err: any) {
    console.error('[CheckQuote] 💥 Error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
