'use client'
import { usePathname } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'

interface DecodedToken {
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

export function getRoleFromPath(pathname: string): string {
  if (pathname.startsWith('/admin')) return 'ADMIN'
  if (pathname.startsWith('/client')) return 'CLIENT'
  if (pathname.startsWith('/transporter')) return 'TRANSPORTER'
  return 'CLIENT'
}

export function getCompanyInitials(companyName?: string): string {
  if (!companyName) return 'FX'
  return companyName.slice(0, 2).toUpperCase()
}

export function getTokenData(): DecodedToken | null {
  try {
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
    
    const token = Cookies.get(cookieName)
    if (!token) return null
    
    const decoded = jwtDecode<DecodedToken>(token)
    return decoded
  } catch (error) {
    console.error('[getTokenData] Error decoding token:', error)
    return null
  }
}
