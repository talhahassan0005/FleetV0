'use client'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

export interface TokenData {
  id: string
  email: string
  role: string
  adminRole?: string
  companyName: string
  isVerified: boolean
  verificationStatus?: string
  iat: number
  exp: number
}

// Get token from cookie
export function getToken(): string | null {
  const cookieName = process.env.NODE_ENV === 'production' 
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'
  
  return Cookies.get(cookieName) || null
}

// Decode token and get user data
export function getTokenData(): TokenData | null {
  try {
    const token = getToken()
    if (!token) {
      console.log('[Token] ❌ No token found')
      return null
    }
    
    const decoded = jwtDecode<TokenData>(token)
    console.log('[Token] ✅ Decoded:', {
      id: decoded.id,
      role: decoded.role,
      companyName: decoded.companyName
    })
    return decoded
  } catch (error) {
    console.error('[Token] ❌ Decode error:', error)
    return null
  }
}

// Get user ID from token
export function getUserId(): string | null {
  const data = getTokenData()
  return data?.id || null
}

// Get user role from token
export function getUserRole(): string | null {
  const data = getTokenData()
  return data?.role || null
}

// Get company name from token
export function getCompanyName(): string | null {
  const data = getTokenData()
  return data?.companyName || null
}

// Get role from URL path (for sidebar)
export function getRoleFromPath(pathname: string): string {
  if (pathname.startsWith('/admin')) return 'ADMIN'
  if (pathname.startsWith('/client')) return 'CLIENT'
  if (pathname.startsWith('/transporter')) return 'TRANSPORTER'
  return 'CLIENT'
}

// Get company initials
export function getCompanyInitials(companyName?: string): string {
  if (!companyName) return 'FX'
  return companyName.slice(0, 2).toUpperCase()
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getToken() !== null
}

// Clear token (logout)
export function clearToken(): void {
  const cookieName = process.env.NODE_ENV === 'production' 
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'
  
  Cookies.remove(cookieName)
  console.log('[Token] 🗑️ Token cleared')
}
