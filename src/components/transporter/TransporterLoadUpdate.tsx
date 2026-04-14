'use client'
// src/components/transporter/TransporterLoadUpdate.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function TransporterLoadUpdate({ loadId, currentStatus }: { loadId: string; currentStatus: string }) {
  const router = useRouter()
  const [status, setStatus]   = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Status + message update
    if (status || message) {
      await fetch(`/api/loads/${loadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateProgress', status: status || undefined, message }),
      })
    }

    // POD upload
    const fileInput = document.getElementById('pod-file') as HTMLInputElement
    if (fileInput?.files?.length) {
      const fd = new FormData()
      fd.append('file', fileInput.files[0])
      fd.append('loadId', loadId)
      fd.append('docType', 'POD')
      fd.append('visibleTo', 'CLIENT,TRANSPORTER,ADMIN')
      await fetch('/api/documents', { method: 'POST', body: fd })
    }

    setLoading(false)
    setMessage('')
    setStatus('')
    router.refresh()
  }

  return (
    <form onSubmit={submitUpdate} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Update Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="field">
            <option value="">— No change —</option>
            {currentStatus !== 'IN_TRANSIT'  && <option value="IN_TRANSIT">In Transit</option>}
            {currentStatus !== 'DELIVERED'   && <option value="DELIVERED">Delivered</option>}
          </select>
        </div>
        <div>
          <label className="field-label">Progress Note</label>
          <input value={message} onChange={e => setMessage(e.target.value)}
            className="field" placeholder="e.g. Departed JHB at 08:00"/>
        </div>
      </div>

      <div>
        <label className="field-label">Upload POD (Proof of Delivery)</label>
        <input id="pod-file" type="file" accept=".pdf,.jpg,.jpeg,.png" className="field"/>
        <p className="text-[10px] text-gray-400 mt-1">
          Upload signed delivery note or photo. Automatically shared with client and marks load as Delivered.
        </p>
      </div>

      <button type="submit" disabled={loading} className="btn-fx text-xs px-4 py-2 disabled:opacity-60">
        {loading ? 'Submitting…' : 'Submit Update'}
      </button>
    </form>
  )
}
