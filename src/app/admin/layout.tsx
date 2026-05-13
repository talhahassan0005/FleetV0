// src/app/admin/layout.tsx
// Auth is already handled by middleware.ts for all /admin/* routes
// No need to re-verify token here — doing so causes a flash/redirect to /login
// on every client-side navigation because server re-runs this layout
import { Sidebar } from '@/components/shared/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-y-auto">{children}</div>
    </div>
  )
}