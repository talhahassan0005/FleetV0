import { NextResponse } from 'next/server';

/**
 * JWT Error Handler
 * Catches any auth-related errors and returns proper JSON response
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error') || 'unknown_error';
  
  console.log('[Auth Error] Caught error:', error);
  
  // Map of common error codes to messages
  const errorMessages: Record<string, string> = {
    'Callback': 'Authentication callback failed',
    'OAuthSignin': 'OAuth signin failed',
    'OAuthCallback': 'OAuth callback failed',
    'OAuthCreateAccount': 'Could not create OAuth account',
    'EmailCreateAccount': 'Could not create email account',
    'Callback': 'Callback error',
    'OAuthAccountNotLinked': 'OAuth account not linked',
    'EmailSignInError': 'Email sign-in failed',
    'CredentialsSignin': 'Invalid credentials',
    'SessionCallback': 'Session callback error',
    'JwtSessionError': 'JWT session error',
    'unknown_error': 'An unknown error occurred',
  };
  
  const message = errorMessages[error] || `Auth error: ${error}`;
  
  return NextResponse.json(
    {
      error: 'Authentication Error',
      code: error,
      message: message,
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

export async function POST(request: Request) {
  return GET(request);
}
