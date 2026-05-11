import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, isAdmin } from '@/lib/server-auth';

/**
 * Example protected API route
 * Shows how to use JWT authentication in API routes
 */
export async function GET(request: NextRequest) {
  // Get authenticated user
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please login' },
      { status: 401 }
    );
  }

  // Optional: Check if user is admin
  if (!isAdmin(user)) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  // User is authenticated and authorized
  return NextResponse.json({
    success: true,
    message: 'Protected data accessed successfully',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
    },
  });
}

export async function POST(request: NextRequest) {
  // Get authenticated user
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please login' },
      { status: 401 }
    );
  }

  // Parse request body
  const body = await request.json();

  // Your business logic here
  // You have access to user.id, user.role, user.email, etc.

  return NextResponse.json({
    success: true,
    message: 'Data processed successfully',
    userId: user.id,
  });
}