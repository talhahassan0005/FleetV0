// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

// Configure only if credentials are available
if (process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Simple ID generator without external dependency
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  folder: string
): Promise<{ publicId: string; secureUrl: string }> {
  // Check if Cloudinary is properly configured
  const hasCloudinaryCredentials = !!(process.env.CLOUDINARY_API_KEY && 
                                       process.env.CLOUDINARY_CLOUD_NAME && 
                                       process.env.CLOUDINARY_API_SECRET)

  if (hasCloudinaryCredentials) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `fleetxchange/${folder}`,
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) return reject(error)
          resolve({ publicId: result.public_id, secureUrl: result.secure_url })
        }
      )
      stream.end(buffer)
    })
  } else {
    // Fallback: Store as base64 in MongoDB (handled in API route)
    const publicId = `LOCAL:${folder}/${Date.now()}-${generateId()}`
    const secureUrl = `/documents/${publicId}` // This will be fetched from MongoDB
    return { publicId, secureUrl }
  }
}

export async function deleteFile(publicId: string) {
  const hasCloudinaryCredentials = !!(process.env.CLOUDINARY_API_KEY && 
                                       process.env.CLOUDINARY_CLOUD_NAME && 
                                       process.env.CLOUDINARY_API_SECRET)
  
  if (hasCloudinaryCredentials) {
    return cloudinary.uploader.destroy(publicId, { resource_type: 'auto' })
  }
  // Fallback: Return success (no file to delete locally for now)
  return { result: 'ok' }
}

export default cloudinary
