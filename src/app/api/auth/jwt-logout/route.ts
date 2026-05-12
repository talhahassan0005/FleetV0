import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    expires: new Date(0), // Force immediate expiry in all browsers
    path: '/',
  };

  // Clear access token cookie
  response.cookies.set('accessToken', '', cookieOptions);

  // Clear refresh token cookie
  response.cookies.set('refreshToken', '', cookieOptions);

  return response;
}