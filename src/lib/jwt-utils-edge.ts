/**
 * Edge Runtime Compatible JWT Utilities
 * Uses Web Crypto API instead of Node.js crypto
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ACCESS_EXPIRY = '2h'; // 2 hours
const JWT_REFRESH_EXPIRY = '7d'; // 7 days

interface JWTPayload {
  id: string;
  email: string;
  name?: string;
  role: string;
  adminRole?: string;
  companyName?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  verificationComment?: string;
  exp?: number;
  iat?: number;
}

// Base64 URL encoding/decoding
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

// Convert string to ArrayBuffer
function str2ab(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// HMAC SHA256 signature using Web Crypto API
async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray));
  
  return signatureBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Generate JWT token
export async function generateAccessTokenEdge(payload: Omit<JWTPayload, 'exp' | 'iat'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 2 * 60 * 60; // 2 hours

  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = await hmacSha256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function generateRefreshTokenEdge(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 7 * 24 * 60 * 60; // 7 days

  const payload = {
    id: userId,
    type: 'refresh',
    iat: now,
    exp,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signature = await hmacSha256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify JWT token
export async function verifyAccessTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = await hmacSha256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: JWTPayload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export async function verifyRefreshTokenEdge(token: string): Promise<{ id: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = await hmacSha256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: any = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Check if it's a refresh token
    if (payload.type !== 'refresh') {
      return null;
    }

    return { id: payload.id };
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return null;
  }
}
