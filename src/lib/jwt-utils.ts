import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
const TOKEN_EXPIRY = '2h'; // 2 hours
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  adminRole?: string;
  companyName?: string;
  isVerified: boolean;
  verificationStatus?: string;
  verificationComment?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate Access Token (2 hours expiry)
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    algorithm: 'HS256',
  });
}

/**
 * Generate Refresh Token (7 days expiry)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256',
    }
  );
}

/**
 * Verify and Decode Access Token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return decoded as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify and Decode Refresh Token
 */
export function verifyRefreshToken(token: string): { id: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return decoded as { id: string; type: string };
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
}

/**
 * Get time until token expires (in seconds)
 */
export function getTokenExpiryTime(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return null;
    const expiresIn = decoded.exp * 1000 - Date.now();
    return Math.max(0, Math.floor(expiresIn / 1000));
  } catch (error) {
    return null;
  }
}
