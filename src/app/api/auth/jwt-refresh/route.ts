import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/prisma';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  try {
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
      _id: require('mongodb').ObjectId.createFromHexString(decoded.id),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      adminRole: user.adminRole,
      companyName: user.companyName,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      verificationComment: user.verificationComment,
    });

    return NextResponse.json(
      {
        success: true,
        accessToken: newAccessToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
