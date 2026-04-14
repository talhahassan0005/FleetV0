'use client'
// src/components/shared/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const navMap: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/admin',        icon: <GridIcon /> },
    { label: 'All Loads', href: '/admin/loads',  icon: <TruckIcon /> },
    { label: 'Users',     href: '/admin/users',  icon: <UsersIcon /> },
  ],
  CLIENT: [
    { label: 'My Loads',    href: '/client',           icon: <GridIcon /> },
    { label: 'Post a Load', href: '/client/post-load', icon: <PlusCircleIcon /> },
    { label: 'My Profile',  href: '/client/profile',   icon: <UserIcon /> },
  ],
  TRANSPORTER: [
    { label: 'Dashboard',  href: '/transporter',         icon: <GridIcon /> },
    { label: 'My Profile', href: '/transporter/profile', icon: <UserIcon /> },
  ],
}

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role ?? 'CLIENT'
  const nav = navMap[role] ?? navMap.CLIENT
  const initials = (session?.user?.companyName ?? 'FX').slice(0, 2).toUpperCase()

  return (
    <nav className="w-[210px] bg-[#0d1535] flex flex-col min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 flex-shrink-0">
          <svg viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="6" fill="#1a2a5e"/>
            <path d="M10 10 L20 20 L10 30" stroke="#3ab54a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M30 10 L20 20 L30 30" stroke="#3ab54a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="14" y1="4" x2="28" y2="36" stroke="#2d9e3c" strokeWidth="3.5" strokeLinecap="round" opacity={0.7}/>
          </svg>
        </div>
        <div>
          <div className="font-condensed font-bold text-[17px] text-white leading-none tracking-wide">
            FLEET<span className="text-[#3ab54a]">X</span>CHANGE
          </div>
          <div className="text-[8px] uppercase tracking-[1.5px] text-white/30 mt-0.5">
            Africa's Largest Freight Hub
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="mt-2">
        <div className="text-[8px] uppercase tracking-[2px] text-white/25 font-semibold px-4 py-2">
          {role === 'ADMIN' ? 'Operations' : role === 'CLIENT' ? 'Client Portal' : 'Transporter Portal'}
        </div>
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`nav-item ${active ? 'active' : ''}`}>
              <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="flex-1" />

      {/* User */}
      <div className="mx-3 mb-3 p-2.5 bg-white/5 rounded-lg border border-white/8 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#1f7a2b] border-2 border-[#3ab54a] flex items-center justify-center font-condensed font-bold text-xs text-white flex-shrink-0">
          {initials}
        </div>
        <div className="overflow-hidden">
          <div className="text-[11px] font-medium text-white truncate">{session?.user?.companyName ?? 'User'}</div>
          <div className="text-[9px] text-white/30 uppercase tracking-wide">{role}</div>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mx-3 mb-3 text-[10px] text-white/25 hover:text-white/50 text-center py-1.5 border border-white/8 rounded transition-colors">
        Sign out
      </button>
    </nav>
  )
}

// Icons
function GridIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
}
function TruckIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
}
function UsersIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function PlusCircleIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
}
function UserIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
