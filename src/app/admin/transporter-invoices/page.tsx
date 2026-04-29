'use client'
// src/app/admin/transporter-invoices/page.tsx
import { useEffect, useState } from 'react'
import { Topbar, PageLayout } from '@/components/ui'
import { openDocument } from '@/lib/document-url'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface Invoice {
  _id: string
  invoiceNumber: string
  amount: number
  currency: string
  tonnage: number
  status: 'PENDING_ADMIN_REVIEW' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  submittedAt: string
  reviewedAt?: string
  invoicePdfUrl: string
  invoicePdfName: string
  notes?: string
  loadRef: string
  loadRoute: string
  transporterName: string
  clientName: string
}

export default function AdminTransporterInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING_ADMIN_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/transporter-invoices')
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices || [])
      }
    } catch (err) {
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (invoiceId: string) => {
    if (!confirm('Approve this invoice?')) return

    try {
      setProcessingId(invoiceId)
      setError('')
      setSuccess('')

      const res = await fetch(`/api/admin/transporter-invoices/${invoiceId}/approve`, {
        method: 'POST'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to approve invoice')
      }

      setSuccess('✅ Invoice approved successfully!')
      fetchInvoices()
    } catch (err: any) {
      setError(err.message || 'Failed to approve invoice')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (invoiceId: string) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }

    try {
      setProcessingId(invoiceId)
      setError('')
      setSuccess('')

      const res = await fetch(`/api/admin/transporter-invoices/${invoiceId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to reject invoice')
      }

      setSuccess('✅ Invoice rejected successfully!')
      setRejectingId(null)
      setRejectionReason('')
      fetchInvoices()
    } catch (err: any) {
      setError(err.message || 'Failed to reject invoice')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredInvoices = filter === 'ALL' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter)

  const pendingCount = invoices.filter(inv => inv.status === 'PENDING_ADMIN_REVIEW').length

  if (loading) {
    return (
      <>
        <Topbar title="Transporter Invoices" />
        <PageLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ab54a]"></div>
          </div>
        </PageLayout>
      </>
    )
  }

  return (
    <>
      <Topbar title="Transporter Invoices" />
      <PageLayout>
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800 flex gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 flex gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{success}</div>
            </div>
          )}

          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#1a2a5e]">Transporter Invoices</h1>
              <p className="text-gray-600 mt-1">Review and approve transporter invoices</p>
            </div>
            {pendingCount > 0 && (
              <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
                {pendingCount} Pending Review
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 border-b">
            {(['ALL', 'PENDING_ADMIN_REVIEW', 'APPROVED', 'REJECTED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 font-semibold transition-colors ${
                  filter === status
                    ? 'border-b-2 border-[#3ab54a] text-[#3ab54a]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status === 'PENDING_ADMIN_REVIEW' ? 'Pending' : status}
                {status !== 'ALL' && ` (${invoices.filter(inv => inv.status === status).length})`}
              </button>
            ))}
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices</h3>
              <p className="text-gray-600">
                {filter === 'PENDING_ADMIN_REVIEW' 
                  ? 'No invoices pending review' 
                  : `No ${filter.toLowerCase()} invoices`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInvoices.map(invoice => (
                <div
                  key={invoice._id}
                  className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 ${
                    invoice.status === 'APPROVED' ? 'border-green-500' :
                    invoice.status === 'REJECTED' ? 'border-red-500' :
                    'border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[#1a2a5e]">
                          {invoice.invoiceNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          invoice.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {invoice.status === 'PENDING_ADMIN_REVIEW' ? 'PENDING REVIEW' : invoice.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Transporter:</strong> {invoice.transporterName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Client:</strong> {invoice.clientName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Load:</strong> {invoice.loadRef} - {invoice.loadRoute}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted {new Date(invoice.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Amount</p>
                      <p className="text-lg font-bold text-[#3ab54a]">
                        {invoice.currency} {invoice.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Tonnage</p>
                      <p className="text-lg font-semibold text-gray-700">{invoice.tonnage} tons</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {invoice.status === 'APPROVED' ? '✅ Approved' :
                         invoice.status === 'REJECTED' ? '❌ Rejected' :
                         '⏳ Pending'}
                      </p>
                    </div>
                  </div>

                  {invoice.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-xs text-red-600 font-semibold uppercase mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-800">{invoice.rejectionReason}</p>
                    </div>
                  )}

                  {invoice.notes && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Notes</p>
                      <p className="text-sm text-blue-800">{invoice.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openDocument(invoice.invoicePdfUrl, invoice.invoicePdfName)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold transition-colors text-sm"
                    >
                      📄 View Invoice
                    </button>

                    {invoice.status === 'PENDING_ADMIN_REVIEW' && (
                      <>
                        {rejectingId === invoice._id ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Rejection reason..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={() => handleReject(invoice._id)}
                              disabled={processingId === invoice._id}
                              className="px-4 py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600 disabled:opacity-50 text-sm"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => {
                                setRejectingId(null)
                                setRejectionReason('')
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-400 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApprove(invoice._id)}
                              disabled={processingId === invoice._id}
                              className="px-4 py-2 bg-green-500 text-white rounded font-semibold hover:bg-green-600 disabled:opacity-50 text-sm"
                            >
                              {processingId === invoice._id ? '⏳' : '✓'} Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(invoice._id)}
                              disabled={processingId === invoice._id}
                              className="px-4 py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600 disabled:opacity-50 text-sm"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </>
  )
}
