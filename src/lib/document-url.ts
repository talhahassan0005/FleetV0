export function getDocumentViewUrl(url: string | undefined | null): string {
  if (!url) return '#'
  
  const cleanUrl = url.replace('/fl_attachment/', '/')
  
  if (cleanUrl.includes('/image/upload/') && cleanUrl.toLowerCase().includes('.pdf')) {
    return cleanUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto,pg_1/')
  }
  
  return cleanUrl
}

export function openDocument(url: string | undefined | null, originalName?: string): void {
  if (!url) return
  const viewUrl = getDocumentViewUrl(url)
  
  // For raw files (download) - use anchor with original name
  if (url.includes('/raw/upload/')) {
    const a = document.createElement('a')
    a.href = viewUrl
    a.download = originalName || 'document.pdf'
    a.target = '_blank'
    a.click()
    return
  }
  
  // For image files - open in new tab
  window.open(viewUrl, '_blank')
}
