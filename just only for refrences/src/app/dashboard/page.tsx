// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const map: Record<string, string> = { ADMIN: '/admin', CLIENT: '/client', TRANSPORTER: '/transporter' }
  redirect(map[session.user.role] ?? '/login')
}
