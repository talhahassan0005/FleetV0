import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper: check if token is a valid non-empty JWT (3 parts)
function isValidToken(token: string | undefined): boolean {
  if (!token || token.trim() === '') return false
  const parts = token.split('.')
  return parts.length === 3 && parts[1].length > 0
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get tokens from cookies — treat empty string as no token
  const rawAccessToken = request.cookies.get('accessToken')?.value
  const rawRefreshToken = request.cookies.get('refreshToken')?.value
  
  const accessToken = isValidToken(rawAccessToken) ? rawAccessToken : undefined
  const refreshToken = isValidToken(rawRefreshToken) ? rawRefreshToken : undefined

  // Protected routes that require authentication
  const protectedRoutes = [
    '/admin',
    '/client', 
    '/transporter'
  ]
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // If accessing protected route without a valid accessToken, redirect to login
  // Note: Only accessToken drives protection — refreshToken alone is not enough
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    return response
  }
  
  // If accessing login page with a valid accessToken, redirect to correct dashboard
  // Only redirect if accessToken is present AND valid — refreshToken alone does NOT redirect
  if (pathname === '/login' && accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      
      // Check token expiry — if expired, let user stay on login page
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        // Token expired — clear cookies and show login
        const response = NextResponse.next()
        response.cookies.delete('accessToken')
        response.cookies.delete('refreshToken')
        return response
      }

      const adminRoles = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'POD_MANAGER', 'ADMIN']
      
      if (adminRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else if (payload.role === 'TRANSPORTER') {
        return NextResponse.redirect(new URL('/transporter/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/client/dashboard', request.url))
      }
    } catch (error) {
      // Token malformed — clear it and show login
      const response = NextResponse.next()
      response.cookies.delete('accessToken')
      response.cookies.delete('refreshToken')
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*', 
    '/transporter/:path*',
    '/login'
  ]
}