// src/app/transporter/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'

export default async function TransporterLayout({ children }: { children: React.ReactNode }) {
  // Middleware already checked role - just verify session exists
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }
  
  // No role check needed - middleware already verified TRANSPORTER role
  // This prevents double-checking and race conditions
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-y-auto">{children}</div>
    </div>
  )
}
