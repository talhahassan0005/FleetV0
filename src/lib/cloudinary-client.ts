// src/lib/cloudinary-client.ts
// Client-side Cloudinary upload helper

export async function uploadToCloudinary(
  file: File,
  folder: string = 'pods'
): Promise<{ publicId: string; secureUrl: string }> {
  try {
    // Get upload signature from backend
    const signatureRes = await fetch('/api/cloudinary/signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: `fleetxchange/${folder}` })
    })

    if (!signatureRes.ok) {
      throw new Error('Failed to get upload signature')
    }

    const { signature, timestamp, cloudName, apiKey, folder: uploadFolder } = await signatureRes.json()

    // Upload directly to Cloudinary
    const formData = new FormData()
    formData.append('file', file)
    formData.append('signature', signature)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', apiKey)
    formData.append('folder', uploadFolder)

    // Determine resource type
    const ext = file.name.split('.').pop()?.toLowerCase()
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')
    const resourceType = isImage ? 'image' : 'raw'

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

    const uploadRes = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    })

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json()
      throw new Error(errorData.error?.message || 'Upload failed')
    }

    const result = await uploadRes.json()
    
    let secureUrl = result.secure_url
    
    // For PDFs, modify URL for inline viewing
    if (ext === 'pdf' && secureUrl.includes('/raw/upload/')) {
      secureUrl = secureUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/')
    }

    return {
      publicId: result.public_id,
      secureUrl: secureUrl
    }
  } catch (error) {
    console.error('[CloudinaryClient] Upload error:', error)
    throw error
  }
}
