import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/prisma';
import { generateAccessTokenEdge, generateRefreshTokenEdge } from '@/lib/jwt-utils-edge';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('[JWT-Login] ========== REQUEST RECEIVED ==========');
  
  try {
    console.log('[JWT-Login] Parsing request body...');
    const body = await request.json();
    const { email, password } = body;
    console.log('[JWT-Login] Email:', email);

    if (!email || !password) {
      console.log('[JWT-Login] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    console.log('[JWT-Login] Fetching user from database...');
    const db = await getDatabase();
    const user = await db.collection('users').findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      console.log('[JWT-Login] User not found');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[JWT-Login] User found:', user.email);

    // Verify password
    console.log('[JWT-Login] Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('[JWT-Login] Invalid password');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[JWT-Login] Password valid, generating tokens...');

    // Generate tokens
    const accessToken = await generateAccessTokenEdge({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      adminRole: user.adminRole,
      companyName: user.companyName,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      verificationComment: user.verificationComment,
    });

    // Create response data
    const responseData = {
      success: true,
      accessToken,  // ✅ Token in response
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        adminRole: user.adminRole,
        companyName: user.companyName,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
      },
    };

    console.log('[JWT-Login] Final response data:', {
      success: responseData.success,
      userRole: responseData.user.role,
      accessTokenLength: responseData.accessToken.length,
      userEmail: responseData.user.email,
    });

    // Create response with body
    const responseBody = JSON.stringify(responseData);
    console.log('[JWT-Login] Response body length:', responseBody.length);
    
    const response = new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

    console.log('[JWT-Login] Setting cookies...');
    
    // Set access token cookie (2 hours) - for middleware
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60, // 2 hours
      path: '/',
    });

    // Set refresh token cookie (7 days)
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    console.log('[JWT-Login] Cookies set successfully');
    console.log('[JWT-Login] ========== RETURNING RESPONSE ==========');

    return response;
  } catch (error: any) {
    console.error('[JWT-Login] ========== ERROR ==========');
    console.error('[JWT-Login] Error message:', error.message);
    console.error('[JWT-Login] Error stack:', error.stack);
    console.error('[JWT-Login] ========================================');
    
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
