'use client'
// src/app/admin/invoice-management/page.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'

interface Invoice {
  _id: string
  invoiceNumber: string
  loadRef: string
  transporterName: string
  clientName: string
  amount: number
  currency: string
  status: 'DRAFT' | 'SENT' | 'PENDING_PAYMENT' | 'PAID'
  approvedByClient?: boolean
  approvedByAdmin?: boolean
  createdAt: string
  dueDate?: string
  itemDescription?: string
  notes?: string
}

export default function AdminInvoiceManagementPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<'DRAFT' | 'SENT' | 'PENDING_PAYMENT' | 'PAID' | 'ALL'>('DRAFT')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [processing, setProcessing] = useState(false)

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.append('status', filter)

      const res = await fetch(`/api/admin/invoices?${params.toString()}`)

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to fetch invoices')
        return
      }

      const data = await res.json()
      if (data.success && Array.isArray(data.invoices)) {
        setInvoices(data.invoices)
      }
    } catch (err) {
      console.error('[AdminInvoice] Error fetching invoices:', err)
      setError('Error loading invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router, filter])

  const handleApproveInvoice = async (invoiceId: string) => {
    try {
      setProcessing(true)
      setError('')

      const res = await fetch(`/api/admin/invoices/${invoiceId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to approve invoice')
        setProcessing(false)
        return
      }

      setSuccess('✓ Invoice approved successfully!')
      setSelectedInvoice(null)
      setProcessing(false)

      setTimeout(() => {
        fetchInvoices()
        setSuccess('')
      }, 2000)
    } catch (err) {
      console.error('[AdminInvoice] Error:', err)
      setError('Failed to approve invoice. Please try again.')
      setProcessing(false)
    }
  }

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      setProcessing(true)
      setError('')

      const res = await fetch(`/api/admin/invoices/${invoiceId}/send`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to send invoice')
        setProcessing(false)
        return
      }

      setSuccess('✓ Invoice sent to transporter. Notification email sent.')
      setSelectedInvoice(null)
      setProcessing(false)

      setTimeout(() => {
        fetchInvoices()
        setSuccess('')
      }, 2000)
    } catch (err) {
      console.error('[AdminInvoice] Error:', err)
      setError('Failed to send invoice. Please try again.')
      setProcessing(false)
    }
  }

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      setProcessing(true)
      setError('')

      const res = await fetch(`/api/admin/invoices/${invoiceId}/mark-paid`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to mark invoice as paid')
        setProcessing(false)
        return
      }

      setSuccess('✓ Invoice marked as PAID. All parties notified.')
      setSelectedInvoice(null)
      setProcessing(false)

      setTimeout(() => {
        fetchInvoices()
        setSuccess('')
      }, 2000)
    } catch (err) {
      console.error('[AdminInvoice] Error:', err)
      setError('Failed to mark invoice as paid. Please try again.')
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <>
        <Topbar title="Invoice Management" />
        <PageLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
          </div>
        </PageLayout>
      </>
    )
  }

  return (
    <>
      <Topbar title="Invoice Management" />
      <PageLayout>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 border-l-4 border-l-green-500 rounded text-green-800 text-sm">
            {success}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-3 flex-wrap">
          {(['DRAFT', 'SENT', 'PENDING_PAYMENT', 'PAID', 'ALL'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                filter === status
                  ? 'bg-[#3ab54a] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All Invoices' : status === 'PENDING_PAYMENT' ? 'Awaiting Payment' : status}
            </button>
          ))}
        </div>

        {/* Invoices Table */}
        {invoices.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-gray-600">No invoices found in {filter} status.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Invoice #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Load</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Transporter</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Client OK</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#1a2a5e]">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm">{invoice.loadRef}</td>
                      <td className="px-4 py-3 text-sm">{invoice.transporterName}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        {invoice.currency} {invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {invoice.approvedByClient ? (
                          <span className="text-green-600 font-semibold">✓</span>
                        ) : (
                          <span className="text-yellow-600 font-semibold">⏳</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                          {invoice.status === 'PENDING_PAYMENT' ? 'Awaiting Payment' : invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-semibold hover:bg-blue-200 transition-colors text-xs"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoice Management Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1a2a5e]">Invoice: {selectedInvoice.invoiceNumber}</h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Invoice Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Load Reference</p>
                    <p className="text-lg font-semibold text-[#1a2a5e]">{selectedInvoice.loadRef}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Transporter</p>
                    <p className="text-lg font-semibold">{selectedInvoice.transporterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Client</p>
                    <p className="text-lg font-semibold">{selectedInvoice.clientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedInvoice.currency} {selectedInvoice.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-900">Current Status:</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status === 'PENDING_PAYMENT' ? 'Awaiting Payment' : selectedInvoice.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-900">Client Approval:</span>
                    <span className={`font-semibold ${selectedInvoice.approvedByClient ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedInvoice.approvedByClient ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-900">Admin Approval:</span>
                    <span className={`font-semibold ${selectedInvoice.approvedByAdmin ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedInvoice.approvedByAdmin ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                </div>

                {/* Invoice Content */}
                {selectedInvoice.itemDescription && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Description</p>
                    <p className="text-gray-700">{selectedInvoice.itemDescription}</p>
                  </div>
                )}

                {selectedInvoice.notes && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Notes/Terms</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                      {selectedInvoice.notes}
                    </p>
                  </div>
                )}

                {selectedInvoice.dueDate && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Due Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t">
                  <p className="text-sm font-semibold text-gray-700">Admin Actions:</p>

                  {selectedInvoice.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => handleApproveInvoice(selectedInvoice._id)}
                        disabled={processing}
                        className="w-full px-4 py-3 bg-green-50 border-2 border-green-300 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {processing ? 'Processing...' : '✓ Approve Invoice (Override Client)'}
                      </button>

                      <button
                        onClick={() => handleSendInvoice(selectedInvoice._id)}
                        disabled={processing}
                        className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {processing ? 'Sending...' : '📧 Send to Transporter (Mark as SENT)'}
                      </button>
                    </>
                  )}

                  {selectedInvoice.status === 'SENT' && (
                    <button
                      onClick={() => handleMarkAsPaid(selectedInvoice._id)}
                      disabled={processing}
                      className="w-full px-4 py-3 bg-purple-50 border-2 border-purple-300 text-purple-700 rounded-lg font-semibold hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {processing ? 'Processing...' : '💳 Move to PENDING_PAYMENT'}
                    </button>
                  )}

                  {selectedInvoice.status === 'PENDING_PAYMENT' && (
                    <button
                      onClick={() => handleMarkAsPaid(selectedInvoice._id)}
                      disabled={processing}
                      className="w-full px-4 py-3 bg-emerald-50 border-2 border-emerald-300 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {processing ? 'Processing...' : '✓ Mark as PAID'}
                    </button>
                  )}

                  {selectedInvoice.status === 'PAID' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                      ✓ This invoice has been paid. All parties have been notified.
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  )
}
