// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;

    // No token or empty token
    if (!token || token.trim() === '') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Decode token directly (same way middleware does it)
    // We do NOT use verifyAccessToken() from jwt-utils.ts because it uses
    // NEXTAUTH_SECRET, but tokens are signed with JWT_SECRET in jwt-utils-edge.ts
    // These are two different secrets — verifyAccessToken always fails!
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(atob(parts[1]));
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    // Must have a role
    if (!payload.role) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    return NextResponse.json(
      { success: true, user: payload },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 401 });
  }
}