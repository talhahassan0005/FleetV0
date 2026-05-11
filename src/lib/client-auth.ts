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

// Get access token from cookie
export function getToken(): string | null {
  return Cookies.get('accessToken') || null
}

// Get refresh token from cookie (usually httpOnly, but can check)
export function getRefreshToken(): string | null {
  return Cookies.get('refreshToken') || null
}

// Decode token and get user data
export function getTokenData(): TokenData | null {
  try {
    const token = getToken()
    if (!token) {
      console.log('[Token] ❌ No access token found')
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

// Check if token is expired
export function isTokenExpired(): boolean {
  const data = getTokenData()
  if (!data || !data.exp) return true
  
  // exp is in seconds, Date.now() is in milliseconds
  return Date.now() >= data.exp * 1000
}

// Clear tokens (logout)
export function clearToken(): void {
  Cookies.remove('accessToken')
  Cookies.remove('refreshToken')
  console.log('[Token] 🗑️ Tokens cleared')
}

// Set access token
export function setToken(accessToken: string): void {
  Cookies.set('accessToken', accessToken, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: 1/12 // 2 hours (1/12 of a day)
  })
}

// Refresh access token using refresh token
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/jwt-refresh', {
      method: 'POST',
      credentials: 'include', // Important: include cookies
    })

    if (!response.ok) {
      console.error('[Token] ❌ Refresh failed:', response.status)
      return false
    }

    const data = await response.json()
    
    if (data.accessToken) {
      setToken(data.accessToken)
      console.log('[Token] ✅ Token refreshed')
      return true
    }

    return false
  } catch (error) {
    console.error('[Token] ❌ Refresh error:', error)
    return false
  }
}