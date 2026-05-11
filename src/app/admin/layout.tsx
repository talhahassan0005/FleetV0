// src/app/admin/layout.tsx
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/jwt-utils'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'

const ADMIN_ROLES = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'POD_MANAGER']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const _cookies = await cookies()
  const _token = _cookies.get('accessToken')?.value
  const user = _token ? verifyAccessToken(_token) : null
  if (!user || !ADMIN_ROLES.includes(user.role)) redirect('/login')
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-y-auto">{children}</div>
    </div>
  )
}
