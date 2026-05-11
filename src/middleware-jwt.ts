import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './lib/jwt-utils';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't need authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/',
    '/privacy-policy',
    '/terms-of-service',
    '/about',
    '/contact',
  ];

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes - check JWT token
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    // Try to get from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      // Redirect to login if accessing protected route without token
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Unauthorized - No token provided' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Attach user info to request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Verify JWT token
  const payload = verifyAccessToken(accessToken);
  if (!payload) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Unauthorized - Token expired' },
        { status: 401 }
      );
    }
    // Token expired, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }

  // Token is valid, continue
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.id);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-email', payload.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
