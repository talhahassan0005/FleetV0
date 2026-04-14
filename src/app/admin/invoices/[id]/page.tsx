'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Topbar, PageLayout } from '@/components/ui'
import { FileText, Download, ExternalLink, ArrowLeft } from 'lucide-react'

export default function InvoiceViewPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/admin/invoices/${params.id}`)
        const data = await res.json()
        setInvoice(data.invoice)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoice()
  }, [params.id])

  if (loading) return <div className="p-8">Loading...</div>
  if (!invoice) return <div className="p-8">Invoice not found</div>

  return (
    <>
      <Topbar title={`Invoice ${invoice.invoiceNumber}`} />
      <PageLayout>
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold">INVOICE</h1>
              <p className="text-gray-600">#{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{new Date(invoice.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">From:</h3>
              <p className="text-gray-700">FleetXchange</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">To:</h3>
              <p className="text-gray-700">{invoice.clientName || invoice.transporterName}</p>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">Load {invoice.loadRef} - {invoice.tonnageForThisInvoice}t</td>
                <td className="p-3 text-right font-semibold">{invoice.currency} {invoice.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 text-2xl font-bold border-t-2">
                <span>Total:</span>
                <span>{invoice.currency} {invoice.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {invoice.qbLink && (
            <div className="mt-8 pt-8 border-t">
              <a href={invoice.qbLink} target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline">
                <ExternalLink className="w-4 h-4" /> View in QuickBooks
              </a>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  )
}
