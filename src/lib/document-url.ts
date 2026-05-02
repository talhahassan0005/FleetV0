export function getDocumentViewUrl(url: string | undefined | null): string {
  if (!url) return '#'
  
  // Remove any existing attachment/inline flags first
  let cleanUrl = url
    .replace('/fl_attachment/', '/')
    .replace('/fl_attachment:false/', '/')
    .replace('/fl_inline/', '/')

  // For Cloudinary PDFs — force inline (browser preview, no download)
  if (cleanUrl.includes('cloudinary') && cleanUrl.toLowerCase().includes('.pdf')) {
    if (cleanUrl.includes('/image/upload/')) {
      cleanUrl = cleanUrl.replace('/image/upload/', '/image/upload/fl_inline/')
    } else if (cleanUrl.includes('/raw/upload/')) {
      cleanUrl = cleanUrl.replace('/raw/upload/', '/raw/upload/fl_inline/')
    }
  }
  
  return cleanUrl
}

export function openDocument(url: string | undefined | null, originalName?: string): void {
  if (!url) return
  const viewUrl = getDocumentViewUrl(url)
  window.open(viewUrl, '_blank')
}