// src/app/admin/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login')
  return (
    <div className="flex h-screen relative overflow-hidden bg-slate-50" suppressHydrationWarning>
      {/* Simple Light Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-50" />
      
      {/* Animated Background Elements - Light Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Orb 1 - Green Accent */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-[#3ab54a]/15 to-transparent rounded-full filter blur-3xl opacity-40" style={{animation: 'float 8s ease-in-out infinite'}} />
        
        {/* Orb 2 - Blue Accent */}
        <div className="absolute bottom-32 right-20 w-80 h-80 bg-gradient-to-br from-blue-400/12 to-transparent rounded-full filter blur-3xl opacity-30" style={{animation: 'float 10s ease-in-out infinite 1s'}} />
        
        {/* Orb 3 - Accent Green */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-[#3ab54a]/10 to-transparent rounded-full filter blur-3xl opacity-25" style={{animation: 'float 12s ease-in-out infinite 2s'}} />
      </div>

      <div className="relative z-10 flex w-full h-full">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full overflow-y-auto">{children}</div>     
      </div>
    </div>
  )
}
