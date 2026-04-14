import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, loadPostedEmail } from '@/lib/email'

/**
 * GET /api/loads - Get all loads with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase()
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    
    const filter: any = {}
    if (status) filter.status = status
    if (clientId) filter.clientId = clientId
    
    const loads = await db.collection('loads').find(filter).sort({ createdAt: -1 }).limit(50).toArray()
    
    return NextResponse.json({ success: true, loads, count: loads.length })
  } catch (err: any) {
    console.error('[GetLoads] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch loads' }, { status: 500 })
  }
}

/**
 * POST /api/loads - Create a new load
 * Required fields: origin, destination, weight, itemType, description, postedPrice, clientId
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Check user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      )
    }

    // 2. Check user is verified (either CLIENT or TRANSPORTER)
    if (!session.user.isVerified) {
      return NextResponse.json(
        { 
          error: 'Account not verified - Please complete account verification before posting loads',
          code: 'ACCOUNT_NOT_VERIFIED'
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    console.log('[CreateLoad] Request body:', JSON.stringify(body, null, 2))
    
    const { origin, destination, weight, itemType, description, postedPrice, clientId, collectionDate, deliveryDate, currency, country } = body

    // Check which fields are missing
    const missing: string[] = []
    if (!origin) missing.push('origin')
    if (!destination) missing.push('destination')
    if (weight === undefined || weight === null || weight === '') missing.push('weight')
    if (!itemType) missing.push('itemType')
    if (!description) missing.push('description')
    if (postedPrice === undefined || postedPrice === null || postedPrice === '') missing.push('postedPrice')
    if (!clientId) missing.push('clientId')
    if (!currency) missing.push('currency')
    if (!country) missing.push('country')

    console.log('[CreateLoad] Validation result:', {
      allPresent: missing.length === 0,
      missingFields: missing,
    })

    if (missing.length > 0) {
      console.log('[CreateLoad] Validation failed, missing:', missing.join(', '))
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    // Generate reference number
    const ref = `LOAD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    
    // Convert clientId from string to ObjectId
    let clientObjectId: any
    try {
      clientObjectId = new ObjectId(clientId)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid client ID format' },
        { status: 400 }
      )
    }
    
    const result = await db.collection('loads').insertOne({
      ref,
      origin,
      destination,
      cargoType: itemType,  // Map itemType to cargoType
      weight,
      description,
      finalPrice: postedPrice,  // Map postedPrice to finalPrice
      currency: currency || 'ZAR',  // Use client-selected currency
      country: country || 'ZA',     // Use client-selected country
      clientId: clientObjectId,
      status: 'PENDING',
      collectionDate,
      deliveryDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('[CreateLoad] Saved load:', {
      loadId: result.insertedId.toString(),
      ref,
      clientId: clientId,
      clientObjectId: clientObjectId.toString(),
    })

    // Send email notification to all verified transporters
    try {
      console.log('[CreateLoad] 🔍 Starting transporter email send...')
      const transporters = await db.collection('users').find({ role: 'TRANSPORTER', isVerified: true }).toArray()
      console.log(`[CreateLoad] 📊 Found ${transporters.length} verified transporters in database`)
      
      if (transporters.length === 0) {
        console.warn('[CreateLoad] ⚠️  NO VERIFIED TRANSPORTERS FOUND IN DATABASE!')
      }
      
      let emailsSent = 0
      let emailsFailed = 0
      
      for (const transporter of transporters) {
        try {
          console.log(`[CreateLoad] 👤 Processing transporter: ${transporter.companyName} (ID: ${transporter._id})`)
          
          if (!transporter.email) {
            console.warn(`[CreateLoad] ❌ Transporter has NO EMAIL: ${transporter.companyName}`)
            emailsFailed++
            continue
          }
          
          console.log(`[CreateLoad] 📧 Preparing email for: ${transporter.email}`)
          const emailContent = loadPostedEmail(
            transporter.companyName || 'Transporter',
            ref,
            origin,
            destination,
            postedPrice,
            currency || 'ZAR'
          )
          
          console.log(`[CreateLoad] 🚀 Sending email to ${transporter.email}...`)
          const result = await sendEmail(
            transporter.email,
            `📬 New Load Available: ${ref}`,
            emailContent
          )
          
          if (result) {
            console.log(`[CreateLoad] ✅ Email SENT to ${transporter.email}`)
            emailsSent++
          } else {
            console.error(`[CreateLoad] ❌ Email FAILED for ${transporter.email}`)
            emailsFailed++
          }
        } catch (emailErr) {
          console.error(`[CreateLoad] 💥 Exception sending email to ${transporter.email}:`, emailErr)
          emailsFailed++
        }
      }
      
      console.log(`[CreateLoad] 📈 FINAL RESULT: ${emailsSent} emails sent, ${emailsFailed} failed`)
      
      // Also send email to the client who posted the load
      try {
        if (session.user?.email) {
          console.log(`[CreateLoad] 📧 Sending confirmation email to client: ${session.user.email}`)
          const clientEmailContent = loadPostedEmail(
            session.user.companyName || 'Client',
            ref,
            origin,
            destination,
            postedPrice,
            currency || 'ZAR'
          )
          const result = await sendEmail(
            session.user.email,
            `✅ Your Load Posted: ${ref}`,
            clientEmailContent
          )
          console.log(`[CreateLoad] ✅ Client confirmation email sent:`, result)
        }
      } catch (clientEmailErr) {
        console.error('[CreateLoad] ⚠️  Failed to send confirmation email to client:', clientEmailErr)
      }
    } catch (emailErr) {
      console.error('[CreateLoad] 💥 CRITICAL ERROR in email sending block:', emailErr)
      // Don't fail the load creation if emails fail
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Load created successfully',
        load: { 
          _id: result.insertedId, 
          ref,
          origin, 
          destination, 
          cargoType: itemType,
          weight, 
          description, 
          finalPrice: postedPrice,
          currency: 'ZAR',
          clientId,
          status: 'PENDING'
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[CreateLoad] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create load' },
      { status: 500 }
    )
  }
}
