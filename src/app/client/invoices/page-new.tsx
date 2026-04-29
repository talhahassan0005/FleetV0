'use client'
// src/app/client/invoices/page-new.tsx
import { useEffect, useState } from 'react'
import { Topbar, PageLayout } from '@/components/ui'
import { Download } from 'lucide-react'

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
  createdAt: string
  sentAt?: string
  notes?: string
  loadRef: string
  loadRoute: string
}

export default function ClientInvoicesPageNew() {
  const [invoices, setInvoices] = useState<ClientInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/client/invoices')
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

  const handleDownloadPDF = (pdfUrl: string, fileName: string) => {
    // Open PDF in new tab for download
    window.open(pdfUrl, '_blank')
  }

  if (loading) {
    return (
      <>
        <Topbar title="My Invoices" />
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
      <Topbar title="My Invoices" />
      <PageLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1a2a5e]">My Invoices</h1>
            <p className="text-gray-600 mt-1">View and download your invoices</p>
          </div>

          {invoices.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices Yet</h3>
              <p className="text-gray-600">
                Your invoices will appear here once they are generated
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {invoices.map(invoice => (
                <div
                  key={invoice._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-[#3ab54a]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[#1a2a5e]">
                          {invoice.quickbooksInvoiceNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          invoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                          invoice.paymentStatus === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invoice.paymentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Load:</strong> {invoice.loadRef} - {invoice.loadRoute}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {invoice.sentAt 
                          ? `Sent ${new Date(invoice.sentAt).toLocaleDateString()}`
                          : `Created ${new Date(invoice.createdAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
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
                  </div>

                  {invoice.notes && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Notes</p>
                      <p className="text-sm text-blue-800">{invoice.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadPDF(invoice.quickbooksInvoicePdfUrl, invoice.quickbooksInvoicePdfName)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3ab54a] text-white rounded font-semibold hover:bg-green-600 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Invoice PDF
                    </button>
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
