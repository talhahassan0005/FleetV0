// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role) redirect('/login')
  
  // Redirect based on user role only
  const map: Record<string, string> = { ADMIN: '/admin', CLIENT: '/client/dashboard', TRANSPORTER: '/transporter/dashboard' }
  redirect(map[session.user.role] ?? '/login')
}
