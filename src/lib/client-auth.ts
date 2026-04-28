'use client'
import { usePathname } from 'next/navigation'

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
