import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Skip middleware for API routes, static files, and auth pages
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/images/') ||
      pathname.includes('.') ||
      pathname === '/login' ||
      pathname === '/register'
    ) {
      return NextResponse.next()
    }

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Role-based route protection
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (pathname.startsWith('/client') && token.role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (pathname.startsWith('/transporter') && token.role !== 'TRANSPORTER') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login/register pages without token
        if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') {
          return true
        }
        // For protected routes, require token
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.).*)',
  ],
}