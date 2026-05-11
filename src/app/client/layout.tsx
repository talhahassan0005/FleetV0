// src/app/client/layout.tsx
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/jwt-utils'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const _cookies = await cookies()
  const _token = _cookies.get('accessToken')?.value
  const user = _token ? verifyAccessToken(_token) : null
  if (!user || user.role !== 'CLIENT') redirect('/login')
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-y-auto">{children}</div>
    </div>
  )
}
