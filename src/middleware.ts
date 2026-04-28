import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ADMIN_ROLES = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'POD_MANAGER']

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  console.log('[Middleware] Request:', {
    pathname,
    method: req.method,
    url: req.url
  })

  try {
    // Get token with explicit cookie name to avoid production mismatch
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token'
    })

    console.log('[Middleware] Token check:', {
      hasToken: !!token,
      role: token?.role,
      email: token?.email,
      pathname
    })

    if (!token) {
      console.log('[Middleware] No token - redirecting to login')
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = token.role as string

    // CRITICAL: Strict role-based access control
    // Admin portal - only admin roles allowed
    if (pathname.startsWith('/admin')) {
      if (!ADMIN_ROLES.includes(role)) {
        console.log('[Middleware] ❌ Non-admin trying to access admin portal:', { role, pathname })
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(loginUrl)
      }
      console.log('[Middleware] ✅ Admin access granted:', { role, pathname })
      const response = NextResponse.next()
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
      response.headers.set('X-User-Role', role)
      return response
    }

    // Client portal - only CLIENT role allowed
    if (pathname.startsWith('/client')) {
      if (role !== 'CLIENT') {
        console.log('[Middleware] ❌ Non-client trying to access client portal:', { role, pathname })
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(loginUrl)
      }
      console.log('[Middleware] ✅ Client access granted:', { role, pathname })
      const response = NextResponse.next()
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
      response.headers.set('X-User-Role', role)
      return response
    }

    // Transporter portal - only TRANSPORTER role allowed
    if (pathname.startsWith('/transporter')) {
      if (role !== 'TRANSPORTER') {
        console.log('[Middleware] ❌ Non-transporter trying to access transporter portal:', { role, pathname })
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(loginUrl)
      }
      console.log('[Middleware] ✅ Transporter access granted:', { role, pathname })
      const response = NextResponse.next()
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
      response.headers.set('X-User-Role', role)
      return response
    }

    return NextResponse.next()
  } catch (error: any) {
    console.error('[Middleware] Error:', error)
    // On error, redirect to login to be safe
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('error', 'session_error')
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/transporter/:path*',
    '/dashboard',
  ],
}
