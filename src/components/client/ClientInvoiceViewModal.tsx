'use client'
// src/components/client/ClientInvoiceViewModal.tsx
import { Download } from 'lucide-react'

interface Invoice {
  _id: string
  invoiceNumber: string
  invoiceType: string
  amount: number
  currency: string
  paymentStatus: string
  dueDate?: string
  createdAt: string
  loadRef?: string
  qbLink?: string
}

interface ClientInvoiceViewModalProps {
  invoice: Invoice | null
  onClose: () => void
}

export default function ClientInvoiceViewModal({
  invoice,
  onClose,
}: ClientInvoiceViewModalProps) {
  if (!invoice) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">
            Invoice {invoice.invoiceNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invoice Details */}
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">Invoice Details</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Invoice Number</p>
                <p className="text-gray-900 font-semibold">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Type</p>
                <p className="text-gray-900 font-semibold">
                  {invoice.invoiceType === 'CLIENT_INVOICE' ? 'Client Invoice' : 'Transporter Invoice'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="text-gray-900 font-semibold text-lg text-green-600">
                  {invoice.currency} {invoice.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Payment Status</p>
                <p className="">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    invoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                    invoice.paymentStatus === 'PARTIAL_PAID' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {invoice.paymentStatus === 'PAID' ? '✅ Paid' :
                     invoice.paymentStatus === 'PARTIAL_PAID' ? '⏳ Partial' :
                     '❌ Unpaid'}
                  </span>
                </p>
              </div>
              {invoice.loadRef && (
                <div>
                  <p className="text-gray-600">Load Reference</p>
                  <p className="text-gray-900 font-semibold">{invoice.loadRef}</p>
                </div>
              )}
              {invoice.dueDate && (
                <div>
                  <p className="text-gray-600">Due Date</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Created</p>
                <p className="text-gray-900 font-semibold">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* View Invoice Button */}
          {invoice.qbLink && (
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <p className="text-xs text-blue-700 mb-3 uppercase font-semibold">View in QuickBooks</p>
              <a
                href={invoice.qbLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold bg-[#3ab54a] text-white hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                📄 Open in QuickBooks
              </a>
              <p className="text-xs text-blue-600 mt-2">Opens in a new tab</p>
            </div>
          )}

          {/* Close Button */}
          <div className="border-t border-gray-100 pt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
