// src/app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { Topbar, PageLayout, StatCard } from '@/components/ui'
import { StatusBadge } from '@/components/ui'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const db = await getDatabase()

  const [total, pending, active, delivered, recentLoads] = await Promise.all([
    db.collection('loads').countDocuments(),
    db.collection('loads').countDocuments({ status: { $in: ['PENDING', 'QUOTING', 'QUOTED', 'APPROVED'] } }),
    db.collection('loads').countDocuments({ status: 'IN_TRANSIT' }),
    db.collection('loads').countDocuments({ status: 'DELIVERED' }),
    db.collection('loads').find({}).sort({ createdAt: -1 }).limit(10).toArray(),
  ])

  return (
    <>
      <Topbar title="Dashboard" />
      <PageLayout>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="Total Loads"  value={total}     sub="All time" />
          <StatCard label="Needs Action" value={pending}   sub="Pending / Quoting" />
          <StatCard label="In Transit"   value={active}    sub="Active now" />
          <StatCard label="Delivered"    value={delivered} sub="Completed" />
        </div>

        <div className="card">
          <div className="table-header">
            <span className="table-title">Recent Loads</span>
            <Link href="/admin/loads" className="btn-outline-fx text-[10px] px-2 py-1">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Ref', 'Route', 'Client', 'Collection', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLoads.map(load => (
                  <tr key={load.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-condensed font-bold text-[#1a2a5e] text-sm tracking-wide">{load.ref}</td>
                    <td className="px-4 py-3 text-xs">{load.origin} <span className="text-[#3ab54a] font-bold">→</span> {load.destination}</td>
                    <td className="px-4 py-3 text-xs">{load.client?.companyName ?? 'N/A'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{load.collectionDate ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={load.status} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/loads/${load.id}`} className="btn-navy text-[10px] px-2 py-1">Manage</Link>
                    </td>
                  </tr>
                ))}
                {recentLoads.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No loads yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
