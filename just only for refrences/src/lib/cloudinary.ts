// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  folder: string
): Promise<{ publicId: string; secureUrl: string }> {
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
}

export async function deleteFile(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'auto' })
}

export default cloudinary
