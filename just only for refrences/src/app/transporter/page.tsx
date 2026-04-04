// src/app/transporter/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Topbar, PageLayout, StatusBadge } from '@/components/ui'
import { TransporterQuoteForm } from '@/components/transporter/TransporterQuoteForm'
import Link from 'next/link'

export default async function TransporterDashboard() {
  const session = await getServerSession(authOptions)

  const [available, myLoads, myQuotes] = await Promise.all([
    prisma.load.findMany({
      where: { status: 'QUOTING' },
      include: { client: { select: { companyName: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.load.findMany({
      where: { assignedTransporterId: session!.user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quote.findMany({
      where: { transporterId: session!.user.id },
      select: { loadId: true },
    }),
  ])

  const quotedIds = new Set(myQuotes.map(q => q.loadId))

  return (
    <>
      <Topbar title="Dashboard" />
      <PageLayout>
        {!session?.user.isVerified && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded text-amber-800 text-sm">
            ⏳ Account pending verification. You'll see available loads once FleetXchange verifies you.
          </div>
        )}

        {/* Available loads */}
        {available.length > 0 && (
          <div className="card mb-4">
            <div className="table-header">
              <span className="table-title">Available Loads ({available.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>{['Ref', 'Route', 'Cargo', 'Collection', 'Deadline', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">{h}</th>
                ))}</tr></thead>
                <tbody>
                  {available.map(load => (
                    <tr key={load.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-condensed font-bold text-[#1a2a5e] text-sm">{load.ref}</td>
                      <td className="px-4 py-3 text-xs">{load.origin} <span className="text-[#3ab54a] font-bold">→</span> {load.destination}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{load.cargoType ?? '—'}{load.weight ? ` · ${load.weight}t` : ''}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{load.collectionDate ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{load.deliveryDate ?? '—'}</td>
                      <td className="px-4 py-3">
                        {quotedIds.has(load.id)
                          ? <span className="badge bg-green-50 text-green-700 border-green-200">Quoted</span>
                          : <TransporterQuoteForm loadId={load.id} currency={load.currency} />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* My assigned loads */}
        <div className="card">
          <div className="table-header"><span className="table-title">My Assigned Loads ({myLoads.length})</span></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>{['Ref', 'Route', 'Collection', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">{h}</th>
              ))}</tr></thead>
              <tbody>
                {myLoads.map(load => (
                  <tr key={load.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-condensed font-bold text-[#1a2a5e] text-sm">{load.ref}</td>
                    <td className="px-4 py-3 text-xs">{load.origin} <span className="text-[#3ab54a] font-bold">→</span> {load.destination}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{load.collectionDate ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={load.status} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/transporter/loads/${load.id}`} className="btn-navy text-[10px] px-2 py-1">Manage</Link>
                    </td>
                  </tr>
                ))}
                {myLoads.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No assigned loads yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
