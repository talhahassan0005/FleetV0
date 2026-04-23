// src/app/api/cloudinary/signature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { folder, resourceType } = await req.json()
    const timestamp = Math.round(Date.now() / 1000)
    const uploadFolder = folder || 'fleetxchange/pods'

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: uploadFolder,
        access_mode: 'public',
        type: 'upload',
      },
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: uploadFolder,
      resourceType: resourceType || 'raw',
    })
  } catch (error) {
    console.error('[CloudinarySignature] Error:', error)
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 })
  }
}
