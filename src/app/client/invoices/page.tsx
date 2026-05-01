'use client'
import { getDocumentViewUrl, openDocument } from '@/lib/document-url'
// src/app/client/invoices/page.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'

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
  qbInvoices?: Array<{
    _id: string
    invoiceNumber: string
    amount: number
    currency: string
    paymentStatus: string
    clientApprovalStatus: string
    qbLink?: string
  }>
  hasInvoice?: boolean
  invoiceStatus?: string | null
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
  clientApprovalStatus?: boolean | null | 'APPROVED' | 'REJECTED'
  qbLink?: string
}

export default function ClientInvoicesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loads, setLoads] = useState<LoadForInvoice[]>([])
  const [qbInvoices, setQbInvoices] = useState<QBInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'invoices'>('invoices')
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectingInvoiceId, setRejectingInvoiceId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' })
  const [viewingInvoice, setViewingInvoice] = useState<QBInvoice | null>(null)


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
    setRejectingInvoiceId(invoiceId)
    setRejectModalOpen(true)
  }

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      setRejectingId(rejectingInvoiceId)
      const res = await fetch(`/api/documents/${rejectingInvoiceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false, rejectionReason: rejectionReason.trim() })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to reject invoice')
      }

      alert('❌ Invoice rejected!')
      setRejectModalOpen(false)
      setRejectionReason('')
      setRejectingInvoiceId(null)
      fetchLoads() // Refresh
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setRejectingId(null)
    }
  }

  const handleApproveQBInvoice = async (invoiceId: string) => {
    try {
      setApprovingId(invoiceId)
      const res = await fetch(`/api/invoices/${invoiceId}/client-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to approve invoice')
      }

      alert('✅ Invoice approved!')
      fetchQBInvoices() // Refresh
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setApprovingId(null)
    }
  }

  const handleRejectQBInvoice = async (invoiceId: string) => {
    setRejectingInvoiceId(invoiceId)
    setRejectModalOpen(true)
  }

  const submitQBRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      setRejectingId(rejectingInvoiceId)
      const res = await fetch(`/api/invoices/${rejectingInvoiceId}/client-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', rejectionReason: rejectionReason.trim() })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to reject invoice')
      }

      alert('❌ Invoice rejected!')
      setRejectModalOpen(false)
      setRejectionReason('')
      setRejectingInvoiceId(null)
      fetchQBInvoices() // Refresh
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

  // Filter invoices based on search and date
  const filteredQBInvoices = qbInvoices.filter(invoice => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchesSearch = 
        invoice.invoiceNumber?.toLowerCase().includes(search) ||
        invoice.loadRef?.toLowerCase().includes(search) ||
        invoice.amount?.toString().includes(search) ||
        invoice.currency?.toLowerCase().includes(search)
      
      if (!matchesSearch) return false
    }

    // Date filter
    if (dateFilter.startDate || dateFilter.endDate) {
      const invoiceDate = new Date(invoice.createdAt)
      
      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate)
        if (invoiceDate < startDate) return false
      }
      
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (invoiceDate > endDate) return false
      }
    }

    return true
  })

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

        {/* Invoices Tab */}
          <div>
            {/* Search and Filter Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Bar */}
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Invoice #, Load Ref, Amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {(searchTerm || dateFilter.startDate || dateFilter.endDate) && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredQBInvoices.length} of {qbInvoices.length} invoices
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setDateFilter({ startDate: '', endDate: '' })
                    }}
                    className="text-sm text-[#3ab54a] hover:text-[#2d9e3c] font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {filteredQBInvoices.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
                <p className="text-gray-600">
                  {qbInvoices.length === 0 
                    ? 'No invoices yet. Invoices will appear here once the admin generates them from approved PODs.'
                    : 'No invoices match your search criteria.'}
                </p>
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
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQBInvoices.map(invoice => (
                        <tr key={invoice._id} className="border-b hover:bg-gray-50 transition-colors">
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
                            <div className="flex gap-2 flex-wrap">
                              {/* View in QuickBooks Button */}
                              {invoice.qbLink && (
                                <a
                                  href={invoice.qbLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors"
                                  title="View in QuickBooks"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                  </svg>
                                  QB
                                </a>
                              )}

                              {/* View Details Button */}
                              <button
                                onClick={() => setViewingInvoice(invoice)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                              >
                                View
                              </button>

                              {/* Approve/Reject Buttons */}
                              {invoice.clientApprovalStatus === true || invoice.clientApprovalStatus === 'APPROVED' ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">✓ Approved</span>
                              ) : invoice.clientApprovalStatus === false || invoice.clientApprovalStatus === 'REJECTED' ? (
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">✕ Rejected</span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleApproveQBInvoice(invoice._id)}
                                    disabled={approvingId === invoice._id}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                                  >
                                    {approvingId === invoice._id ? '...' : '✓'}
                                  </button>
                                  <button
                                    onClick={() => handleRejectQBInvoice(invoice._id)}
                                    disabled={rejectingId === invoice._id}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                                  >
                                    {rejectingId === invoice._id ? '...' : '✕'}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        {/* Invoice Details Modal */}
        {viewingInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">
              <div className="p-5 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Invoice Details</h3>
                    <p className="text-sm text-gray-500 mt-1">{viewingInvoice.invoiceNumber}</p>
                  </div>
                  <button
                    onClick={() => setViewingInvoice(null)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Invoice Number</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{viewingInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Load Reference</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{viewingInvoice.loadRef || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                    <p className="text-sm mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        viewingInvoice.invoiceType === 'CLIENT_INVOICE' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {viewingInvoice.invoiceType === 'CLIENT_INVOICE' ? 'Client' : 'Transporter'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Amount</p>
                    <p className="text-lg font-bold text-green-600 mt-1">{viewingInvoice.currency} {viewingInvoice.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Payment Status</p>
                    <p className="text-sm mt-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        viewingInvoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                        viewingInvoice.paymentStatus === 'PARTIAL_PAID' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {viewingInvoice.paymentStatus === 'PAID' ? '✅ Paid' :
                         viewingInvoice.paymentStatus === 'PARTIAL_PAID' ? '⏳ Partial' :
                         '❌ Unpaid'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Client Approval</p>
                    <p className="text-sm mt-1">
                      {viewingInvoice.clientApprovalStatus === true || viewingInvoice.clientApprovalStatus === 'APPROVED' ? (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">✓ Approved</span>
                      ) : viewingInvoice.clientApprovalStatus === false || viewingInvoice.clientApprovalStatus === 'REJECTED' ? (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">✕ Rejected</span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">⏳ Pending</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Due Date</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{viewingInvoice.dueDate ? new Date(viewingInvoice.dueDate).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Created</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(viewingInvoice.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {viewingInvoice.qbLink && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-3">QuickBooks Invoice</p>
                    <a
                      href={viewingInvoice.qbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      View in QuickBooks
                    </a>
                    <p className="text-xs text-gray-500 mt-2">Opens in new tab - Same link sent via email</p>
                  </div>
                )}
              </div>
              
              <div className="p-5 border-t flex gap-3 justify-end">
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
              <div className="p-5 border-b">
                <h3 className="font-bold text-lg text-gray-900">Reject Invoice</h3>
                <p className="text-sm text-gray-500 mt-1">Please provide a reason for rejection</p>
              </div>
              
              <div className="p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20 min-h-[100px]"
                  required
                />
              </div>
              
              <div className="p-5 border-t flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setRejectModalOpen(false)
                    setRejectionReason('')
                    setRejectingInvoiceId(null)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={rejectingInvoiceId && qbInvoices.find(i => i._id === rejectingInvoiceId) ? submitQBRejection : submitRejection}
                  disabled={!rejectionReason.trim() || rejectingId !== null}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejectingId ? 'Rejecting...' : 'Reject Invoice'}
                </button>
              </div>
            </div>
          </div>
        )}

      </PageLayout>
    </>
  )
}