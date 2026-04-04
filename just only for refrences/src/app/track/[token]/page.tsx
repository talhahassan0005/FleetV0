// src/app/track/[token]/page.tsx
// Public page — no auth required. Auto-expires on delivery.
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/ui'
// import { fetchLiveTracking } from '@/lib/tracking'  // Uncomment when API ready

const STEPS = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED']
const STEP_LABELS = ['Booked', 'Assigned', 'In Transit', 'Delivered']

export default async function PublicTrackingPage({ params }: { params: { token: string } }) {
  const link = await prisma.trackingLink.findUnique({
    where: { token: params.token },
    include: {
      load: {
        include: {
          updates:             { orderBy: { createdAt: 'asc' } },
          assignedTransporter: { select: { companyName: true } },
        },
      },
    },
  })

  if (!link) notFound()

  // Auto-expire if delivered
  if (link.load.status === 'DELIVERED' && link.isActive) {
    await prisma.trackingLink.update({
      where: { id: link.id },
      data:  { isActive: false, expiredAt: new Date() },
    })
  }

  // const liveData = await fetchLiveTracking(link.externalTrackingId ?? '')

  if (!link.isActive || link.load.status === 'DELIVERED') {
    return <ExpiredPage ref_={link.load.ref} origin={link.load.origin} destination={link.load.destination} />
  }

  const load = link.load
  const currentStep = Math.max(0, STEPS.indexOf(load.status))

  return (
    <div className="min-h-screen bg-[#0d1535]">
      {/* Topbar */}
      <div className="bg-[#142047] border-b-[3px] border-[#3ab54a] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="6" fill="#1a2a5e"/>
            <path d="M10 10 L20 20 L10 30" stroke="#3ab54a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M30 10 L20 20 L30 30" stroke="#3ab54a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="14" y1="4" x2="28" y2="36" stroke="#2d9e3c" strokeWidth="3.5" strokeLinecap="round" opacity={0.7}/>
          </svg>
          <span className="font-condensed font-bold text-lg text-white tracking-wide">
            FLEET<span className="text-[#3ab54a]">X</span>CHANGE
          </span>
        </div>
        <span className="flex items-center gap-1.5 bg-[#3ab54a]/15 border border-[#3ab54a]/30 px-3 py-1 rounded text-[10px] font-semibold uppercase tracking-widest text-[#3ab54a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ab54a] animate-pulse"/>
          Live Tracking
        </span>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-3">

        {/* Load card */}
        <div className="rounded-lg overflow-hidden border border-white/10">
          <div className="bg-[#142047] border-b-2 border-[#3ab54a] px-4 py-3">
            <div className="font-condensed font-bold text-xl text-white tracking-wide">{load.ref}</div>
            <div className="text-xs text-white/40 mt-0.5">{load.origin} <span className="text-[#3ab54a] font-bold">→</span> {load.destination}</div>
          </div>
          <div className="bg-white/5 p-4 grid grid-cols-2 gap-3">
            {[
              ['Cargo',       `${load.cargoType ?? '—'}${load.weight ? ` · ${load.weight}t` : ''}`],
              ['Collection',  load.collectionDate ?? '—'],
              ['Deliver By',  load.deliveryDate   ?? '—'],
              ['Transporter', load.assignedTransporter?.companyName ?? 'Being arranged'],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="text-[8px] uppercase tracking-widest font-semibold text-white/25 mb-0.5">{label}</div>
                <div className="text-xs font-medium text-white/80">{value}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/5 border-t border-white/8 px-4 py-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#3ab54a]/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#3ab54a]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-widest font-semibold text-white/25">Status</div>
              <StatusBadge status={load.status} />
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-4">
          <div className="text-[8px] uppercase tracking-widest font-semibold text-white/25 mb-4">Shipment Progress</div>
          <div className="flex items-start justify-between relative">
            {/* connecting line */}
            <div className="absolute top-3.5 left-[10%] right-[10%] h-0.5 bg-white/10">
              <div className="h-full bg-[#3ab54a] transition-all duration-700"
                style={{ width: `${Math.max(0, (currentStep / (STEPS.length - 1)) * 100)}%` }}/>
            </div>
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1 z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 transition-all ${
                  i < currentStep  ? 'bg-[#1f7a2b] border-[#3ab54a] text-white'
                  : i === currentStep ? 'bg-[#3ab54a]/20 border-[#3ab54a] text-[#3ab54a] shadow-[0_0_0_4px_rgba(58,181,74,0.15)]'
                  : 'bg-white/5 border-white/15 text-white/20'}`}>
                  {i < currentStep ? '✓' : i === currentStep ? '●' : '○'}
                </div>
                <div className={`text-[8px] mt-1.5 text-center ${i === currentStep ? 'text-[#3ab54a] font-semibold' : 'text-white/25'}`}>
                  {STEP_LABELS[i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GPS Map placeholder — replace with real map when API connected */}
        <div className="bg-white/5 rounded-lg border border-dashed border-[#3ab54a]/25 p-8 text-center">
          <svg className="w-7 h-7 stroke-[#3ab54a] fill-none mx-auto mb-2" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <div className="font-condensed font-bold text-sm text-white uppercase tracking-wide mb-1">Live GPS — Coming Soon</div>
          <div className="text-[10px] text-white/30">Real-time location will appear here once your tracking API is connected.</div>
        </div>

        {/* Activity log */}
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8">
            <div className="text-[8px] uppercase tracking-widest font-semibold text-white/25">Activity Log</div>
          </div>
          <div className="p-4 space-y-3">
            {[...load.updates].reverse().map((u, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#3ab54a] flex-shrink-0 mt-1.5"/>
                <div>
                  <div className="text-xs font-medium text-white/80">{u.message}</div>
                  <div className="text-[9px] text-white/30 mt-0.5">
                    {new Date(u.createdAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
              </div>
            ))}
            {load.updates.length === 0 && (
              <div className="text-xs text-white/30 text-center py-2">No updates yet.</div>
            )}
          </div>
        </div>

        <div className="text-center text-[9px] text-white/15 uppercase tracking-widest py-2">
          FleetXchange · Africa's Largest Freight Hub · This link expires after delivery
        </div>
      </div>
    </div>
  )
}

function ExpiredPage({ ref_, origin, destination }: { ref_: string; origin: string; destination: string }) {
  return (
    <div className="min-h-screen bg-[#0d1535] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-[#3ab54a]/15 border-2 border-[#3ab54a]/30 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 stroke-[#3ab54a] fill-none" viewBox="0 0 24 24" strokeWidth={2}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#3ab54a]/15 border border-[#3ab54a]/30 px-4 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest text-[#3ab54a] mb-4">
          ✓ Delivery Confirmed
        </div>
        <div className="bg-white/5 rounded-lg border border-white/8 px-4 py-3 mb-5 text-left">
          <div className="font-condensed font-bold text-[#3ab54a] text-sm">{ref_}</div>
          <div className="text-xs text-white/50 mt-0.5">{origin} → {destination}</div>
        </div>
        <h1 className="font-condensed font-bold text-2xl text-white uppercase tracking-wide mb-3">
          Tracking Link Expired
        </h1>
        <p className="text-sm text-white/40 mb-6">
          This shipment has been delivered and the tracking link is no longer active.
          Contact FleetXchange for further assistance.
        </p>
        <div className="font-condensed font-bold text-lg text-white/20 tracking-wide">
          FLEET<span className="text-[#3ab54a]/40">X</span>CHANGE
        </div>
      </div>
    </div>
  )
}
