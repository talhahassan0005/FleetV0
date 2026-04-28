'use client'
// src/components/shared/Sidebar.tsx
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/rbac'

const ADMIN_ALL_NAV = [
  { label: 'Dashboard',      href: '/admin/dashboard',              icon: <GridIcon /> },
  { label: 'All Loads',      href: '/admin/loads',                  icon: <TruckIcon /> },
  { label: 'Invoices',       href: '/admin/invoices',               icon: <ReceiptIcon /> },
  { label: 'POD Management', href: '/admin/pod-management-new',     icon: <ReceiptIcon /> },
  { label: 'Users',          href: '/admin/users',                  icon: <UsersIcon /> },
  { label: 'Documents',      href: '/admin/documents',              icon: <DocumentIcon /> },
  { label: 'QuickBooks',     href: '/admin/dashboard/quickbooks',   icon: <QBIcon /> },
  { label: 'My Profile',     href: '/admin/profile',                icon: <UserIcon /> },
]

const ADMIN_NAV_BY_ROLE: Record<string, typeof ADMIN_ALL_NAV> = {
  SUPER_ADMIN: ADMIN_ALL_NAV,
  POD_MANAGER: [
    { label: 'Dashboard',      href: '/admin/dashboard',          icon: <GridIcon /> },
    { label: 'POD Management', href: '/admin/pod-management-new', icon: <ReceiptIcon /> },
    { label: 'My Profile',     href: '/admin/profile',            icon: <UserIcon /> },
  ],
  OPERATIONS_ADMIN: [
    { label: 'Dashboard',      href: '/admin/dashboard',          icon: <GridIcon /> },
    { label: 'All Loads',      href: '/admin/loads',              icon: <TruckIcon /> },
    { label: 'POD Management', href: '/admin/pod-management-new', icon: <ReceiptIcon /> },
    { label: 'My Profile',     href: '/admin/profile',            icon: <UserIcon /> },
  ],
  FINANCE_ADMIN: [
    { label: 'Dashboard',      href: '/admin/dashboard',            icon: <GridIcon /> },
    { label: 'Invoices',       href: '/admin/invoices',             icon: <ReceiptIcon /> },
    { label: 'QuickBooks',     href: '/admin/dashboard/quickbooks', icon: <QBIcon /> },
    { label: 'My Profile',     href: '/admin/profile',              icon: <UserIcon /> },
  ],
}

const navMap: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
  CLIENT: [
    { label: 'Dashboard',  href: '/client/dashboard',      icon: <GridIcon /> },
    { label: 'My Loads',   href: '/client',                icon: <TruckIcon /> },
    { label: 'Post Load',  href: '/client/post-load',      icon: <PlusCircleIcon /> },
    { label: 'Invoices',   href: '/client/invoices',       icon: <ReceiptIcon /> },
    { label: 'Documents',  href: '/client/documents',      icon: <DocumentIcon /> },
    { label: 'Chat',       href: '/client/chat',           icon: <ChatIcon /> },
    { label: 'My Profile', href: '/client/profile',        icon: <UserIcon /> },
  ],
  TRANSPORTER: [
    { label: 'Dashboard',       href: '/transporter/dashboard',  icon: <GridIcon /> },
    { label: 'Available Loads', href: '/transporter/loads',      icon: <TruckIcon /> },
    { label: 'My Quotes',       href: '/transporter/quotes',     icon: <QuoteIcon /> },
    { label: 'Upload POD',      href: '/transporter/upload-pod', icon: <ReceiptIcon /> },
    { label: 'Documents',       href: '/transporter/documents',  icon: <DocumentIcon /> },
    { label: 'Chat',            href: '/transporter/chat',       icon: <ChatIcon /> },
    { label: 'My Profile',      href: '/transporter/profile',    icon: <UserIcon /> },
  ],
}

export function Sidebar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role ?? 'CLIENT'

  // Prevent rendering until session is loaded to avoid flicker
  if (status === 'loading') {
    return (
      <nav className="w-[210px] bg-white/70 backdrop-blur-3xl border-r border-white/40 flex flex-col h-screen sticky top-0 overflow-y-auto hide-scrollbar flex-shrink-0 shadow-[5px_0_30px_rgba(0,0,0,0.08)] z-20">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
        </div>
      </nav>
    )
  }

  let nav
  if (isAdmin(role)) {
    nav = ADMIN_NAV_BY_ROLE[role] ?? ADMIN_ALL_NAV
  } else {
    nav = navMap[role] ?? navMap.CLIENT
  }

  const initials = (session?.user?.companyName ?? 'FX').slice(0, 2).toUpperCase()

  return (
    <nav className="w-[210px] bg-white/70 backdrop-blur-3xl border-r border-white/40 flex flex-col h-screen sticky top-0 overflow-y-auto hide-scrollbar flex-shrink-0 shadow-[5px_0_30px_rgba(0,0,0,0.08)] z-20" style={{animation: 'cardGlow 3s ease-in-out infinite'}}>
      {/* Logo */}
      <div className="flex items-center justify-center px-4 py-5 border-b border-white/30">
        <Image src="/images/logo.png" alt="FleetXchange" width={180} height={60} className="h-14 w-auto" priority />
      </div>

      {/* Nav */}
      <div className="mt-2">
        <div className="text-[8px] uppercase tracking-[2px] text-slate-600/60 font-semibold px-4 py-2">
          {isAdmin(role) ? 'Operations' : role === 'CLIENT' ? 'Client Portal' : 'Transporter Portal'}
        </div>
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`nav-item ${active ? 'active' : ''}`}>
              <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
              <span className={`text-base font-medium ${active ? 'text-[#1a2a5e] font-semibold' : 'text-slate-700'}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="flex-1" />

      {/* User */}
      <div className="mx-4 mb-3 p-3 bg-[#3ab54a]/10 hover:bg-[#3ab54a]/15 transition-colors backdrop-blur-md rounded-xl border border-[#3ab54a]/30 flex items-center gap-3 overflow-hidden relative group" style={{animation: 'cardGlow 3s ease-in-out infinite'}}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3ab54a]/80 to-[#2d9e3c]/80 border-2 border-white/40 flex items-center justify-center font-condensed font-bold text-xs text-white flex-shrink-0 shadow-lg group-hover:border-[#3ab54a]/60 transition-colors" style={{animation: 'bobbing 3s ease-in-out infinite'}}>
          {initials}
        </div>
        <div className="overflow-hidden">
          <div className="text-[12px] font-bold text-[#1a2a5e] truncate tracking-wide">{session?.user?.companyName ?? 'User'}</div>
          <div className="text-[9px] text-[#3ab54a] font-bold uppercase tracking-widest">{role.replace('_', ' ')}</div>
        </div>
      </div>
      <button
        onClick={async () => {
          await signOut({ callbackUrl: '/login', redirect: true })
        }}
        className="mx-4 mb-5 text-[11px] text-[#1a2a5e]/70 bg-white/60 hover:text-[#1a2a5e] font-semibold text-center py-2 border border-slate-300 rounded-xl transition-all hover:bg-[#3ab54a]/10 hover:border-[#3ab54a]/40 shadow-sm uppercase tracking-widest active:scale-95">
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
function ReceiptIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2-2 2 2 0 0 0 2 2m0 0h2"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
}
function QBIcon() {
  return <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><path d="M7 14h4v7H7z"/><path d="M14 14h7v7h-7z"/></svg>
}
