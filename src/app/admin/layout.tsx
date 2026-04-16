// src/app/admin/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login')
  return (
    <div className="flex h-screen relative overflow-hidden" suppressHydrationWarning>
      {/* FleetXchange Portal Background */}
      <div className="absolute inset-0" style={{
        background: '#060e1f',
        backgroundImage: `
          radial-gradient(ellipse 900px 700px at 18% 80%, rgba(26,42,94,0.85) 0%, transparent 70%),
          radial-gradient(ellipse 700px 500px at 85% 10%, rgba(58,181,74,0.07) 0%, transparent 65%),
          radial-gradient(ellipse 500px 400px at 72% 52%, rgba(58,181,74,0.05) 0%, transparent 60%),
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: 'auto, auto, auto, 60px 60px, 60px 60px'
      }}>
        {/* Diagonal slash accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[200%] h-[1px] left-[-50%] top-[38%] bg-gradient-to-r from-transparent via-[#3ab54a]/12 to-transparent" style={{transform: 'rotate(-8deg)'}} />
          <div className="absolute w-[200%] h-[1px] left-[-50%] top-[62%] bg-gradient-to-r from-transparent via-[#3ab54a]/12 to-transparent opacity-50" style={{transform: 'rotate(-8deg)'}} />
        </div>
        
        {/* Top bar accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3ab54a] via-[#3ab54a]/30 to-transparent" />
        
        {/* Watermark logo area */}
        <div className="absolute bottom-12 left-14 opacity-[0.18] pointer-events-none">
          <div className="text-white/20 text-xs font-bold tracking-[4px] uppercase">FleetXchange Portal</div>
          <div className="text-[#3ab54a]/25 text-[10px] tracking-[2px] uppercase mt-1">Africa Logistics Network</div>
        </div>
        
        {/* Tagline */}
        <div className="absolute bottom-12 right-14 text-right pointer-events-none">
          <div className="text-white/15 text-xs font-bold tracking-[4px] uppercase">Connecting Africa</div>
          <div className="text-[#3ab54a]/25 text-[10px] tracking-[2px] uppercase mt-1">Freight Solutions</div>
        </div>
      </div>

      <div className="relative z-10 flex w-full h-full">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full overflow-y-auto backdrop-blur-[2px]">{children}</div>     
      </div>
    </div>
  )
}
