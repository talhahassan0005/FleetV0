// src/components/ui/index.tsx
import { statusLabel, statusColor } from '@/lib/utils'

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${statusColor(status)}`}>
      {statusLabel(status)}
    </span>
  )
}

export function Topbar({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="bg-[#142047] border-b-[3px] border-[#3ab54a] h-14 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="font-condensed font-bold text-lg text-white uppercase tracking-wide">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  return <div className="p-6 flex-1 overflow-y-auto">{children}</div>
}

export function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded border-b-[3px] border-[#3ab54a] p-4 shadow-sm">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-500 mb-1">{label}</div>
      <div className="font-condensed font-bold text-3xl text-[#1a2a5e]">{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function TableHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="table-header">
      <span className="table-title">{title}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

export function DocItem({ name, type, role, url }: { name: string; type: string; role: string; url?: string }) {
  return (
    <div className="flex items-center gap-2 p-2.5 border border-gray-200 border-l-[3px] border-l-[#3ab54a] rounded mb-2">
      <div className="w-7 h-7 bg-gray-50 rounded flex items-center justify-center flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-[#3ab54a]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-navy truncate">{name}</div>
        <div className="text-[10px] text-gray-400">{type.toUpperCase()} · {role}</div>
      </div>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-navy text-[10px] px-2 py-1">View</a>
      )}
    </div>
  )
}

export function Timeline({ updates }: { updates: { message: string; createdAt: Date; user?: { companyName?: string | null } | null }[] }) {
  return (
    <div className="space-y-0">
      {[...updates].reverse().map((u, i) => (
        <div key={i} className="flex gap-2.5 pb-3 relative">
          {i < updates.length - 1 && (
            <div className="absolute left-[4px] top-3 w-0.5 h-full bg-gray-200 z-0" />
          )}
          <div className="tl-dot" />
          <div>
            <div className="text-xs font-medium text-navy">{u.message}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {new Date(u.createdAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
              {u.user?.companyName ? ` · ${u.user.companyName}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
