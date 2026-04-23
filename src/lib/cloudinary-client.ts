export async function uploadToCloudinary(
  file: File,
  folder: string = 'pods'
): Promise<{ publicId: string; secureUrl: string }> {
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB')
  }
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'fleetxchange_public')
    formData.append('folder', `fleetxchange/${folder}`)

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/dv74tf1hh/image/upload`,
      { method: 'POST', body: formData }
    )
    if (!uploadRes.ok) {
      const err = await uploadRes.json()
      throw new Error(err.error?.message || 'Upload failed')
    }
    const result = await uploadRes.json()
    return {
      publicId: result.public_id,
      secureUrl: result.secure_url
    }
  } catch (error) {
    console.error('[CloudinaryClient] Upload error:', error)
    throw error
  }
}
