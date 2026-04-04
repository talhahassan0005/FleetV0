'use client'
// src/components/shared/Sidebar.tsx
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const navMap: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard',  icon: <GridIcon /> },
    { label: 'All Loads', href: '/admin/loads',      icon: <TruckIcon /> },
    { label: 'Users',     href: '/admin/users',      icon: <UsersIcon /> },
    { label: 'Verification', href: '/admin/verification', icon: <CheckIcon /> },
    { label: 'Documents', href: '/admin/documents',  icon: <DocumentIcon /> },
    { label: 'My Profile', href: '/admin/profile',   icon: <UserIcon /> },
  ],
  CLIENT: [
    { label: 'Dashboard',  href: '/client/dashboard',      icon: <GridIcon /> },
    { label: 'My Loads',   href: '/client',                icon: <TruckIcon /> },
    { label: 'Post Load',  href: '/client/post-load',      icon: <PlusCircleIcon /> },
    { label: 'Documents',  href: '/client/documents',      icon: <DocumentIcon /> },
    { label: 'Chat',       href: '/client/chat',           icon: <ChatIcon /> },
    { label: 'My Profile', href: '/client/profile',        icon: <UserIcon /> },
  ],
  TRANSPORTER: [
    { label: 'Dashboard',  href: '/transporter/dashboard',  icon: <GridIcon /> },
    { label: 'Available Loads', href: '/transporter/loads', icon: <TruckIcon /> },
    { label: 'My Quotes',  href: '/transporter/quotes',     icon: <QuoteIcon /> },
    { label: 'Documents',  href: '/transporter/documents',  icon: <DocumentIcon /> },
    { label: 'Chat',       href: '/transporter/chat',       icon: <ChatIcon /> },
    { label: 'My Profile', href: '/transporter/profile',    icon: <UserIcon /> },
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
      <div className="flex items-center justify-center px-4 py-5 border-b border-white/10">
        <Image src="/images/logo-white.png" alt="FleetXchange" width={160} height={50} className="h-12 w-auto" priority />
      </div>

      {/* Nav */}
      <div className="mt-2">
        <div className="text-[8px] uppercase tracking-[2px] text-white/40 font-semibold px-4 py-2">
          {role === 'ADMIN' ? 'Operations' : role === 'CLIENT' ? 'Client Portal' : 'Transporter Portal'}
        </div>
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`nav-item ${active ? 'active' : ''}`}>
              <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
              <span className={`text-sm font-medium ${active ? 'text-white font-semibold' : 'text-white/70'}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="flex-1" />

      {/* User */}
      <div className="mx-3 mb-3 p-2.5 bg-white/10 rounded-lg border border-white/20 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#1f7a2b] border-2 border-[#3ab54a] flex items-center justify-center font-condensed font-bold text-xs text-white flex-shrink-0">
          {initials}
        </div>
        <div className="overflow-hidden">
          <div className="text-[11px] font-semibold text-white truncate">{session?.user?.companyName ?? 'User'}</div>
          <div className="text-[9px] text-white/60 uppercase tracking-wide font-medium">{role}</div>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mx-3 mb-3 text-[10px] text-white/70 hover:text-white font-medium text-center py-1.5 border border-white/20 rounded transition-colors hover:bg-white/10">
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
function DocumentIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
}
function ChatIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
function QuoteIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.5-5-7-5s-6 3.75-6 5c0 1 0 7 7 8z"/><path d="M16 8c4-3.5 11-3.5 11 3v7c0 1.25-4.5 5-7 5s-6-3.75-6-5c0-1 0-7 7-8z"/></svg>
}
function CheckIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
