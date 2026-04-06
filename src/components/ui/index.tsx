// src/components/ui/index.tsx
import { statusLabel, statusColor } from '@/lib/utils'
export {
  Skeleton,
  LoadTableSkeleton,
  DashboardCardsSkeleton,
  ChartSkeleton,
  LoadDetailSkeleton,
  DocumentsTableSkeleton,
  ProfileSkeleton,
} from './skeletons'

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${statusColor(status)}`}>
      {statusLabel(status)}
    </span>
  )
}

export function Topbar({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="bg-white/70 backdrop-blur-3xl border-b border-white/40 h-16 flex items-center justify-between px-6 flex-shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.08)] sticky top-0 z-40" style={{animation: 'cardGlow 3s ease-in-out infinite'}}>
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-[#3ab54a] rounded-full shadow-[0_0_10px_rgba(58,181,74,0.6)] flex-shrink-0" style={{animation: 'bobbing 3s ease-in-out infinite'}} />
        <h1 className="font-condensed font-bold text-xl text-[#1a2a5e] uppercase tracking-wide">{title}</h1>
      </div>
      <div className="flex items-center gap-4">{children}</div>
    </div>
  )
}

export function PageLayout({ children }: { children: React.ReactNode }) {       
  return <div className="p-6 lg:p-8 flex-1 overflow-y-auto relative z-10 hide-scrollbar">{children}</div>
}

export function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white/85 backdrop-blur-3xl rounded-2xl border-2 border-white/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_rgba(58,181,74,0.15)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{animation: 'cardGlow 3s ease-in-out infinite'}}>
      {/* Animated top border glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3ab54a] to-[#2d9e3c] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      {/* Animated background orb */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#3ab54a]/15 rounded-full blur-2xl group-hover:bg-[#3ab54a]/25 transition-all duration-500" />
      {/* Border glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#3ab54a]/25 via-blue-400/10 to-[#3ab54a]/20 rounded-2xl -z-10" style={{animation: 'borderGlow 3s ease-in-out infinite'}} />
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#3ab54a] mb-1.5 relative z-10">{label}</div>
      <div className="font-condensed font-bold text-4xl bg-gradient-to-r from-[#1a2a5e] to-[#3ab54a] bg-clip-text text-transparent relative z-10">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1.5 relative z-10 font-medium">{sub}</div>}
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
