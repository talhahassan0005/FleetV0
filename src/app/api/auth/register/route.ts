// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/prisma'
import { uploadFile } from '@/lib/cloudinary'
import { sendEmail, welcomeEmail } from '@/lib/email'
import { z } from 'zod'
import { ObjectId } from 'mongodb'

const schema = z.object({
  email:       z.string().email(),
  password:    z.string().min(6),
  role:        z.enum(['CLIENT', 'TRANSPORTER']),
  companyName: z.string().min(1),
  contactName: z.string().optional(),
  phone:       z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const db = await getDatabase()
    const contentType = req.headers.get('content-type') || ''
    let email: string | null = null, password: string | null = null, role: string | null = null, companyName: string | null = null, contactName: string | null = null, phone: string | null = null
    let documentsFormArray: Array<{ file: File; type: string }> = []

    console.log('[Register] Content-Type:', contentType)

    // Handle both JSON and FormData
    if (contentType.includes('application/json')) {
      // Parse JSON
      const body = await req.json()
      console.log('[Register] Request body:', { ...body, password: '***' })
      email = body.email || null
      password = body.password || null
      role = body.role || null
      companyName = body.companyName || null
      contactName = body.contactName || null
      phone = body.phone || null
    } else if (contentType.includes('multipart/form-data')) {
      // Parse FormData
      const formData = await req.formData()
      email = formData.get('email') as string | null
      password = formData.get('password') as string | null
      role = formData.get('role') as string | null
      companyName = formData.get('companyName') as string | null
      contactName = formData.get('contactName') as string | null
      phone = formData.get('phone') as string | null

      console.log('[Register] FormData parsed:', { email, role, companyName, password: password ? '***' : null })

      // Collect document files
      let idx = 0
      while (true) {
        const file = formData.get(`documents[${idx}]`) as File | null
        const type = formData.get(`documentTypes[${idx}]`) as string | null
        
        if (!file) break
        if (type) {
          documentsFormArray.push({ file, type })
        }
        idx++
      }
    } else {
      console.log('[Register] Invalid Content-Type:', contentType)
      return NextResponse.json(
        { error: 'Invalid Content-Type. Use application/json or multipart/form-data' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!email || !password || !role || !companyName) {
      const missing: string[] = []
      if (!email) missing.push('email')
      if (!password) missing.push('password')
      if (!role) missing.push('role')
      if (!companyName) missing.push('companyName')
      console.log('[Register] Missing fields:', missing)
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate data with Zod
    const data = schema.parse({
      email,
      password,
      role,
      companyName,
      contactName: contactName || undefined,
      phone: phone || undefined,
    })
    console.log('[Register] Schema validation passed for email:', data.email)

    // Check if email already exists
    const emailToCheck = data.email.toLowerCase()
    console.log('[Register] Checking for existing email:', emailToCheck)
    
    const existing = await db.collection('users').findOne({
      email: emailToCheck,
    })
    
    console.log('[Register] Email exists check:', { 
      exists: !!existing, 
      email: emailToCheck,
      existingData: existing ? { id: existing._id, email: existing.email, createdAt: existing.createdAt } : null
    })
    
    if (existing) {
      console.log('[Register] Email already registered, returning 400')
      return NextResponse.json(
        { error: `Email already registered. Previous registration: ${existing.createdAt}` },
        { status: 400 }
      )
    }

    // Hash password
    const hashed = await bcrypt.hash(data.password, 12)
    console.log('[Register] Password hashed successfully')

    // Create new user
    console.log('[Register] Creating user with:', { email: data.email, role: data.role, companyName: data.companyName })
    const result = await db.collection('users').insertOne({
      email: data.email.toLowerCase(),
      password: hashed,
      role: data.role,
      companyName: data.companyName,
      contactName: data.contactName || '',
      phone: data.phone || '',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    const userId = result.insertedId.toString()
    console.log('[Register] User created successfully:', { userId, email: data.email })

    // Upload documents (if any)
    for (const doc of documentsFormArray) {
      try {
        const buffer = Buffer.from(await doc.file.arrayBuffer())
        const { publicId, secureUrl } = await uploadFile(
          buffer,
          doc.file.name,
          'company-docs'
        )

        // Create document record
        await db.collection('documents').insertOne({
          userId: new ObjectId(userId),
          docType: doc.type,
          filename: publicId,
          originalName: doc.file.name,
          fileUrl: secureUrl,
          uploadedByRole: data.role,
          visibleTo: 'ADMIN',
          documentCategory: 'REGISTRATION',
          verificationStatus: 'PENDING',
          createdAt: new Date(),
        })
      } catch (uploadErr) {
        console.error(`[Register] Failed to upload document ${doc.file.name}:`, uploadErr)
        // Continue with other documents even if one fails
      }
    }

    console.log('[Register] Registration successful, returning 201')
    
    // Send welcome email to new user
    try {
      const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`
      const emailContent = welcomeEmail(data.companyName, data.role, loginUrl)
      await sendEmail(
        data.email,
        '🎉 Welcome to FleetXChange!',
        emailContent
      )
      console.log('[Register] ✅ Welcome email sent to:', data.email)
    } catch (emailErr) {
      console.error('[Register] ⚠️  Error sending welcome email:', emailErr)
      // Don't fail registration if email fails
    }
    
    return NextResponse.json(
      {
        id: userId,
        email: data.email,
        role: data.role,
        documentsUploaded: documentsFormArray.length,
      },
      { status: 201 }
    )
  } catch (err: any) {
    if (err.name === 'ZodError') {
      console.error('[Register] Validation error:', err.errors)
      return NextResponse.json({ 
        error: 'Validation failed',
        details: err.errors 
      }, { status: 422 })
    }
    console.error('[Register] Error:', err.message || err)
    return NextResponse.json({ error: err.message || 'Server error.' }, { status: 500 })
  }
}
