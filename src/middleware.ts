import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Inline isAdmin check for Edge runtime compatibility
function isAdmin(role: string): boolean {
  return ['SUPER_ADMIN', 'POD_MANAGER', 'OPERATIONS_ADMIN', 'FINANCE_ADMIN'].includes(role)
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    console.log('[Middleware] Path:', pathname, 'Role:', token?.role)

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
      console.log('[Middleware] No token, redirecting to login')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Role-based route protection using single role field
    if (pathname.startsWith('/admin')) {
      const adminCheck = isAdmin(token.role as string)
      console.log('[Middleware] Admin check:', adminCheck, 'for role:', token.role)
      if (!adminCheck) {
        console.log('[Middleware] Not admin, redirecting to login')
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (pathname.startsWith('/client') && token.role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (pathname.startsWith('/transporter') && token.role !== 'TRANSPORTER') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    console.log('[Middleware] Allowing access to:', pathname)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Allow access to login/register pages without token
        if (pathname === '/login' || pathname === '/register') {
          return true
        }
        
        // Skip auth for API routes and static files
        if (
          pathname.startsWith('/api/') ||
          pathname.startsWith('/_next/') ||
          pathname.startsWith('/images/') ||
          pathname.includes('.')
        ) {
          return true
        }
        
        // For admin routes, check if user is any type of admin
        if (pathname.startsWith('/admin')) {
          const result = token?.role ? isAdmin(token.role as string) : false
          console.log('[Middleware Auth] Admin route check:', result, 'Role:', token?.role)
          return result
        }
        
        // For other protected routes, require token
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.).*)',
  ],
}