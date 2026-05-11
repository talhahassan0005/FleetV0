import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const db = await getDatabase();
    const user = await db.collection('users').findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      adminRole: user.adminRole,
      companyName: user.companyName,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      verificationComment: user.verificationComment,
    });

    const refreshToken = generateRefreshToken(user._id.toString());

    // Create response with tokens
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          adminRole: user.adminRole,
          companyName: user.companyName,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus,
        },
        accessToken,
        refreshToken,
      },
      { status: 200 }
    );

    // Set refresh token as HTTP-only cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
