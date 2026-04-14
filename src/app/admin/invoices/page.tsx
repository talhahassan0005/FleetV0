// src/app/admin/invoices/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Topbar, PageLayout } from '@/components/ui'
import {
  DollarSign,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit2,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface Invoice {
  _id: string
  invoiceNumber: string
  invoiceType: 'TRANSPORTER_INVOICE' | 'CLIENT_INVOICE'
  amount: number
  currency: string
  paymentStatus: 'UNPAID' | 'PARTIAL_PAID' | 'PAID'
  paymentAmount?: number
  paymentNotes?: string
  createdAt: string
  dueDate?: string
  clientName?: string
  transporterName?: string
  loadRef?: string
  tonnage?: number
  progressPercentage?: number
  podId?: string
  clientApprovalStatus?: string | boolean | null
  rejectionReason?: string | null
  clientRejectionReason?: string
  qbLink?: string
}

interface FilterState {
  invoiceType: string
  paymentStatus: string
  searchTerm: string
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterState>({
    invoiceType: 'all',
    paymentStatus: 'all',
    searchTerm: ''
  })
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: 'UNPAID',
    paymentAmount: 0,
    paymentNotes: ''
  })
  const [updating, setUpdating] = useState(false)

  // Summary stats
  const stats = {
    total: invoices.length,
    unpaid: invoices.filter(i => i.paymentStatus === 'UNPAID').length,
    partialPaid: invoices.filter(i => i.paymentStatus === 'PARTIAL_PAID').length,
    paid: invoices.filter(i => i.paymentStatus === 'PAID').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0),
    collectedAmount: invoices.reduce((sum, i) => sum + (i.paymentAmount || 0), 0),
  }

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/invoices')
      
      if (!res.ok) {
        throw new Error('Failed to fetch invoices')
      }
      
      const data = await res.json()
      setInvoices(data.invoices || [])
      setError('')
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handlePaymentStatusChange = async () => {
    if (!selectedInvoice) return

    try {
      setUpdating(true)
      const res = await fetch(
        `/api/admin/invoices/${selectedInvoice._id}/payment-status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentStatus: paymentForm.paymentStatus,
            paymentAmount: paymentForm.paymentAmount || selectedInvoice.amount,
            paymentNotes: paymentForm.paymentNotes
          })
        }
      )

      if (!res.ok) {
        throw new Error('Failed to update payment status')
      }

      // Refresh invoices
      await fetchInvoices()
      setShowPaymentModal(false)
      setSelectedInvoice(null)
      setPaymentForm({
        paymentStatus: 'UNPAID',
        paymentAmount: 0,
        paymentNotes: ''
      })
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating payment status:', err)
    } finally {
      setUpdating(false)
    }
  }

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setPaymentForm({
      paymentStatus: invoice.paymentStatus,
      paymentAmount: invoice.paymentAmount || invoice.amount,
      paymentNotes: invoice.paymentNotes || ''
    })
    setShowPaymentModal(true)
  }

  // Apply filters
  const filteredInvoices = invoices.filter(invoice => {
    if (filter.invoiceType !== 'all' && invoice.invoiceType !== filter.invoiceType) {
      return false
    }
    if (filter.paymentStatus !== 'all' && invoice.paymentStatus !== filter.paymentStatus) {
      return false
    }
    if (filter.searchTerm) {
      const search = filter.searchTerm.toLowerCase()
      return (
        invoice.invoiceNumber?.toLowerCase().includes(search) ||
        invoice.clientName?.toLowerCase().includes(search) ||
        invoice.transporterName?.toLowerCase().includes(search) ||
        invoice.loadRef?.toLowerCase().includes(search)
      )
    }
    return true
  })

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'PARTIAL_PAID':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'UNPAID':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />
      case 'PARTIAL_PAID':
        return <Clock className="w-4 h-4" />
      case 'UNPAID':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const getInvoiceTypeLabel = (type: string) => {
    return type === 'TRANSPORTER_INVOICE' ? 'Transporter' : 'Client'
  }

  return (
    <>
      <Topbar title="Invoices" />
      <PageLayout>
        {/* Header with Create Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all invoices and payment status</p>
          </div>
          <a
            href="/admin/invoices/create"
            className="px-6 py-3 bg-[#3ab54a] text-white font-semibold rounded-lg hover:bg-[#2d9e3c] transition-colors flex items-center gap-2"
          >
            <span>+</span> Create Invoice
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="p-6 bg-white border-l-4 border-l-blue-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-l-red-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Unpaid Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{stats.unpaid}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-l-yellow-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Partial Paid</p>
                <p className="text-3xl font-bold text-gray-900">{stats.partialPaid}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-l-green-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Paid Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{stats.paid}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-l-purple-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                <p className="text-sm font-semibold text-gray-900">
                  {((stats.paid / stats.total) * 100).toFixed(0)}% collected
                </p>
              </div>
              <div className="text-xs text-gray-500 text-right">
                <p className="font-bold">{stats.collectedAmount.toLocaleString()}</p>
                <p>of {stats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="p-4 mb-6 bg-white rounded-lg">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            
            <div>
              <label className="text-xs font-semibold text-gray-600">Invoice Type</label>
              <select
                value={filter.invoiceType}
                onChange={(e) => setFilter({ ...filter, invoiceType: e.target.value })}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
              >
                <option value="all">All Types</option>
                <option value="TRANSPORTER_INVOICE">Transporter</option>
                <option value="CLIENT_INVOICE">Client</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Payment Status</label>
              <select
                value={filter.paymentStatus}
                onChange={(e) => setFilter({ ...filter, paymentStatus: e.target.value })}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL_PAID">Partial Paid</option>
                <option value="PAID">Paid</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600">Search</label>
              <input
                type="text"
                placeholder="Invoice #, client, transporter, load..."
                value={filter.searchTerm}
                onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <button
              onClick={fetchInvoices}
              className="mt-6 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-hidden bg-white rounded-lg">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <p className="text-gray-500 mt-2">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Party</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Load Ref</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Client Approval</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Paid Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {getInvoiceTypeLabel(invoice.invoiceType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {invoice.invoiceType === 'TRANSPORTER_INVOICE'
                          ? invoice.transporterName
                          : invoice.clientName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {invoice.loadRef}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {invoice.currency} {invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getPaymentStatusStyle(invoice.paymentStatus)} w-fit`}>
                          {getPaymentStatusIcon(invoice.paymentStatus)}
                          <span className="font-medium text-xs">
                            {invoice.paymentStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {invoice.clientApprovalStatus === true ? (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-green-100 text-green-800 border-green-300 w-fit">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium text-xs">✓ Approved</span>
                          </div>
                        ) : invoice.clientApprovalStatus === false ? (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-red-100 text-red-800 border-red-300 w-fit">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium text-xs">✕ Rejected</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-yellow-100 text-yellow-800 border-yellow-300 w-fit">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium text-xs">⏳ Pending</span>
                          </div>
                        )}
                        {invoice.clientRejectionReason && (
                          <p className="text-xs text-red-600 mt-1">Reason: {invoice.clientRejectionReason}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {invoice.paymentAmount ? (
                          <>
                            <p className="font-semibold text-green-600">
                              {invoice.currency} {invoice.paymentAmount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(((invoice.paymentAmount || 0) / invoice.amount) * 100).toFixed(0)}% paid
                            </p>
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/invoices/${invoice._id}`}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition font-medium text-xs"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                          <button
                            onClick={() => openPaymentModal(invoice)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-xs"
                          >
                            <Edit2 className="w-4 h-4" />
                            Update
                          </button>
                          {invoice.qbLink && (
                            <a
                              href={invoice.qbLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium text-xs"
                              title="View in QuickBooks"
                            >
                              <ExternalLink className="w-4 h-4" />
                              QB
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Status Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Update Payment Status</h2>
                    <p className="text-sm text-gray-600">Invoice {selectedInvoice.invoiceNumber}</p>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">Type</p>
                      <p className="font-semibold text-gray-900">
                        {getInvoiceTypeLabel(selectedInvoice.invoiceType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Amount</p>
                      <p className="font-semibold text-gray-900">
                        {selectedInvoice.currency} {selectedInvoice.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600 text-xs">Current Status</p>
                      <p className="font-semibold text-gray-900">
                        {selectedInvoice.paymentStatus.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handlePaymentStatusChange()
                  }}
                  className="space-y-4"
                >
                  {/* Payment Status */}
                  <div>
                    <label className="text-sm font-semibold text-gray-900">Payment Status</label>
                    <select
                      value={paymentForm.paymentStatus}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentStatus: e.target.value })}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="UNPAID">Unpaid</option>
                      <option value="PARTIAL_PAID">Partial Paid</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </div>

                  {/* Amount Paid */}
                  {paymentForm.paymentStatus !== 'UNPAID' && (
                    <div>
                      <label className="text-sm font-semibold text-gray-900">Amount Paid</label>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-gray-600 font-medium">{selectedInvoice.currency}</span>
                        <input
                          type="number"
                          value={paymentForm.paymentAmount}
                          onChange={(e) => setPaymentForm({
                            ...paymentForm,
                            paymentAmount: parseFloat(e.target.value) || 0
                          })}
                          min="0"
                          max={selectedInvoice.amount}
                          step="0.01"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      {paymentForm.paymentStatus === 'PARTIAL_PAID' && (
                        <p className="text-xs text-gray-500 mt-2">
                          Remaining: {selectedInvoice.currency} {(selectedInvoice.amount - paymentForm.paymentAmount).toLocaleString()}
                        </p>
                      )}
                      {paymentForm.paymentStatus === 'PAID' && (
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          ✓ Mark this invoice as fully paid
                        </p>
                      )}
                    </div>
                  )}

                  {/* Payment Notes */}
                  <div>
                    <label className="text-sm font-semibold text-gray-900">Payment Notes</label>
                    <textarea
                      value={paymentForm.paymentNotes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentNotes: e.target.value })}
                      placeholder="QB receipt #, transaction ID, cheque #, etc."
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-24 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Reference for your records</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      disabled={updating}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Update Status
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  )
}
