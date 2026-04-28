// src/app/api/cloudinary/signature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

export async function POST(req: NextRequest) {
  try {
    console.log('[CloudinarySignature] Request received')
    
    const session = await getServerSession(authOptions)
    console.log('[CloudinarySignature] Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role
    })
    
    if (!session?.user) {
      console.log('[CloudinarySignature] No session - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify Cloudinary credentials are present
    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.error('[CloudinarySignature] Missing Cloudinary credentials:', {
        hasSecret: !!process.env.CLOUDINARY_API_SECRET,
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY
      })
      return NextResponse.json({ 
        error: 'Cloudinary not configured',
        details: 'Server configuration error - please contact support'
      }, { status: 500 })
    }

    const { folder, resourceType } = await req.json()
    const timestamp = Math.round(Date.now() / 1000)
    const uploadFolder = folder || 'fleetxchange/pods'

    console.log('[CloudinarySignature] Generating signature for:', { folder: uploadFolder, resourceType, timestamp })

    try {
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder: uploadFolder,
          access_mode: 'public',
          type: 'upload',
        },
        process.env.CLOUDINARY_API_SECRET
      )

      console.log('[CloudinarySignature] Signature generated successfully')

      return NextResponse.json({
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: uploadFolder,
        resourceType: resourceType || 'raw',
      })
    } catch (signError: any) {
      console.error('[CloudinarySignature] Signature generation failed:', signError)
      return NextResponse.json({ 
        error: 'Failed to generate signature',
        details: signError.message
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('[CloudinarySignature] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate signature',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
