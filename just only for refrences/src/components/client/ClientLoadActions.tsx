'use client'
// src/components/client/ClientLoadActions.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ClientLoadActions({ loadId, action }: { loadId: string; action: string }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function patchLoad(body: object) {
    setLoading(true)
    await fetch(`/api/loads/${loadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)
    router.refresh()
  }

  if (action === 'approveQuote') return (
    <button onClick={() => patchLoad({ action: 'approveQuote' })} disabled={loading}
      className="btn-fx text-sm px-5 py-2 disabled:opacity-60">
      {loading ? 'Approving…' : '✓ Approve Quote & Proceed'}
    </button>
  )

  if (action === 'uploadDoc') return (
    <form onSubmit={async e => {
      e.preventDefault()
      const fd = new FormData(e.target as HTMLFormElement)
      fd.append('loadId', loadId)
      fd.append('visibleTo', 'CLIENT,ADMIN')
      setLoading(true)
      await fetch('/api/documents', { method: 'POST', body: fd })
      setLoading(false)
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    }}>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="field-label">Type</label>
          <select name="docType" className="field">
            <option value="CUSTOMS">Customs</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="field-label">File</label>
          <input type="file" name="file" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="field"/>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-outline-fx text-xs">
        {loading ? 'Uploading…' : 'Upload Document'}
      </button>
    </form>
  )

  return null
}
