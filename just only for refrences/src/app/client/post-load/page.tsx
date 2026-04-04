'use client'
// src/app/client/post-load/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Topbar, PageLayout } from '@/components/ui'
import Link from 'next/link'

export default function PostLoadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    origin: '', destination: '', cargoType: '', weight: '',
    collectionDate: '', deliveryDate: '', specialInstructions: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to post load.'); return }
      const load = await res.json()

      // Upload customs docs if any
      const fileInput = document.getElementById('customs-docs') as HTMLInputElement
      if (fileInput?.files?.length) {
        for (const file of Array.from(fileInput.files)) {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('loadId', load.id)
          fd.append('docType', 'CUSTOMS')
          fd.append('visibleTo', 'CLIENT,ADMIN')
          await fetch('/api/documents', { method: 'POST', body: fd })
        }
      }

      router.push(`/client/loads/${load.id}`)
    } finally { setLoading(false) }
  }

  return (
    <>
      <Topbar title="Post New Load">
        <Link href="/client" className="btn-outline-fx text-xs">← Back</Link>
      </Topbar>
      <PageLayout>
        <div className="max-w-2xl">
          <div className="card">
            <div className="table-header"><span className="table-title">Load Details</span></div>
            <div className="card-body">
              {error && <div className="mb-4 p-3 bg-red-50 border-l-4 border-l-red-500 rounded text-red-700 text-sm">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="field-label">Origin *</label>
                    <input required value={form.origin} onChange={e => set('origin', e.target.value)}
                      className="field" placeholder="e.g. Johannesburg, SA"/>
                  </div>
                  <div>
                    <label className="field-label">Destination *</label>
                    <input required value={form.destination} onChange={e => set('destination', e.target.value)}
                      className="field" placeholder="e.g. Cape Town, SA"/>
                  </div>
                  <div>
                    <label className="field-label">Cargo Type</label>
                    <input value={form.cargoType} onChange={e => set('cargoType', e.target.value)}
                      className="field" placeholder="FMCG, Steel, Retail…"/>
                  </div>
                  <div>
                    <label className="field-label">Weight (tons)</label>
                    <input value={form.weight} onChange={e => set('weight', e.target.value)}
                      className="field" placeholder="e.g. 22"/>
                  </div>
                  <div>
                    <label className="field-label">Collection Date *</label>
                    <input type="date" required value={form.collectionDate} onChange={e => set('collectionDate', e.target.value)} className="field"/>
                  </div>
                  <div>
                    <label className="field-label">Required Delivery By</label>
                    <input type="date" value={form.deliveryDate} onChange={e => set('deliveryDate', e.target.value)} className="field"/>
                  </div>
                  <div className="col-span-2">
                    <label className="field-label">Special Instructions</label>
                    <textarea value={form.specialInstructions} onChange={e => set('specialInstructions', e.target.value)}
                      rows={3} className="field resize-none" placeholder="Hazmat, refrigeration, access restrictions…"/>
                  </div>
                  <div className="col-span-2">
                    <label className="field-label">Customs Documents (optional)</label>
                    <input id="customs-docs" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="field"/>
                    <p className="text-[10px] text-gray-400 mt-1">Upload customs clearance or any supporting documents.</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="submit" disabled={loading} className="btn-fx text-sm px-5 py-2 disabled:opacity-60">
                    {loading ? 'Submitting…' : 'Submit Load Request'}
                  </button>
                  <Link href="/client" className="btn-outline-navy text-sm px-5 py-2">Cancel</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
