// src/app/admin/loads/page.tsx
import { prisma } from '@/lib/prisma'
import { Topbar, PageLayout, StatusBadge } from '@/components/ui'
import Link from 'next/link'

const STATUSES = ['', 'PENDING', 'QUOTING', 'QUOTED', 'APPROVED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
const STATUS_LABELS: Record<string, string> = {
  '': 'All', PENDING: 'Pending', QUOTING: 'Quoting', QUOTED: 'Quoted',
  APPROVED: 'Approved', ASSIGNED: 'Assigned', IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
}

export default async function AdminLoadsPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status ?? ''
  const loads = await prisma.load.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      client:              { select: { companyName: true } },
      assignedTransporter: { select: { companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Topbar title="All Loads">
        <Link href="/admin/loads/new" className="btn-fx text-xs">+ New Load</Link>
      </Topbar>
      <PageLayout>
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUSES.map(s => (
            <Link key={s} href={`/admin/loads${s ? `?status=${s}` : ''}`}
              className={`px-3 py-1 rounded text-[10px] font-semibold uppercase tracking-wide transition-colors ${status === s ? 'bg-[#1a2a5e] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#1a2a5e] hover:text-[#1a2a5e]'}`}>
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        <div className="card">
          <div className="table-header"><span className="table-title">Loads ({loads.length})</span></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>{['Ref', 'Route', 'Client', 'Cargo', 'Collection', 'Transporter', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loads.map(load => (
                  <tr key={load.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-condensed font-bold text-[#1a2a5e] text-sm">{load.ref}</td>
                    <td className="px-4 py-3 text-xs">{load.origin} <span className="text-[#3ab54a] font-bold">→</span> {load.destination}</td>
                    <td className="px-4 py-3 text-xs">{load.client.companyName}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{load.cargoType ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{load.collectionDate ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">{load.assignedTransporter?.companyName ?? <span className="text-gray-300">Unassigned</span>}</td>
                    <td className="px-4 py-3"><StatusBadge status={load.status} /></td>
                    <td className="px-4 py-3"><Link href={`/admin/loads/${load.id}`} className="btn-navy text-[10px] px-2 py-1">Manage</Link></td>
                  </tr>
                ))}
                {loads.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No loads found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
