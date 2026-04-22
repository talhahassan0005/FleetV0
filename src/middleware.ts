import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ADMIN_ROLES = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'POD_MANAGER']

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const pathname = req.nextUrl.pathname

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const role = token.role as string

  if (pathname.startsWith('/admin') && !ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/client') && role !== 'CLIENT') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/transporter') && role !== 'TRANSPORTER') {
    return NextResponse.redirect(new URL('/login', req.url))
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
