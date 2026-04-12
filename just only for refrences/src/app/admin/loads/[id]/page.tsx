// src/app/admin/loads/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Topbar, PageLayout, StatusBadge, DocItem, Timeline } from '@/components/ui'
import { AdminLoadActions } from '@/components/admin/AdminLoadActions'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function AdminLoadDetailPage({ params }: { params: { id: string } }) {
  const [load, transporters] = await Promise.all([
    prisma.load.findUnique({
      where: { id: params.id },
      include: {
        client:              { select: { id: true, companyName: true, contactName: true, phone: true, email: true } },
        assignedTransporter: { select: { id: true, companyName: true, phone: true } },
        quotes:              { include: { transporter: { select: { id: true, companyName: true, phone: true } } } },
        updates:             { include: { user: { select: { companyName: true } } }, orderBy: { createdAt: 'asc' } },
        documents:           true,
        invoices:            true,
        trackingLinks:       { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    prisma.user.findMany({ where: { role: 'TRANSPORTER', isVerified: true }, orderBy: { companyName: 'asc' } }),
  ])

  if (!load) notFound()

  const activeTracking = load.trackingLinks[0]?.isActive ? load.trackingLinks[0] : null

  return (
    <>
      <Topbar title={load.ref}>
        <Link href="/admin/loads" className="btn-outline-fx text-xs">← Back to Loads</Link>
      </Topbar>
      <PageLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT — main info */}
          <div className="lg:col-span-2 space-y-4">

            {/* Load Info */}
            <div className="card">
              <div className="table-header">
                <span className="table-title">{load.origin} → {load.destination}</span>
                <StatusBadge status={load.status} />
              </div>
              <div className="card-body grid grid-cols-2 gap-4">
                {[
                  ['Client',        load.client.companyName],
                  ['Contact',       `${load.client.contactName ?? '—'} · ${load.client.phone ?? '—'}`],
                  ['Cargo',         `${load.cargoType ?? '—'}${load.weight ? ` · ${load.weight} tons` : ''}`],
                  ['Collection',    load.collectionDate ?? '—'],
                  ['Deliver By',    load.deliveryDate ?? '—'],
                  ['Final Price',   load.finalPrice ? formatCurrency(load.finalPrice, load.currency) : '—'],
                  ['Transporter',   load.assignedTransporter?.companyName ?? 'Unassigned'],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">{label}</div>
                    <div className="text-sm font-medium text-[#1a2a5e] mt-0.5">{value}</div>
                  </div>
                ))}
                {load.specialInstructions && (
                  <div className="col-span-2">
                    <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Special Instructions</div>
                    <div className="text-sm text-[#1a2a5e] mt-0.5">{load.specialInstructions}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quotes */}
            <div className="card">
              <div className="table-header">
                <span className="table-title">Transporter Quotes ({load.quotes.length})</span>
                {load.status === 'PENDING' && (
                  <AdminLoadActions loadId={load.id} action="release" label="Release to Transporters" className="btn-outline-fx text-[10px] px-2 py-1"/>
                )}
              </div>
              {load.quotes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr>{['Transporter', 'Phone', 'Price', 'Notes', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-[9px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">{h}</th>
                    ))}</tr></thead>
                    <tbody>
                      {load.quotes.map(q => (
                        <tr key={q.id} className="border-b border-gray-100">
                          <td className="px-4 py-2.5 text-xs font-medium">{q.transporter.companyName}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-500">{q.transporter.phone ?? '—'}</td>
                          <td className="px-4 py-2.5 text-xs font-bold text-[#1a2a5e]">{formatCurrency(q.price, load.currency)}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[160px] truncate">{q.notes ?? '—'}</td>
                          <td className="px-4 py-2.5">
                            <span className={`badge text-[9px] ${q.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : q.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{q.status}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            {['QUOTING', 'APPROVED'].includes(load.status) && q.status === 'PENDING' && (
                              <AdminLoadActions loadId={load.id} action="assign" transporterId={q.transporter.id} label="Assign" className="btn-fx text-[10px] px-2 py-1"/>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-400">No quotes yet. Release to transporters first.</div>
              )}
            </div>

            {/* Send Quote to Client */}
            {['QUOTING', 'ASSIGNED'].includes(load.status) && !load.finalPrice && (
              <div className="card">
                <div className="table-header"><span className="table-title">Send Final Quote to Client</span></div>
                <div className="card-body">
                  <AdminLoadActions loadId={load.id} action="sendQuote" currency={load.currency} />
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="card">
              <div className="table-header"><span className="table-title">Documents ({load.documents.length})</span></div>
              <div className="card-body">
                {load.documents.map(doc => (
                  <DocItem key={doc.id} name={doc.originalName} type={doc.docType} role={doc.uploadedByRole} url={doc.fileUrl} />
                ))}
                {load.documents.length === 0 && <p className="text-sm text-gray-400">No documents yet.</p>}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <AdminLoadActions loadId={load.id} action="uploadDoc" />
                </div>
              </div>
            </div>

            {/* QuickBooks Invoice */}
            <div className="card">
              <div className="table-header"><span className="table-title">Invoice (QuickBooks)</span></div>
              <div className="card-body">
                {load.invoices.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 border-l-4 border-l-[#3ab54a] rounded mb-3">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[#1a2a5e]">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-gray-400">{formatCurrency(inv.amount, inv.currency)} · {inv.originalName} · {inv.issuedAt.toLocaleDateString('en-ZA')}</div>
                    </div>
                    <span className={`badge ${inv.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{inv.status}</span>
                    {inv.fileUrl && <a href={inv.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-fx text-[10px] px-2 py-1">View PDF</a>}
                    {inv.status !== 'PAID' && <AdminLoadActions invoiceId={inv.id} action="markPaid" label="Mark Paid" className="btn-fx text-[10px] px-2 py-1"/>}
                  </div>
                ))}
                <AdminLoadActions loadId={load.id} action="uploadInvoice" currency={load.currency} />
              </div>
            </div>

            {/* Tracking Link */}
            <div className="card">
              <div className="table-header"><span className="table-title">Client Tracking Link</span></div>
              <div className="card-body">
                {activeTracking ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                      <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Active Tracking URL</div>
                      <div className="text-xs font-semibold text-[#3ab54a] break-all">
                        {process.env.NEXTAUTH_URL ?? ''}/track/{activeTracking.token}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <AdminLoadActions loadId={load.id} action="copyTracking" token={activeTracking.token} label="Copy Link" className="btn-outline-fx text-[10px] px-2 py-1"/>
                      <AdminLoadActions loadId={load.id} action="expireTracking" label="Expire Link" className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"/>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2">Link expires automatically when load is marked Delivered.</div>
                  </>
                ) : (
                  <>
                    {load.trackingLinks[0] && !load.trackingLinks[0].isActive && (
                      <div className="text-xs text-gray-400 mb-3">Tracking link expired {load.trackingLinks[0].expiredAt?.toLocaleDateString('en-ZA')}.</div>
                    )}
                    <AdminLoadActions loadId={load.id} action="createTracking" label="Create Tracking Link" className="btn-fx text-xs"/>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — controls + timeline */}
          <div className="space-y-4">

            {/* Status Update */}
            <div className="card">
              <div className="table-header"><span className="table-title">Update Status</span></div>
              <div className="card-body">
                <AdminLoadActions loadId={load.id} action="updateStatus" currentStatus={load.status} />
              </div>
            </div>

            {/* Manual Assign */}
            {['APPROVED', 'QUOTING', 'ASSIGNED'].includes(load.status) && (
              <div className="card">
                <div className="table-header"><span className="table-title">Assign Transporter</span></div>
                <div className="card-body">
                  <AdminLoadActions loadId={load.id} action="assignSelect" transporters={transporters.map(t => ({ id: t.id, name: t.companyName ?? '' }))} currentId={load.assignedTransporterId ?? undefined} />
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="card">
              <div className="table-header"><span className="table-title">Activity Timeline</span></div>
              <div className="card-body">
                <Timeline updates={load.updates} />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
