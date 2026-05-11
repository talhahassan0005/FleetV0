import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Skip middleware for static files, API routes, public assets, and auth pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/' ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next()
  }

  // Skip middleware for client-side pages that handle auth with useAuth hook
  // These pages check JWT from localStorage on client-side
  if (
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/client/') ||
    pathname.startsWith('/transporter/')
  ) {
    // Client-side components will handle authentication with useAuth hook
    // and localStorage JWT tokens
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/transporter/:path*',
    '/dashboard',
  ],
}