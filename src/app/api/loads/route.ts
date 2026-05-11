import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail } from '@/lib/email'

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
      try {
        filter.clientId = new ObjectId(clientId)
      } catch (err) {
        filter.clientId = clientId
      }
    }
    
    const loads = await db.collection('loads').find(filter).sort({ createdAt: -1 }).limit(50).toArray()
    
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
    const user = await getAuthUser(req)
if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      )
    }

    // 2. Check user is verified
    if (!user.isVerified) {
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

    if (missing.length > 0) {
      console.log('[CreateLoad] Validation failed, missing:', missing.join(', '))
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    const ref = `LOAD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    
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
      cargoType: itemType,
      weight,
      description,
      finalPrice: postedPrice,
      currency: currency || 'ZAR',
      country: country || 'ZA',
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
    })

    // ── Send email to ALL ADMINS so they can review and react quickly ──
    try {
      const admins = await db.collection('users').find({
        role: { $in: ['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'FINANCE_ADMIN'] }
      }).toArray()

      console.log(`[CreateLoad] Found ${admins.length} admin(s) to notify`)

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
                <p><strong>Posted By:</strong> ${user.companyName || user.email}</p>
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
        console.log(`[CreateLoad] ✅ Admin notification sent to ${admin.email}`)
      }
    } catch (adminEmailErr) {
      console.error('[CreateLoad] ⚠️ Failed to send admin notification:', adminEmailErr)
      // Don't fail load creation if admin email fails
    }

    // ── NOTE: Transporter emails are sent when admin APPROVES the load ──
    // See: src/app/api/admin/loads/[id]/route.ts → action === 'approve'
    // Transporters only see APPROVED loads, so email them only on approval

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