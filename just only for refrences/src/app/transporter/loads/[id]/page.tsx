// src/app/transporter/loads/[id]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { Topbar, PageLayout, StatusBadge, DocItem, Timeline } from '@/components/ui'
import { TransporterLoadUpdate } from '@/components/transporter/TransporterLoadUpdate'
import Link from 'next/link'

export default async function TransporterLoadDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const load = await prisma.load.findUnique({
    where: { id: params.id },
    include: {
      updates:   { orderBy: { createdAt: 'asc' } },
      documents: true,
    },
  })

  if (!load) notFound()
  // Allow transporter to view if assigned or load is in quoting
  if (load.assignedTransporterId !== session.user.id && load.status !== 'QUOTING')
    redirect('/transporter')

  const transDocs = load.documents.filter(d => d.visibleTo.includes('TRANSPORTER'))
  const isAssigned = load.assignedTransporterId === session.user.id

  return (
    <>
      <Topbar title={load.ref}>
        <Link href="/transporter" className="btn-outline-fx text-xs">← Dashboard</Link>
      </Topbar>
      <PageLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <div className="lg:col-span-2 space-y-4">

            {/* Load info */}
            <div className="card">
              <div className="table-header">
                <span className="table-title">{load.origin} → {load.destination}</span>
                <StatusBadge status={load.status} />
              </div>
              <div className="card-body grid grid-cols-2 gap-4">
                {[
                  ['Cargo',      `${load.cargoType ?? '—'}${load.weight ? ` · ${load.weight} tons` : ''}`],
                  ['Collection', load.collectionDate ?? '—'],
                  ['Deliver By', load.deliveryDate   ?? '—'],
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

            {/* Progress update — only if assigned */}
            {isAssigned && (
              <div className="card">
                <div className="table-header"><span className="table-title">Update Progress</span></div>
                <div className="card-body">
                  <TransporterLoadUpdate loadId={load.id} currentStatus={load.status} />
                </div>
              </div>
            )}

            {/* Documents */}
            {transDocs.length > 0 && (
              <div className="card">
                <div className="table-header"><span className="table-title">Documents</span></div>
                <div className="card-body">
                  {transDocs.map(doc => (
                    <DocItem key={doc.id} name={doc.originalName} type={doc.docType} role={doc.uploadedByRole} url={doc.fileUrl ?? undefined}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card h-fit">
            <div className="table-header"><span className="table-title">Timeline</span></div>
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
