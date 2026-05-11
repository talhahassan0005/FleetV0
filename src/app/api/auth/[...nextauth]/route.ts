// NextAuth disabled - using JWT instead
// See src/app/api/auth/jwt-login and jwt-refresh for authentication endpoints

import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json(
    { error: 'NextAuth disabled - Use JWT endpoints instead' },
    { status: 403 }
  );
}

export function POST() {
  return NextResponse.json(
    { error: 'NextAuth disabled - Use JWT endpoints instead' },
    { status: 403 }
  );
}
