import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (!token) return NextResponse.redirect(new URL('/login', req.url))

    // Role-based route protection
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN')
      return NextResponse.redirect(new URL('/dashboard', req.url))

    if (pathname.startsWith('/client') && token.role !== 'CLIENT')
      return NextResponse.redirect(new URL('/dashboard', req.url))

    if (pathname.startsWith('/transporter') && token.role !== 'TRANSPORTER')
      return NextResponse.redirect(new URL('/dashboard', req.url))

    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/transporter/:path*',
    '/dashboard',
  ],
}