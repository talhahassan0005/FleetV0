import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt-utils'

const ADMIN_ROLES = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'POD_MANAGER']

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

  // Get access token from cookie
  const accessToken = req.cookies.get('accessToken')?.value

  if (!accessToken) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Verify JWT token
  const tokenData = verifyAccessToken(accessToken)

  if (!tokenData) {
    const loginUrl = new URL('/login', req.url)
    const response = NextResponse.redirect(loginUrl)
    // Clear invalid token
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    return response
  }

  const role = tokenData.role

  // Check admin access
  if (pathname.startsWith('/admin')) {
    if (!ADMIN_ROLES.includes(role)) {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  // Check client access
  if (pathname.startsWith('/client')) {
    if (role !== 'CLIENT') {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  // Check transporter access
  if (pathname.startsWith('/transporter')) {
    if (role !== 'TRANSPORTER') {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
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