// src/app/dashboard/page.tsx
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/jwt-utils'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const _cookies = await cookies()
  const _token = _cookies.get('accessToken')?.value
  const user = _token ? verifyAccessToken(_token) : null
  if (!user?.role) redirect('/login')
  
  // Redirect based on user role only
  const map: Record<string, string> = { ADMIN: '/admin', CLIENT: '/client/dashboard', TRANSPORTER: '/transporter/dashboard' }
  redirect(map[user.role] ?? '/login')
}
