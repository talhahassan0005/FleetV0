// src/app/client/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Topbar, PageLayout, StatusBadge } from '@/components/ui'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions)
  const loads = await prisma.load.findMany({
    where: { clientId: session!.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Topbar title="My Loads">
        <Link href="/client/post-load" className="btn-fx text-xs">+ Post Load</Link>
      </Topbar>
      <PageLayout>
        {!session?.user.isVerified && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded text-amber-800 text-sm">
            ⏳ Your account is pending verification by FleetXchange. You'll be able to post loads once verified.
          </div>
        )}

        <div className="card">
          <div className="table-header">
            <span className="table-title">My Loads ({loads.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>{['Ref', 'Route', 'Cargo', 'Collection', 'Price', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loads.map(load => (
                  <tr key={load.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-condensed font-bold text-[#1a2a5e] text-sm">{load.ref}</td>
                    <td className="px-4 py-3 text-xs">{load.origin} <span className="text-[#3ab54a] font-bold">→</span> {load.destination}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{load.cargoType ?? '—'}{load.weight ? ` · ${load.weight}t` : ''}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{load.collectionDate ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {load.finalPrice
                        ? <strong className="text-[#1a2a5e]">{formatCurrency(load.finalPrice, load.currency)}</strong>
                        : <span className="text-gray-300 text-[10px]">Awaiting quote</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={load.status} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/client/loads/${load.id}`} className="btn-navy text-[10px] px-2 py-1">View</Link>
                    </td>
                  </tr>
                ))}
                {loads.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center">
                    <div className="text-sm text-gray-400 mb-2">No loads yet.</div>
                    <Link href="/client/post-load" className="btn-fx text-xs">Post your first load →</Link>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
