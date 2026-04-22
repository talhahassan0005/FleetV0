'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'

interface Invoice {
  _id: string
  invoiceNumber: string
  loadId: string
  amount: number
  currency: string
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL_PAID'
  createdAt: string
  fileUrl?: string
}

export default function TransporterInvoicesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    loadId: '',
    invoiceNumber: '',
    amount: '',
    currency: 'ZAR',
    file: null as File | null
  })

  useEffect(() => {
    if (!session?.user?.id || session.user.role !== 'TRANSPORTER') {
      router.push('/login')
      return
    }
    fetchInvoices()
  }, [session, router])

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

  const handleUploadInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadForm.file || !uploadForm.invoiceNumber || !uploadForm.amount) {
      alert('Please fill all required fields')
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('invoiceNumber', uploadForm.invoiceNumber)
      formData.append('amount', uploadForm.amount)
      formData.append('currency', uploadForm.currency)
      if (uploadForm.loadId) {
        formData.append('loadId', uploadForm.loadId)
      }

      const res = await fetch('/api/transporter/invoices', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to upload invoice')
      }

      alert('✅ Invoice uploaded successfully')
      setShowUploadModal(false)
      setUploadForm({
        loadId: '',
        invoiceNumber: '',
        amount: '',
        currency: 'ZAR',
        file: null
      })
      fetchInvoices()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setUploading(false)
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
      <Topbar title="My Invoices">
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-fx text-xs px-4 py-2"
        >
          + Upload Invoice
        </button>
      </Topbar>
      
      <PageLayout>
        {invoices.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-gray-600 mb-4">No invoices uploaded yet.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-fx text-sm px-6 py-2"
            >
              Upload Your First Invoice
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Invoice #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Payment Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Uploaded</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#1a2a5e]">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        {invoice.currency} {invoice.amount.toLocaleString()}
                      </td>
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
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {invoice.fileUrl && (
                          <button
                            onClick={() => window.open(invoice.fileUrl?.replace('/fl_attachment/', '/'), '_blank')}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1a2a5e] text-white rounded-lg hover:bg-[#152247] transition-colors text-sm font-semibold"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Document
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload Invoice Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
              <div className="p-5 border-b">
                <h3 className="font-bold text-lg text-gray-900">Upload Invoice</h3>
                <p className="text-sm text-gray-500 mt-1">Upload your invoice for payment tracking</p>
              </div>
              
              <form onSubmit={handleUploadInvoice} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.invoiceNumber}
                    onChange={(e) => setUploadForm({...uploadForm, invoiceNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={uploadForm.amount}
                    onChange={(e) => setUploadForm({...uploadForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadForm.currency}
                    onChange={(e) => setUploadForm({...uploadForm, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                  >
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="BWP">BWP - Botswana Pula</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="ZWL">ZWL - Zimbabwe Dollar</option>
                    <option value="MZN">MZN - Mozambican Metical</option>
                    <option value="ZMW">ZMW - Zambian Kwacha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Load ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.loadId}
                    onChange={(e) => setUploadForm({...uploadForm, loadId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                    placeholder="Link to specific load"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Invoice File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG format</p>
                </div>
              </form>
              
              <div className="p-5 border-t flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadForm({
                      loadId: '',
                      invoiceNumber: '',
                      amount: '',
                      currency: 'ZAR',
                      file: null
                    })
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleUploadInvoice}
                  disabled={uploading}
                  className="px-4 py-2 bg-[#3ab54a] text-white rounded-lg font-semibold hover:bg-[#2d9e3c] transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Invoice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  )
}
