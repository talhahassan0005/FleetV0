// src/app/transporter/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'
import { SessionBoundary } from '@/components/shared/SessionBoundary'

export default async function TransporterLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'TRANSPORTER') redirect('/login')
  
  return (
    <SessionBoundary>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full overflow-y-auto">{children}</div>
      </div>
    </SessionBoundary>
  )
}
