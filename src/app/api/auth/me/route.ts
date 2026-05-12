import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt-utils';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;

    // No token or empty token
    if (!token || token.trim() === '') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token
    const user = verifyAccessToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json(
      { success: true, user },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 401 });
  }
}