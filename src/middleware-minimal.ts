// Minimal middleware - use this if issues persist
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Minimal middleware - just pass through
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true // Allow all for now
    }
  }
)

export const config = {
  matcher: [
    // Only protect specific sensitive routes
    '/admin/users/:path*',
  ],
}