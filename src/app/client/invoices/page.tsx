'use client'
// src/app/client/invoices/page.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'
import ClientInvoiceViewModal from '@/components/client/ClientInvoiceViewModal'

interface POD {
  _id: string
  status: 'PENDING' | 'VERIFIED' | 'APPROVED'
  deliveryDate: string
}

interface Invoice {
  _id: string
  filename: string
  fileUrl: string
  uploadedAt: string
  uploadedBy?: string
  approved?: boolean
  rejectionReason?: string
  clientApprovalStatus: 'PENDING_CLIENT' | 'APPROVED' | 'REJECTED'
}

interface LoadForInvoice {
  _id: string
  ref: string
  origin: string
  destination: string
  cargoType?: string
  weight?: number
  finalPrice: number
  currency: string
  status: string
  collectionDate?: string
  pod?: POD
  invoices: Invoice[]
  invoiceCount: number
}

interface QBInvoice {
  _id: string
  invoiceNumber: string
  invoiceType: 'TRANSPORTER_INVOICE' | 'CLIENT_INVOICE'
  amount: number
  currency: string
  paymentStatus: 'UNPAID' | 'PARTIAL_PAID' | 'PAID'
  paymentAmount?: number
  createdAt: string
  dueDate?: string
  loadRef?: string
  clientApprovalStatus?: boolean | null
  qbLink?: string
}

export default function ClientInvoicesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loads, setLoads] = useState<LoadForInvoice[]>([])
  const [qbInvoices, setQbInvoices] = useState<QBInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'pods' | 'invoices' | 'history'>('pods')
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [viewingUrl, setViewingUrl] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<QBInvoice | null>(null)


  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    fetchLoads()
    fetchQBInvoices()
  }, [session, router])

  const fetchLoads = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/client/loads-with-pods')

      if (!res.ok) {
        const errorData = await res.json()
        console.error('[ClientInvoices] API Error:', errorData)
        setError(errorData.error || 'Failed to fetch loads')
        return
      }

      const data = await res.json()
      console.log('[ClientInvoices] 📦 Fetched data:', data)
      console.log('[ClientInvoices] Total loads:', data.loads?.length)
      
      if (data.loads) {
        data.loads.forEach((load: LoadForInvoice) => {
          console.log(`[ClientInvoices] Load ${load.ref}: statusAmount=${load.status}, invoices=${load.invoiceCount}`)
        })
      }
      
      if (data.success && Array.isArray(data.loads)) {
        setLoads(data.loads)
      }
    } catch (err) {
      console.error('[ClientInvoices] Error fetching loads:', err)
      setError('Error loading loads')
    } finally {
      setLoading(false)
    }
  }

  const fetchQBInvoices = async () => {
    try {
      const res = await fetch('/api/client/invoices')

      if (!res.ok) {
        console.error('[ClientInvoices] QB Invoice fetch error:', await res.json())
        // Don't set error - gracefully handle missing endpoint
        return
      }

      const data = await res.json()
      console.log('[ClientInvoices] 💰 QB Invoices:', data.invoices)
      
      if (data.success && Array.isArray(data.invoices)) {
        setQbInvoices(data.invoices)
      }
    } catch (err) {
      console.error('[ClientInvoices] Error fetching QB invoices:', err)
      // Silently fail - endpoint might not exist yet
    }
  }

  const handleCreateInvoice = async (loadId: string) => {
    // Invoices are now submitted by transporters, no client creation needed
  }

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    // Invoices are now submitted by transporters
  }

  const handleApproveInvoice = async (invoiceId: string) => {
    try {
      setApprovingId(invoiceId)
      const res = await fetch(`/api/documents/${invoiceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to approve invoice')
      }

      alert('✅ Invoice approved!')
      fetchLoads() // Refresh
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setApprovingId(null)
    }
  }

  const handleRejectInvoice = async (invoiceId: string) => {
    try {
      setRejectingId(invoiceId)
      const res = await fetch(`/api/documents/${invoiceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false, rejectionReason: 'Rejected by client' })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to reject invoice')
      }

      alert('❌ Invoice rejected!')
      fetchLoads() // Refresh
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setRejectingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      VERIFIED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
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
        <Topbar title="Portal" />
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
      <Topbar title="Portal" />
      <PageLayout>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setTab('pods')}
              className={`pb-3 px-1 font-semibold transition-colors border-b-2 ${
                tab === 'pods'
                  ? 'border-[#3ab54a] text-[#3ab54a]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              POD Management ({loads.filter(l => l.invoiceCount > 0).length})
            </button>
            <button
              onClick={() => setTab('invoices')}
              className={`pb-3 px-1 font-semibold transition-colors border-b-2 ${
                tab === 'invoices'
                  ? 'border-[#3ab54a] text-[#3ab54a]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Invoices ({qbInvoices.length})
            </button>
            <button
              onClick={() => setTab('history')}
              className={`pb-3 px-1 font-semibold transition-colors border-b-2 ${
                tab === 'history'
                  ? 'border-[#3ab54a] text-[#3ab54a]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All Loads
            </button>
          </div>
        </div>

        {/* Tab: POD Management */}
        {tab === 'pods' && (
          <div>
            {loads.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
                <p className="text-gray-600">No loads found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Load Ref</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Route</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Invoices</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loads.map(load => (
                        <tr key={load._id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-[#1a2a5e]">{load.ref}</td>
                          <td className="px-4 py-3 text-sm">{load.origin} → {load.destination}</td>
                          <td className="px-4 py-3 font-semibold text-green-600">{load.currency} {load.finalPrice.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              load.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              load.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                              load.status === 'APPROVED' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {load.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">
                            {load.invoiceCount > 0 ? (
                              <span className="text-green-600">✓ {load.invoiceCount}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: My Invoices */}
        {tab === 'pods' && (
          <div>
            {loads.filter(l => l.invoiceCount > 0).length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
                <p className="text-gray-600">No PODs to approve yet. PODs will appear here when the admin approves them.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {loads.filter(l => l.invoiceCount > 0).map(load => (
                  <div key={load._id} className="bg-white rounded-lg shadow p-6 border-l-4 border-l-[#3ab54a]">
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Reference</p>
                        <p className="font-bold text-[#1a2a5e]">{load.ref}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Route</p>
                        <p className="text-sm">{load.origin} → {load.destination}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Load Amount</p>
                        <p className="text-lg font-bold text-green-600">{load.currency} {load.finalPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">POD Count</p>
                        <p className="text-2xl font-bold text-[#3ab54a]">{load.invoiceCount}</p>
                      </div>
                    </div>

                    {/* Invoices List */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Uploaded PODs:</p>
                      <div className="space-y-2">
                        {load.invoices.map((invoice, idx) => (
                          <div key={invoice._id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-800">
                                  📄 POD {idx + 1}: {invoice.filename}
                                </p>
                                {invoice.clientApprovalStatus === 'APPROVED' && (
                                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                    ✓ Approved
                                  </span>
                                )}
                                {invoice.clientApprovalStatus === 'REJECTED' && (
                                  <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                                    ✕ Rejected
                                  </span>
                                )}
                                {invoice.clientApprovalStatus !== 'APPROVED' && invoice.clientApprovalStatus !== 'REJECTED' && (
                                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                                    ⏳ Pending
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                Uploaded: {new Date(invoice.uploadedAt).toLocaleDateString()} at{' '}
                                {new Date(invoice.uploadedAt).toLocaleTimeString()}
                              </p>
                              {invoice.uploadedBy && (
                                <p className="text-xs text-gray-500">
                                  ✓ Submitted by {invoice.uploadedBy === 'TRANSPORTER' ? 'Transporter' : invoice.uploadedBy}
                                </p>
                              )}
                              {invoice.rejectionReason && (
                                <p className="text-xs text-red-600 mt-1">
                                  Rejection reason: {invoice.rejectionReason}
                                </p>
                              )}
                            </div>
                            <div className="ml-4 flex gap-2">
                              {/* View Button */}
                              <button
                                onClick={() => setViewingUrl(invoice.fileUrl)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                              >
                                View
                              </button>
                              
                              {/* Approve Button */}
                              <button
                                onClick={() => handleApproveInvoice(invoice._id)}
                                disabled={approvingId === invoice._id || invoice.clientApprovalStatus === 'APPROVED' || invoice.clientApprovalStatus === 'REJECTED'}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {approvingId === invoice._id ? '...' : invoice.clientApprovalStatus === 'APPROVED' ? '✓ Approved' : '✓ Approve'}
                              </button>
                              
                              {/* Reject Button */}
                              <button
                                onClick={() => handleRejectInvoice(invoice._id)}
                                disabled={rejectingId === invoice._id || invoice.clientApprovalStatus === 'REJECTED' || invoice.clientApprovalStatus === 'APPROVED'}
                                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {rejectingId === invoice._id ? '...' : invoice.clientApprovalStatus === 'REJECTED' ? '✕ Rejected' : '✕ Reject'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: QB Invoices */}
        {tab === 'invoices' && (
          <div>
            {qbInvoices.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
                <p className="text-gray-600">No invoices yet. Invoices will appear here once the admin generates them from approved PODs.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Invoice #</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Load Ref</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Payment Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qbInvoices.map(invoice => (
                        <tr 
                          key={invoice._id} 
                          className="border-b hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <td className="px-4 py-3 font-bold text-[#1a2a5e]">{invoice.invoiceNumber}</td>
                          <td className="px-4 py-3 text-sm">{invoice.loadRef || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              invoice.invoiceType === 'CLIENT_INVOICE' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {invoice.invoiceType === 'CLIENT_INVOICE' ? 'Client' : 'Transporter'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-600">{invoice.currency} {invoice.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              invoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                              invoice.paymentStatus === 'PARTIAL_PAID' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {invoice.paymentStatus === 'PAID' ? '✅ Paid' :
                               invoice.paymentStatus === 'PARTIAL_PAID' ? '⏳ Partial' :
                               '❌ Unpaid'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedInvoice(invoice)
                              }}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: All Loads */}
        {tab === 'history' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-100 border-b p-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Invoice Preview</h3>
                <button
                  onClick={() => setViewingUrl(null)}
                  className="text-gray-600 hover:text-gray-900 font-bold text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4">
                {viewingUrl && viewingUrl.includes('.pdf') ? (
                  <iframe
                    src={viewingUrl}
                    className="w-full h-[600px] border rounded"
                    title="Invoice PDF"
                  />
                ) : viewingUrl ? (
                  <img
                    src={viewingUrl}
                    alt="Invoice"
                    className="w-full h-auto border rounded"
                  />
                ) : null}
              </div>
              
              <div className="bg-gray-50 border-t p-4 flex gap-2 justify-end">
                <button
                  onClick={() => setViewingUrl(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded font-semibold hover:bg-gray-400"
                >
                  Close
                </button>
                {viewingUrl && (
                  <a
                    href={viewingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#3ab54a] text-white rounded font-semibold hover:bg-[#2d9e3c]"
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Invoice View Modal */}
        <ClientInvoiceViewModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />

      </PageLayout>
    </>
  )
}
