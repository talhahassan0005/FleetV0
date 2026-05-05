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
    if (clientId) {
      // Try to convert to ObjectId, if it fails, use as string
      try {
        filter.clientId = new ObjectId(clientId)
      } catch (err) {
        filter.clientId = clientId
      }
    }
    
    const loads = await db.collection('loads').find(filter).sort({ createdAt: -1 }).limit(50).toArray()
    
    // Add quotes count for each load
    const loadsWithQuotes = await Promise.all(
      loads.map(async (load) => {
        const quotesCount = await db.collection('quotes').countDocuments({ loadId: load._id })
        return {
          ...load,
          _id: load._id.toString(),
          clientId: load.clientId?.toString?.() || load.clientId,
          quotesCount
        }
      })
    )
    
    return NextResponse.json({ success: true, loads: loadsWithQuotes, count: loadsWithQuotes.length })
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

    // Send email notification to all ADMINS so they can react quickly
    try {
      const admins = await db.collection('users').find({
        role: { $in: ['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'FINANCE_ADMIN'] }
      }).toArray()

      for (const admin of admins) {
        if (!admin.email) continue
        await sendEmail(
          admin.email,
          `🚨 New Load Posted: ${ref}`,
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #1a2a5e; margin-top: 0;">🚨 New Load Needs Your Review</h2>
              <p>Hi ${admin.companyName || 'Admin'},</p>
              <p>A client has just posted a new load. Please review and approve or reject it.</p>
              <div style="background: #f0f0f0; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Load Reference:</strong> ${ref}</p>
                <p><strong>Route:</strong> ${origin} → ${destination}</p>
                <p><strong>Posted By:</strong> ${session.user.companyName || session.user.email}</p>
                <p><strong>Posted At:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p style="margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.africa'}/admin/loads" style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Review Load Now</a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange System</strong></p>
            </div>
          </div>
          `
        )
      }
      console.log(`[CreateLoad] ✅ Admin notification emails sent to ${admins.length} admin(s)`)
    } catch (adminEmailErr) {
      console.error('[CreateLoad] ⚠️ Failed to send admin notification email:', adminEmailErr)
      // Don't fail load creation if admin email fails
    }

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