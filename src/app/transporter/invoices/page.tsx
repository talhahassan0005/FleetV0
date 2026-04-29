'use client'
import { openDocument } from '@/lib/document-url'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Topbar, PageLayout } from '@/components/ui'
import Link from 'next/link'

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
}

export default function TransporterInvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/transporter/invoices')
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

  if (loading) {
    return (
      <>
        <Topbar title="My Invoices" />
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
      <Topbar title="My Invoices" />
      
      <PageLayout>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a2a5e]">My Invoices</h1>
            <p className="text-gray-600 mt-1">Submit and track your invoices</p>
          </div>
          <Link
            href="/transporter/invoices/create"
            className="px-6 py-3 bg-[#3ab54a] text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
          >
            + Submit Invoice
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices Yet</h3>
            <p className="text-gray-600 mb-6">
              Submit your first invoice for an approved POD
            </p>
            <Link
              href="/transporter/invoices/create"
              className="inline-block px-6 py-2 bg-[#3ab54a] text-white rounded font-semibold hover:bg-[#2d9e3c] transition-colors"
            >
              Submit Invoice
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {invoices.map(invoice => (
              <div
                key={invoice._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-[#3ab54a]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#1a2a5e]">
                      {invoice.invoiceNumber}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {invoice.loadRef} - {invoice.loadRoute}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted {new Date(invoice.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    invoice.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    invoice.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {invoice.status === 'PENDING_ADMIN_REVIEW' ? 'PENDING REVIEW' : invoice.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Amount</p>
                    <p className="text-lg font-bold text-[#3ab54a]">
                      {invoice.currency} {invoice.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Tonnage</p>
                    <p className="text-lg font-semibold text-gray-700">{invoice.tonnage} tons</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {invoice.status === 'APPROVED' ? '✅ Approved' :
                       invoice.status === 'REJECTED' ? '❌ Rejected' :
                       '⏳ Pending Review'}
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
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{invoice.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openDocument(invoice.invoicePdfUrl, invoice.invoicePdfName)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold transition-colors text-sm"
                  >
                    📄 View Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageLayout>
    </>
  )
}