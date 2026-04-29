'use client'
// src/app/admin/client-invoices/page.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Topbar, PageLayout } from '@/components/ui'
import { openDocument } from '@/lib/document-url'
import { AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ClientInvoice {
  _id: string
  quickbooksInvoiceNumber: string
  quickbooksInvoicePdfUrl: string
  quickbooksInvoicePdfName: string
  amount: number
  currency: string
  tonnage: number
  status: 'PENDING_SEND' | 'SENT'
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID'
  paymentDate?: string
  paymentNotes?: string
  createdAt: string
  sentAt?: string
  notes?: string
  loadRef: string
  loadRoute: string
  clientName: string
  clientEmail: string
  transporterInvoiceNumber: string
}

export default function AdminClientInvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<ClientInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING_SEND' | 'SENT'>('ALL')
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/client-invoices')
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

  const handleSendInvoice = async (invoiceId: string) => {
    if (!confirm('Send this invoice to the client?')) return

    try {
      setSendingId(invoiceId)
      setError('')
      setSuccess('')

      const res = await fetch(`/api/admin/client-invoices/${invoiceId}/send`, {
        method: 'POST'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to send invoice')
      }

      setSuccess('✅ Invoice sent to client successfully!')
      fetchInvoices()
    } catch (err: any) {
      setError(err.message || 'Failed to send invoice')
    } finally {
      setSendingId(null)
    }
  }

  const filteredInvoices = filter === 'ALL' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter)

  const pendingCount = invoices.filter(inv => inv.status === 'PENDING_SEND').length

  if (loading) {
    return (
      <>
        <Topbar title="Client Invoices" />
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
      <Topbar title="Client Invoices" />
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
              <h1 className="text-2xl font-bold text-[#1a2a5e]">Client Invoices</h1>
              <p className="text-gray-600 mt-1">Manage and send client invoices</p>
            </div>
            <div className="flex gap-3 items-center">
              {pendingCount > 0 && (
                <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
                  {pendingCount} Pending Send
                </div>
              )}
              <Link
                href="/admin/client-invoices/create"
                className="px-6 py-3 bg-[#3ab54a] text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
              >
                + Create Invoice
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 border-b">
            {(['ALL', 'PENDING_SEND', 'SENT'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 font-semibold transition-colors ${
                  filter === status
                    ? 'border-b-2 border-[#3ab54a] text-[#3ab54a]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.replace('_', ' ')}
                {status !== 'ALL' && ` (${invoices.filter(inv => inv.status === status).length})`}
              </button>
            ))}
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'PENDING_SEND' 
                  ? 'No invoices pending send' 
                  : `No ${filter.toLowerCase()} invoices`}
              </p>
              <Link
                href="/admin/client-invoices/create"
                className="inline-block px-6 py-2 bg-[#3ab54a] text-white rounded font-semibold hover:bg-green-600"
              >
                Create Invoice
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInvoices.map(invoice => (
                <div
                  key={invoice._id}
                  className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 ${
                    invoice.status === 'SENT' ? 'border-green-500' : 'border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[#1a2a5e]">
                          {invoice.quickbooksInvoiceNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          invoice.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {invoice.status === 'PENDING_SEND' ? 'PENDING SEND' : invoice.status}
                        </span>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          invoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                          invoice.paymentStatus === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invoice.paymentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Client:</strong> {invoice.clientName} ({invoice.clientEmail})
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Load:</strong> {invoice.loadRef} - {invoice.loadRoute}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Transporter Invoice:</strong> {invoice.transporterInvoiceNumber}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created {new Date(invoice.createdAt).toLocaleDateString()}
                        {invoice.sentAt && ` • Sent ${new Date(invoice.sentAt).toLocaleDateString()}`}
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
                      <p className="text-xs text-gray-500 uppercase font-semibold">Payment</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {invoice.paymentStatus === 'PAID' ? '✅ Paid' :
                         invoice.paymentStatus === 'PARTIALLY_PAID' ? '⏳ Partial' :
                         '❌ Unpaid'}
                      </p>
                    </div>
                  </div>

                  {invoice.notes && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Notes</p>
                      <p className="text-sm text-blue-800">{invoice.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openDocument(invoice.quickbooksInvoicePdfUrl, invoice.quickbooksInvoicePdfName)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold transition-colors text-sm"
                    >
                      📄 View Invoice
                    </button>

                    {invoice.status === 'PENDING_SEND' && (
                      <button
                        onClick={() => handleSendInvoice(invoice._id)}
                        disabled={sendingId === invoice._id}
                        className="px-4 py-2 bg-green-500 text-white rounded font-semibold hover:bg-green-600 disabled:opacity-50 text-sm"
                      >
                        {sendingId === invoice._id ? '⏳ Sending...' : '📧 Send to Client'}
                      </button>
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
