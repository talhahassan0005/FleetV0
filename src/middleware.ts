import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ADMIN_ROLES = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'POD_MANAGER']

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const pathname = req.nextUrl.pathname

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role as string

  // Check admin access
  if (pathname.startsWith('/admin')) {
    if (!ADMIN_ROLES.includes(role)) {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    return response
  }

  // Check client access
  if (pathname.startsWith('/client')) {
    if (role !== 'CLIENT') {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    return response
  }

  // Check transporter access
  if (pathname.startsWith('/transporter')) {
    if (role !== 'TRANSPORTER') {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
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
