// src/app/track/[token]/page.tsx
'use client'
import { useEffect, useState } from 'react'

export default function PublicTrackingPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1535] to-[#1a2a5e] p-6">
      <div className="max-w-2xl mx-auto text-center text-white">
        <h1 className="text-4xl font-bold mb-4">📍 Load Tracking</h1>
        <p className="text-gray-300">Tracking page for token: {params.token}</p>
        <p className="text-gray-400 mt-4">Real-time tracking coming soon...</p>
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
