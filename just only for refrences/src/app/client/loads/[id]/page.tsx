// src/app/client/loads/[id]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { Topbar, PageLayout, StatusBadge, DocItem, Timeline } from '@/components/ui'
import { ClientLoadActions } from '@/components/client/ClientLoadActions'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function ClientLoadDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const load = await prisma.load.findUnique({
    where: { id: params.id },
    include: {
      assignedTransporter: { select: { companyName: true, phone: true } },
      updates:             { orderBy: { createdAt: 'asc' } },
      documents:           true,
      invoices:            true,
      trackingLinks:       { where: { isActive: true }, take: 1 },
    },
  })

  if (!load || load.clientId !== session.user.id) notFound()

  const clientDocs  = load.documents.filter(d => d.visibleTo.includes('CLIENT'))
  const activeTrack = load.trackingLinks[0] ?? null

  return (
    <>
      <Topbar title={load.ref}>
        <Link href="/client" className="btn-outline-fx text-xs">← My Loads</Link>
      </Topbar>
      <PageLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4">

            {/* Load summary */}
            <div className="card">
              <div className="table-header">
                <span className="table-title">{load.origin} → {load.destination}</span>
                <StatusBadge status={load.status} />
              </div>
              <div className="card-body grid grid-cols-2 gap-4">
                {[
                  ['Cargo',         `${load.cargoType ?? '—'}${load.weight ? ` · ${load.weight} tons` : ''}`],
                  ['Collection',    load.collectionDate ?? '—'],
                  ['Deliver By',    load.deliveryDate   ?? '—'],
                  ['Transporter',   load.assignedTransporter?.companyName ?? 'Being arranged'],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">{label}</div>
                    <div className="text-sm font-medium text-[#1a2a5e] mt-0.5">{value}</div>
                  </div>
                ))}
                {load.specialInstructions && (
                  <div className="col-span-2">
                    <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Instructions</div>
                    <div className="text-sm text-[#1a2a5e] mt-0.5">{load.specialInstructions}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quote approval banner */}
            {load.status === 'QUOTED' && load.finalPrice && (
              <div className="card border-2 border-[#3ab54a]">
                <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                  <div className="font-condensed font-bold text-sm text-[#1a2a5e] uppercase tracking-wide">Quote Ready for Approval</div>
                </div>
                <div className="card-body">
                  <div className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-gray-400">Total Price</div>
                  <div className="font-condensed font-bold text-2xl text-[#3ab54a] mb-1">{formatCurrency(load.finalPrice, load.currency)}</div>
                  <div className="text-[10px] text-gray-400 mb-4">Includes all FleetXchange service fees.</div>
                  <ClientLoadActions loadId={load.id} action="approveQuote" />
                </div>
              </div>
            )}

            {/* Live tracking */}
            {activeTrack && (
              <div className="card border-2 border-[#3ab54a]">
                <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center justify-between">
                  <div className="font-condensed font-bold text-sm text-[#1a2a5e] uppercase tracking-wide">Live Tracking Available</div>
                  <span className="w-2 h-2 rounded-full bg-[#3ab54a] animate-pulse"/>
                </div>
                <div className="card-body">
                  <p className="text-xs text-gray-500 mb-3">Your shipment is being tracked in real time.</p>
                  <a href={`/track/${activeTrack.token}`} target="_blank" rel="noopener noreferrer"
                    className="btn-fx text-xs block text-center py-2">
                    Open Live Tracking →
                  </a>
                  <p className="text-[10px] text-gray-400 text-center mt-2">This link expires automatically after delivery.</p>
                </div>
              </div>
            )}

            {/* Documents + Invoice */}
            <div className="card">
              <div className="table-header"><span className="table-title">Documents & Invoice</span></div>
              <div className="card-body">
                {clientDocs.length === 0 && <p className="text-sm text-gray-400 mb-4">No documents yet.</p>}
                {clientDocs.map(doc => (
                  <DocItem key={doc.id} name={doc.originalName} type={doc.docType} role={doc.uploadedByRole} url={doc.fileUrl ?? undefined}/>
                ))}

                {load.invoices.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 border-l-4 border-l-[#3ab54a] rounded mb-2">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[#1a2a5e]">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-gray-500">{formatCurrency(inv.amount, inv.currency)} · {new Date(inv.issuedAt).toLocaleDateString('en-ZA')}</div>
                    </div>
                    <span className={`badge ${inv.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{inv.status}</span>
                    {inv.fileUrl && (
                      <a href={inv.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-fx text-[10px] px-2 py-1">Download PDF</a>
                    )}
                  </div>
                ))}

                {/* Upload additional docs */}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <ClientLoadActions loadId={load.id} action="uploadDoc" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Timeline */}
          <div className="card h-fit">
            <div className="table-header"><span className="table-title">Updates</span></div>
            <div className="card-body">
              {load.updates.length > 0
                ? <Timeline updates={load.updates} />
                : <p className="text-sm text-gray-400">No updates yet.</p>}
            </div>
          </div>

        </div>
      </PageLayout>
    </>
  )
}
