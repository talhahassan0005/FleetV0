import { NextRequest } from 'next/server';
import { verifyAccessToken, JWTPayload } from './jwt-utils';

/**
 * Get authenticated user from request cookies or Authorization header
 * Use this in API routes to verify JWT authentication
 */
export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    let accessToken = request.cookies.get('accessToken')?.value;

    // If no token in cookies, try Authorization header
    if (!accessToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    if (!accessToken) {
      return null;
    }

    // Verify and decode token
    const user = verifyAccessToken(accessToken);

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('[Auth] Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: JWTPayload | null): boolean {
  if (!user) return false;
  
  const ADMIN_ROLES = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'POD_MANAGER', 'ADMIN'];
  return ADMIN_ROLES.includes(user.role);
}

/**
 * Check if user has specific admin role
 */
export function hasAdminRole(user: JWTPayload | null, role: string): boolean {
  if (!user) return false;
  return user.adminRole === role;
}

/**
 * Check if user is verified
 */
export function isVerified(user: JWTPayload | null): boolean {
  if (!user) return false;
  return user.isVerified === true;
}

/**
 * Get user from Authorization header (Bearer token)
 * Alternative to cookie-based auth for API clients
 */
export function getAuthUserFromHeader(request: NextRequest): JWTPayload | null {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = verifyAccessToken(token);

    return user;
  } catch (error) {
    console.error('[Auth] Error getting user from header:', error);
    return null;
  }
}

/**
 * Get user from either cookie or Authorization header
 */
export async function getAuthUserFlexible(request: NextRequest): Promise<JWTPayload | null> {
  // Try cookie first
  let user = await getAuthUser(request);
  
  // If not found, try Authorization header
  if (!user) {
    user = getAuthUserFromHeader(request);
  }
  
  return user;
}