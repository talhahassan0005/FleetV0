export function getDocumentViewUrl(url: string | undefined | null): string {
  if (!url) return '#'
  
  // Remove Cloudinary attachment mode (forces download)
  let cleanUrl = url.replace('/fl_attachment/', '/')
  
  // For PDFs in Cloudinary, optimize for browser preview
  if (cleanUrl.includes('/image/upload/') && cleanUrl.toLowerCase().includes('.pdf')) {
    // Add Cloudinary transformations for PDF preview
    // f_auto = auto format, q_auto = auto quality, pg_1 = first page preview
    cleanUrl = cleanUrl.replace('/image/upload/', '/image/upload/fl_attachment:false/')
  }
  
  // For raw uploads, convert to image upload for preview
  if (cleanUrl.includes('/raw/upload/') && cleanUrl.toLowerCase().includes('.pdf')) {
    cleanUrl = cleanUrl.replace('/raw/upload/', '/image/upload/fl_attachment:false/')
  }
  
  return cleanUrl
}

export function openDocument(url: string | undefined | null, originalName?: string): void {
  if (!url) return
  const viewUrl = getDocumentViewUrl(url)
  
  // Always open in new tab for preview (no automatic download)
  window.open(viewUrl, '_blank')
}
