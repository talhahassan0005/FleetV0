// src/lib/document-url.ts
// Central utility to fix Cloudinary document URLs for viewing

export function getViewableUrl(url: string | undefined | null): string {
  if (!url) return ""
  
  // Remove fl_attachment (causes 401)
  if (url.includes("/fl_attachment/")) {
    url = url.replace("/fl_attachment/", "/")
  }
  
  // Fix raw/upload PDFs - convert to image/upload for inline viewing
  // Actually keep as raw but remove fl_attachment
  
  return url
}
