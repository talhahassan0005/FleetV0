import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/admin',
    '/client', 
    '/transporter'
  ]
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // If accessing protected route without tokens, redirect to login
  if (isProtectedRoute && !accessToken && !refreshToken) {
    const loginUrl = new URL('/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    
    // Clear any existing auth cookies
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    
    return response
  }
  
  // If accessing login page with valid tokens, redirect to dashboard
  if (pathname === '/login' && (accessToken || refreshToken)) {
    // Try to decode token to get user role (basic check)
    try {
      if (accessToken) {
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        const adminRoles = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'POD_MANAGER', 'ADMIN']
        
        if (adminRoles.includes(payload.role)) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        } else if (payload.role === 'TRANSPORTER') {
          return NextResponse.redirect(new URL('/transporter/dashboard', request.url))
        } else {
          return NextResponse.redirect(new URL('/client/dashboard', request.url))
        }
      }
    } catch (error) {
      // If token is invalid, clear it and continue to login
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