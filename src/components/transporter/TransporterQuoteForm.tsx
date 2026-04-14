'use client'
// src/components/transporter/TransporterQuoteForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function TransporterQuoteForm({ loadId, currency }: { loadId: string; currency: string }) {
  const router = useRouter()
  const [open, setOpen]     = useState(false)
  const [price, setPrice]   = useState('')
  const [notes, setNotes]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loadId, price: parseFloat(price), notes }),
    })
    setLoading(false); setDone(true); router.refresh()
  }

  if (done) return <span className="badge bg-green-50 text-green-700 border-green-200">Quoted</span>

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn-fx text-[10px] px-2 py-1">Submit Quote</button>
  )

  return (
    <form onSubmit={submit} className="flex gap-1.5 items-end flex-wrap">
      <div>
        <div className="field-label">{currency}</div>
        <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)}
          className="field w-28" placeholder="0.00"/>
      </div>
      <div>
        <div className="field-label">Notes</div>
        <input value={notes} onChange={e => setNotes(e.target.value)} className="field w-36" placeholder="Optional"/>
      </div>
      <button type="submit" disabled={loading} className="btn-fx text-[10px] px-2 py-1">
        {loading ? '…' : 'Send'}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="btn-outline-navy text-[10px] px-2 py-1">Cancel</button>
    </form>
  )
}
