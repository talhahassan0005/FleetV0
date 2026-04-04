'use client'
// src/components/admin/AdminLoadActions.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  loadId?:          string
  invoiceId?:       string
  action:           string
  label?:           string
  className?:       string
  transporterId?:   string
  transporters?:    { id: string; name: string }[]
  currentId?:       string
  currentStatus?:   string
  currency?:        string
  token?:           string
  initialStatus?:   string
  onSuccess?:       () => void
}

export function AdminLoadActions({ loadId, invoiceId, action, label, className = '', transporterId, transporters, currentId, currentStatus, currency = 'ZAR', token, initialStatus, onSuccess }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedTransporter, setSelectedTransporter] = useState(currentId ?? '')
  const [status, setStatus]   = useState(currentStatus ?? 'PENDING')
  const [message, setMessage] = useState('')
  const [finalPrice, setFinalPrice] = useState('')
  const [qCurrency, setQCurrency]   = useState(currency)
  const [invNumber, setInvNumber]   = useState('')
  const [amount, setAmount]         = useState('')
  const [docType, setDocType]       = useState('CUSTOMS')
  const [visibleTo, setVisibleTo]   = useState('CLIENT,ADMIN')
  const [rejectionReason, setRejectionReason] = useState('')
  const [commission, setCommission] = useState('')

  async function callApi(body: object) {
    setLoading(true)
    try {
      await fetch(`/api/loads/${loadId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      router.refresh()
    } finally { setLoading(false) }
  }

  async function callInvoiceApi(body: object) {
    setLoading(true)
    await fetch('/api/invoices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setLoading(false); router.refresh()
  }

  if (action === 'release') return (
    <button onClick={() => callApi({ action: 'release' })} disabled={loading} className={className}>
      {loading ? '…' : label}
    </button>
  )

  if (action === 'assign') return (
    <button onClick={() => callApi({ action: 'assign', transporterId })} disabled={loading} className={className}>
      {loading ? '…' : label}
    </button>
  )

  if (action === 'markPaid') return (
    <button onClick={() => callInvoiceApi({ invoiceId, action: 'markPaid' })} disabled={loading} className={className}>
      {loading ? '…' : label}
    </button>
  )

  if (action === 'createTracking') return (
    <button onClick={() => callApi({ action: 'createTracking' })} disabled={loading} className={className || 'btn-fx text-xs'}>
      {loading ? 'Creating…' : (label ?? 'Create Tracking Link')}
    </button>
  )

  if (action === 'expireTracking') return (
    <button onClick={() => { if(confirm('Expire this tracking link?')) callApi({ action: 'expireTracking' }) }} disabled={loading} className={className}>
      {loading ? '…' : label}
    </button>
  )

  if (action === 'copyTracking') return (
    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/track/${token}`); alert('Tracking link copied!') }} className={className}>
      {label}
    </button>
  )

  if (action === 'sendQuote') return (
    <div className="flex gap-2 items-end flex-wrap">
      <div>
        <label className="field-label">Currency</label>
        <select value={qCurrency} onChange={e => setQCurrency(e.target.value)} className="field w-24">
          {['ZAR','BWP','USD','ZMW'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex-1">
        <label className="field-label">Final Price (with markup)</label>
        <input type="number" step="0.01" value={finalPrice} onChange={e => setFinalPrice(e.target.value)} className="field" placeholder="0.00"/>
      </div>
      <button onClick={() => callApi({ action: 'sendQuote', finalPrice, currency: qCurrency })} disabled={loading || !finalPrice} className="btn-fx text-xs">
        {loading ? '…' : 'Send to Client'}
      </button>
    </div>
  )

  if (action === 'updateStatus') return (
    <div className="space-y-2">
      <div>
        <label className="field-label">New Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="field">
          {['PENDING','QUOTING','QUOTED','APPROVED','ASSIGNED','IN_TRANSIT','DELIVERED','CANCELLED'].map(s => (
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label">Note (optional)</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} className="field resize-none" placeholder="Add a note…"/>
      </div>
      <button onClick={() => callApi({ action: 'updateStatus', status, message })} disabled={loading} className="btn-fx w-full text-xs">
        {loading ? 'Updating…' : 'Update Status'}
      </button>
    </div>
  )

  if (action === 'assignSelect') return (
    <div className="space-y-2">
      <div>
        <label className="field-label">Select Transporter</label>
        <select value={selectedTransporter} onChange={e => setSelectedTransporter(e.target.value)} className="field">
          <option value="">— Select —</option>
          {(transporters ?? []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <button onClick={() => selectedTransporter && callApi({ action: 'assign', transporterId: selectedTransporter })} disabled={loading || !selectedTransporter} className="btn-fx w-full text-xs">
        {loading ? 'Assigning…' : 'Assign'}
      </button>
    </div>
  )

  if (action === 'uploadDoc') return (
    <form onSubmit={async e => {
      e.preventDefault()
      const form = e.target as HTMLFormElement
      const fd = new FormData(form)
      fd.append('loadId', loadId!)
      setLoading(true)
      await fetch('/api/documents', { method: 'POST', body: fd })
      setLoading(false); router.refresh(); form.reset()
    }}>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="field-label">Doc Type</label>
          <select name="docType" className="field">
            {['CUSTOMS','POD','INVOICE','OTHER'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Visible To</label>
          <select name="visibleTo" className="field">
            <option value="CLIENT,ADMIN">Client + Admin</option>
            <option value="TRANSPORTER,ADMIN">Transporter + Admin</option>
            <option value="CLIENT,TRANSPORTER,ADMIN">All</option>
            <option value="ADMIN">Admin Only</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="field-label">File</label>
          <input type="file" name="file" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="field"/>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-outline-fx text-xs">
        {loading ? 'Uploading…' : 'Upload Document'}
      </button>
    </form>
  )

  if (action === 'uploadInvoice') return (
    <form onSubmit={async e => {
      e.preventDefault()
      const fd = new FormData(e.target as HTMLFormElement)
      fd.append('loadId', loadId!)
      setLoading(true)
      await fetch('/api/invoices', { method: 'POST', body: fd })
      setLoading(false); router.refresh()
    }}>
      <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Upload QuickBooks Invoice</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="field-label">QB Invoice No.</label>
          <input type="text" name="invoiceNumber" className="field" placeholder="e.g. INV-1042"/>
        </div>
        <div>
          <label className="field-label">Amount</label>
          <input type="number" step="0.01" name="amount" className="field" placeholder="0.00"/>
        </div>
        <div>
          <label className="field-label">Currency</label>
          <select name="currency" className="field">
            {['ZAR','BWP','USD','ZMW'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Invoice PDF</label>
          <input type="file" name="file" required accept=".pdf,.jpg,.png,.doc,.docx" className="field"/>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-fx text-xs">
        {loading ? 'Uploading…' : 'Upload & Share with Client'}
      </button>
    </form>
  )

  if (action === 'loadManagement') return (
    <div className="space-y-6">
      {/* Approve Load */}
      <div className="border border-green-200 bg-green-50 p-4 rounded">
        <h4 className="font-bold text-green-900 mb-3">✓ Approve Load</h4>
        <button 
          onClick={async () => {
            if (confirm('Approve this load?')) {
              setLoading(true)
              try {
                const res = await fetch(`/api/admin/loads/${loadId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'approve' })
                })
                if (res.ok) {
                  alert('Load approved successfully!')
                  onSuccess?.()
                }
              } finally {
                setLoading(false)
              }
            }
          }}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Approving...' : 'Approve Load'}
        </button>
      </div>

      {/* Add Commission */}
      <div className="border border-blue-200 bg-blue-50 p-4 rounded">
        <h4 className="font-bold text-blue-900 mb-3">$ Add Commission</h4>
        <div className="space-y-3">
          <div>
            <label className="field-label">Commission Amount (R)</label>
            <input 
              type="number" 
              step="0.01" 
              value={commission} 
              onChange={e => setCommission(e.target.value)}
              className="field w-full"
              placeholder="0.00"
            />
          </div>
          <button 
            onClick={async () => {
              if (!commission || parseFloat(commission) <= 0) {
                alert('Enter a valid commission amount')
                return
              }
              if (confirm(`Add R${parseFloat(commission).toFixed(2)} commission?`)) {
                setLoading(true)
                try {
                  const res = await fetch(`/api/admin/loads/${loadId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      action: 'addCommission',
                      commission: parseFloat(commission)
                    })
                  })
                  if (res.ok) {
                    alert('Commission added successfully!')
                    setCommission('')
                    onSuccess?.()
                  } else {
                    alert('Failed to add commission')
                  }
                } finally {
                  setLoading(false)
                }
              }
            }}
            disabled={loading || !commission}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Commission'}
          </button>
        </div>
      </div>

      {/* Reject Load */}
      <div className="border border-red-200 bg-red-50 p-4 rounded">
        <h4 className="font-bold text-red-900 mb-3">✗ Reject Load</h4>
        <div className="space-y-3">
          <div>
            <label className="field-label">Reason for Rejection</label>
            <textarea 
              value={rejectionReason} 
              onChange={e => setRejectionReason(e.target.value)}
              className="field w-full resize-none"
              rows={3}
              placeholder="Explain why this load is being rejected..."
            />
          </div>
          <button 
            onClick={async () => {
              if (!rejectionReason.trim()) {
                alert('Please provide a rejection reason')
                return
              }
              if (confirm('Reject this load? This action cannot be undone.')) {
                setLoading(true)
                try {
                  const res = await fetch(`/api/admin/loads/${loadId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      action: 'reject',
                      rejectionReason: rejectionReason.trim()
                    })
                  })
                  if (res.ok) {
                    alert('Load rejected successfully!')
                    setRejectionReason('')
                    onSuccess?.()
                  } else {
                    alert('Failed to reject load')
                  }
                } finally {
                  setLoading(false)
                }
              }
            }}
            disabled={loading || !rejectionReason.trim()}
            className="w-full px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Rejecting...' : 'Reject Load'}
          </button>
        </div>
      </div>
    </div>
  )

  return null
}
