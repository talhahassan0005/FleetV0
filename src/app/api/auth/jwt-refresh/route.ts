import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/prisma';
import { generateAccessToken, verifyRefreshToken } from '@/lib/jwt-utils';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded || decoded.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Get user from database
    const db = await getDatabase();
    const user = await db.collection('users').findOne({
      _id: new ObjectId(decoded.id),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Generate new access token
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

    // Create response with new access token
    const response = NextResponse.json(
      {
        success: true,
        accessToken,
      },
      { status: 200 }
    );

    // Update access token cookie
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60, // 2 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: error.message || 'Token refresh failed' },
      { status: 500 }
    );
  }
}