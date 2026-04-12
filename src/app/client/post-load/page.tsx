'use client'
// src/app/client/post-load/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'
import Link from 'next/link'

export default function PostLoadPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    origin: '', destination: '', itemType: '', weight: '',
    collectionDate: '', deliveryDate: '', description: '', postedPrice: '0',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!session?.user?.id) {
      setError('You must be logged in to post a load.')
      return
    }
    
    setLoading(true); setError('')
    try {
      const payload = {
        ...form,
        weight: parseFloat(form.weight) || 0,
        postedPrice: parseFloat(form.postedPrice) || 0,
        clientId: session.user.id,
      }
      console.log('[PostLoadForm] Submitting payload:', payload)
      
      const res = await fetch('/api/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      console.log('[PostLoadForm] Response status:', res.status)
      
      if (!res.ok) { 
        const d = await res.json()
        console.log('[PostLoadForm] Error response:', d)
        setError(d.error ?? 'Failed to post load.')
        return 
      }
      const load = await res.json()

      // Upload customs docs if any
      const fileInput = document.getElementById('customs-docs') as HTMLInputElement
      if (fileInput?.files?.length) {
        for (const file of Array.from(fileInput.files)) {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('loadId', load.load._id || load.id)
          fd.append('docType', 'CUSTOMS')
          fd.append('visibleTo', 'CLIENT,ADMIN')
          await fetch('/api/documents', { method: 'POST', body: fd })
        }
      }

      router.push(`/client/loads/${load.load._id || load.id}`)
    } finally { setLoading(false) }
  }

  return (
    <>
      <Topbar title="Post New Load">
        <Link href="/client" className="btn-outline-fx text-xs">← Back</Link>
      </Topbar>
      
      {/* Account Verification Banner */}
      {session?.user && !session.user.isVerified && (
        <div className="bg-amber-50 border-b-2 border-amber-300 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-start gap-3">
            <div className="mt-0.5">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Account Verification Required</h3>
              <p className="text-amber-800 text-sm mt-1">You must complete account verification before posting loads.</p>
              {session.user.verificationStatus === 'REJECTED' && session.user.verificationComment && (
                <p className="text-amber-700 text-sm mt-1 italic">
                  Previous submission rejected: {session.user.verificationComment}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => router.push('/client/documents')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-semibold"
                >
                  Complete Verification →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <PageLayout>
        <div className="w-full">
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
                    <label className="field-label">Cargo Type *</label>
                    <input required value={form.itemType} onChange={e => set('itemType', e.target.value)}
                      className="field" placeholder="FMCG, Steel, Retail…"/>
                  </div>
                  <div>
                    <label className="field-label">Weight (tons) *</label>
                    <input type="number" required step="0.1" value={form.weight} onChange={e => set('weight', e.target.value)}
                      className="field" placeholder="e.g. 22"/>
                  </div>
                  <div>
                    <label className="field-label">Posted Price (R) *</label>
                    <input type="number" required step="0.01" value={form.postedPrice} onChange={e => set('postedPrice', e.target.value)}
                      className="field" placeholder="e.g. 5000"/>
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
                    <label className="field-label">Description / Special Instructions *</label>
                    <textarea required value={form.description} onChange={e => set('description', e.target.value)}
                      rows={3} className="field resize-none" placeholder="Hazmat, refrigeration, access restrictions, handling notes…"/>
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
