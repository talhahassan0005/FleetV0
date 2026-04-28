// src/app/client/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  console.log('[ClientLayout] Session check:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userRole: session?.user?.role,
    userEmail: session?.user?.email
  })
  
  // Double-check: Ensure user has valid session and CLIENT role
  if (!session?.user) {
    console.log('[ClientLayout] No session - redirecting to login')
    redirect('/login')
  }
  
  if (session.user.role !== 'CLIENT') {
    console.log('[ClientLayout] ❌ Non-client role detected:', session.user.role, '- redirecting to login')
    redirect('/login')
  }
  
  console.log('[ClientLayout] ✅ Client access granted')
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-y-auto">{children}</div>
    </div>
  )
}
