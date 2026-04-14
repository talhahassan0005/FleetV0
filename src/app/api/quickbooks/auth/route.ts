import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exchangeCodeForToken, generateQBAuthURL, refreshAccessToken } from '@/lib/quickbooks';
import { getDatabase } from '@/lib/prisma';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';

// QB OAuth Configuration
const QB_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI || '';

/**
 * GET /api/quickbooks/auth?action=connect
 * Redirects user to QB OAuth login
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  try {
    // Check if QB returned an error
    if (error) {
      console.error('[QB Auth] ❌ QB returned error:', error);
      console.error('[QB Auth] Error description:', errorDescription);
      return NextResponse.json(
        {
          error: 'QB Authorization Failed',
          details: error,
          description: errorDescription,
        },
        { status: 400 }
      );
    }

    // Step 1: Initial OAuth redirect
    if (action === 'connect') {
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login first' },
          { status: 401 }
        );
      }

      // Generate state for CSRF protection + pass country and currency
      const stateData = {
        randomState: crypto.randomBytes(16).toString('hex'),
        country: searchParams.get('country') || 'ZA',
        currency: searchParams.get('currency') || 'ZAR',
      };
      
      const stateToken = Buffer.from(JSON.stringify(stateData)).toString('base64url');

      // Store state in session/cookie for verification
      const response = NextResponse.redirect(
        generateQBAuthURL(stateToken)
      );

      response.cookies.set('qb_state', stateToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
      });

      return response;
    }

    // Step 2: OAuth callback from QB
    console.log('[QB Auth Callback] Received params:', { code: !!code, realmId: !!realmId, state: !!state });
    console.log('[QB Auth Callback] Full URL:', request.url);
    console.log('[QB Auth Callback] Query params:', { code, realmId, state });
    
    if (code && realmId && state) {
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login first' },
          { status: 401 }
        );
      }

      const userId = (session.user as any).id;
      console.log('[QB Auth] Session user ID type:', typeof userId);
      console.log('[QB Auth] Session user ID:', userId);
      console.log('[QB Auth] Full session user object:', JSON.stringify(session.user, null, 2));

      // Get stored state from cookies
      const storedState = request.cookies.get('qb_state')?.value;

      if (!storedState || storedState !== state) {
        return NextResponse.json(
          { error: 'Invalid state parameter - CSRF validation failed' },
          { status: 400 }
        );
      }

      // Decode state
      const stateDecoded = JSON.parse(Buffer.from(state, 'base64url').toString());
      const { country, currency } = stateDecoded;

      // Exchange code for tokens
      console.log('[QB Auth] Exchanging code for tokens...');
      let token;
      try {
        token = await exchangeCodeForToken(code, realmId);
        console.log('[QB Auth] ✅ Token exchange successful');
      } catch (error) {
        console.error('[QB Auth] ❌ Token exchange failed:', error);
        throw error;
      }

      // Save QB credentials to database
      console.log('[QB Auth] Connecting to database...');
      const db = await getDatabase();
      console.log('[QB Auth] ✅ Database connected');

      console.log('[QB Auth] Saving QB credentials for user:', (session.user as any).id);
      console.log('[QB Auth] Token data:', {
        accessToken: token.accessToken ? '✅ present' : '❌ missing',
        refreshToken: token.refreshToken ? '✅ present' : '❌ missing',
        expiresIn: token.expiresIn,
        realmId: realmId,
      });

      const updateData = {
        quickbooksAccount: {
          country,
          currency,
          realmId,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          tokenExpiresAt: new Date(Date.now() + (token.expiresIn || 3600) * 1000),
          connectedAt: new Date(),
          isConnected: true,
          label: country === 'ZA' ? 'South Africa' : country === 'BW' ? 'Botswana' : country,
        },
      };

      try {
        const userId = (session.user as any).id;
        console.log('[QB Auth] Raw userId (string):', userId);
        console.log('[QB Auth] Session user email:', (session.user as any).email);
        console.log('[QB Auth] Session user role:', (session.user as any).role);
        
        // Convert string ID to MongoDB ObjectId
        let objectId;
        try {
          objectId = new ObjectId(userId);
          console.log('[QB Auth] Converted ObjectId:', objectId.toString());
        } catch (idError) {
          console.error('[QB Auth] ❌ Invalid ObjectId format:', userId);
          console.error('[QB Auth] Error:', idError);
          return NextResponse.json(
            { error: 'Invalid user ID format', userId },
            { status: 400 }
          );
        }
        
        console.log('[QB Auth] Attempting to find user...');
        
        // Find the user first - using the SAME database as auth.ts
        const user = await db.collection('users').findOne({ _id: objectId });
        
        if (!user) {
          console.error('[QB Auth] ❌ User not found in database');
          return NextResponse.json(
            { 
              error: 'Failed to save QB credentials',
              details: 'User not found in database',
              userId: userId,
            },
            { status: 404 }
          );
        }

        console.log('[QB Auth] ✅ User found:', user.email);
        console.log('[QB Auth] Updating quickbooksAccounts field...');
        
        // Remove existing account for this country if it exists
        await db.collection('users').updateOne(
          { _id: objectId },
          { $pull: { quickbooksAccounts: { country: country } } as any }
        );

        const isPrimary = country === 'ZA' || (!user.quickbooks?.isConnected && !user.quickbooksAccounts?.length);

        // Update the user's quickbooksAccounts array
        const result = await db.collection('users').findOneAndUpdate(
          { _id: objectId },
          { 
            $push: { quickbooksAccounts: updateData.quickbooksAccount } as any,
            ...(isPrimary ? {
                $set: {
                  'quickbooks.isConnected': true,
                  'quickbooks.realmId': realmId,
                  'quickbooks.accessToken': token.accessToken,
                  'quickbooks.refreshToken': token.refreshToken,
                  'quickbooks.tokenExpiresAt': updateData.quickbooksAccount.tokenExpiresAt,
                  'quickbooks.connectedAt': new Date(),
                  updatedAt: new Date()
                }
            } : {
                $set: { updatedAt: new Date() }
            })
          },
          { returnDocument: 'after' }
        );
        
        if (!result) {
          console.error('[QB Auth] ❌ Update failed (result is null)');
          return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
          );
        }

        console.log('[QB Auth] ✅ QB credentials saved successfully');
        const updatedDoc = (result as any).value || result;
      } catch (dbError) {
        console.error('[QB Auth] ❌ Database error:', dbError);
        if (dbError instanceof Error) {
          console.error('[QB Auth] Error message:', dbError.message);
          console.error('[QB Auth] Error stack:', dbError.stack);
        }
        throw dbError;
      }

      // Clear the state cookie
      const response = NextResponse.redirect(
        new URL('/admin/dashboard/quickbooks?status=connected', request.url)
      );

      response.cookies.delete('qb_state');

      return response;
    }

    // Invalid request
    console.log('[QB Auth Callback] ❌ Missing required parameters');
    console.log('[QB Auth Callback] code:', code ? '✅ present' : '❌ missing');
    console.log('[QB Auth Callback] realmId:', realmId ? '✅ present' : '❌ missing');
    console.log('[QB Auth Callback] state:', state ? '✅ present' : '❌ missing');
    console.log('[QB Auth Callback] error:', error ? `❌ ${error}` : '✅ No error');
    console.log('[QB Auth Callback] Full URL:', request.url);
    
    // If no action and no params, user probably hit the auth endpoint directly
    if (!action && !code && !realmId && !state && !error) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'This endpoint is for QB OAuth callback only. Click "Connect to QuickBooks" to start.',
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Invalid OAuth request - missing required parameters',
        missing: {
          code: !code,
          realmId: !realmId,
          state: !state,
        }
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[QB Auth] 💥 Critical error:', error);
    if (error instanceof Error) {
      console.error('[QB Auth] Error message:', error.message);
      console.error('[QB Auth] Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'OAuth failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quickbooks/auth
 * Disconnect QB account
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { action, country } = body;

  try {
    const db = await getDatabase();
    const objectId = new ObjectId((session.user as any).id);

    if (action === 'disconnect') {
      if (country) {
        // Disconnect specific country account
        await db.collection('users').updateOne(
          { _id: objectId },
          { 
            $pull: { quickbooksAccounts: { country } } as any,
          }
        );
        
        // If it was the primary account, disconnect the legacy field too
        const user = await db.collection('users').findOne({ _id: objectId });
        const remainingAccounts = user?.quickbooksAccounts || [];
        
        if (remainingAccounts.length === 0 || country === 'ZA') {
           await db.collection('users').updateOne(
            { _id: objectId },
            { 
              $set: {
                'quickbooks.isConnected': false,
                'quickbooks.realmId': null,
                'quickbooks.accessToken': null,
                'quickbooks.refreshToken': null,
                'quickbooks.tokenExpiresAt': null,
                'quickbooks.disconnectedAt': new Date(),
              }
            }
          );
        }
      } else {
        // Legacy bulk disconnect
        await db.collection('users').updateOne(
          { _id: objectId },
          { 
            $set: {
              quickbooks: {
                isConnected: false,
                realmId: null,
                accessToken: null,
                refreshToken: null,
                tokenExpiresAt: null,
                disconnectedAt: new Date(),
              }
            },
            $pull: { quickbooksAccounts: {} } as any // Remove all
          }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'QB disconnected successfully',
      });
    }

    if (action === 'refresh-token') {
      const user = await db.collection('users').findOne({ _id: objectId });

      if (!user?.quickbooks?.refreshToken) {
        return NextResponse.json(
          { error: 'QB not connected' },
          { status: 400 }
        );
      }

      // Refresh the token
      const newToken = await refreshAccessToken(user.quickbooks.refreshToken);

      // Update user with new tokens
      const result = await db.collection('users').findOneAndUpdate(
        { _id: objectId },
        {
          $set: {
            'quickbooks.accessToken': newToken.accessToken,
            'quickbooks.refreshToken': newToken.refreshToken,
            'quickbooks.tokenExpiresAt': new Date(Date.now() + newToken.expiresIn * 1000),
          }
        },
        { returnDocument: 'after' }
      );
      
      const updatedDoc = (result as any).value || result;

      return NextResponse.json({
        success: true,
        message: 'Token refreshed',
        expiresAt: updatedDoc?.quickbooks?.tokenExpiresAt,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('QB Auth Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process QB request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
