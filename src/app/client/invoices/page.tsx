'use client'
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
  invoiceNumber: string
  loadRef: string
  amount: number
  status: 'DRAFT' | 'SENT' | 'PENDING_PAYMENT' | 'PAID'
  createdAt: string
  approvedByClient?: boolean
  approvedByAdmin?: boolean
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
  invoice?: Invoice
}

export default function ClientInvoicesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loads, setLoads] = useState<LoadForInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'deliverable' | 'invoices'>('deliverable')
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null)
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [invoiceFormData, setInvoiceFormData] = useState({
    loadId: '',
    amount: 0,
    currency: 'ZAR',
    itemDescription: '',
    notes: '',
  })

  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    fetchLoads()
  }, [session, router])

  const fetchLoads = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/client/loads-with-pods')

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to fetch loads')
        return
      }

      const data = await res.json()
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

  const handleCreateInvoice = async (loadId: string) => {
    const load = loads.find(l => l._id === loadId)
    if (!load) return

    setSelectedLoadId(loadId)
    setInvoiceFormData({
      loadId,
      amount: load.finalPrice,
      currency: load.currency,
      itemDescription: `${load.cargoType || 'Freight'} from ${load.origin} to ${load.destination}`,
      notes: '',
    })
  }

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invoiceFormData.loadId) {
      setError('Please select a load')
      return
    }

    try {
      setCreatingInvoice(true)
      setError('')

      const res = await fetch('/api/client/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceFormData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to create invoice')
        setCreatingInvoice(false)
        return
      }

      const data = await res.json()
      alert(`✓ Invoice ${data.invoiceNumber} created successfully!`)
      setSelectedLoadId(null)
      setInvoiceFormData({
        loadId: '',
        amount: 0,
        currency: 'ZAR',
        itemDescription: '',
        notes: '',
      })
      setCreatingInvoice(false)
      fetchLoads()
      setTab('invoices')
    } catch (err) {
      console.error('[ClientInvoices] Error creating invoice:', err)
      setError('Failed to create invoice. Please try again.')
      setCreatingInvoice(false)
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
        <Topbar title="Invoices & PODs" />
        <PageLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
          </div>
        </PageLayout>
      </>
    )
  }

  const deliverableLoads = loads.filter(l => l.status === 'DELIVERED' && l.pod && l.pod.status === 'APPROVED')
  const invoicedLoads = loads.filter(l => l.invoice)

  return (
    <>
      <Topbar title="Invoices & Proof of Delivery" />
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
              onClick={() => setTab('deliverable')}
              className={`pb-3 px-1 font-semibold transition-colors border-b-2 ${
                tab === 'deliverable'
                  ? 'border-[#3ab54a] text-[#3ab54a]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Ready to Invoice ({deliverableLoads.length})
            </button>
            <button
              onClick={() => setTab('invoices')}
              className={`pb-3 px-1 font-semibold transition-colors border-b-2 ${
                tab === 'invoices'
                  ? 'border-[#3ab54a] text-[#3ab54a]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Invoices ({invoicedLoads.length})
            </button>
          </div>
        </div>

        {/* Tab: Ready to Invoice */}
        {tab === 'deliverable' && (
          <div>
            {deliverableLoads.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
                <p className="text-gray-600">No delivered loads with approved PODs ready for invoicing.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliverableLoads.map(load => (
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
                        <p className="text-xs text-gray-500 uppercase">Amount</p>
                        <p className="text-lg font-bold text-green-600">{load.currency} {load.finalPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">POD Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(load.pod?.status || 'PENDING')}`}>
                          {load.pod?.status}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateInvoice(load._id)}
                      className="px-4 py-2 bg-[#3ab54a] text-white rounded font-semibold hover:bg-[#2d9e3c] transition-colors text-sm"
                    >
                      Create Invoice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: My Invoices */}
        {tab === 'invoices' && (
          <div>
            {invoicedLoads.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
                <p className="text-gray-600">No invoices yet. Create one from the "Ready to Invoice" tab.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Invoice #</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Load</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Client Approval</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Admin Approval</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicedLoads.map(load => (
                        <tr key={load._id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-[#1a2a5e]">{load.invoice?.invoiceNumber}</td>
                          <td className="px-4 py-3 text-sm">{load.ref}</td>
                          <td className="px-4 py-3 font-semibold text-green-600">{load.currency} {load.invoice?.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">
                            {load.invoice?.approvedByClient ? (
                              <span className="text-green-600 font-semibold">✓ Approved</span>
                            ) : (
                              <span className="text-yellow-600 font-semibold">⏳ Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {load.invoice?.approvedByAdmin ? (
                              <span className="text-green-600 font-semibold">✓ Approved</span>
                            ) : (
                              <span className="text-yellow-600 font-semibold">⏳ Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(load.invoice?.status || 'DRAFT')}`}>
                              {load.invoice?.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {load.invoice?.createdAt ? new Date(load.invoice.createdAt).toLocaleDateString() : '-'}
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

        {/* Invoice Creation Modal */}
        {selectedLoadId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1a2a5e]">Create Invoice</h2>
                <button
                  onClick={() => setSelectedLoadId(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitInvoice} className="p-6 space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded text-red-800 text-sm">
                    {error}
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Invoice Amount ({invoiceFormData.currency})
                  </label>
                  <input
                    type="number"
                    value={invoiceFormData.amount}
                    onChange={(e) =>
                      setInvoiceFormData(prev => ({
                        ...prev,
                        amount: parseFloat(e.target.value),
                      }))
                    }
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-lg font-semibold"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-filled from load price (editable if needed)</p>
                </div>

                {/* Item Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={invoiceFormData.itemDescription}
                    onChange={(e) =>
                      setInvoiceFormData(prev => ({
                        ...prev,
                        itemDescription: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes/Terms
                  </label>
                  <textarea
                    value={invoiceFormData.notes}
                    onChange={(e) =>
                      setInvoiceFormData(prev => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 resize-none"
                    placeholder="Payment terms, due date, special conditions..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={creatingInvoice}
                    className="flex-1 px-4 py-2 bg-[#3ab54a] text-white rounded-lg font-semibold hover:bg-[#2d9e3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingInvoice ? 'Creating...' : 'Create Invoice'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLoadId(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  )
}
