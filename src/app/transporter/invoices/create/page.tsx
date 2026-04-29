'use client'
// src/app/transporter/invoices/create/page.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Topbar, PageLayout } from '@/components/ui'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'

interface ApprovedPOD {
  _id: string
  loadId: string
  loadRef: string
  origin: string
  destination: string
  currency: string
  weight: number
}

export default function CreateTransporterInvoicePage() {
  const router = useRouter()
  const [pods, setPods] = useState<ApprovedPOD[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Form fields
  const [selectedPodId, setSelectedPodId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [tonnage, setTonnage] = useState('')
  const [currency, setCurrency] = useState('ZAR')
  const [notes, setNotes] = useState('')
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)

  useEffect(() => {
    fetchApprovedPODs()
  }, [])

  const fetchApprovedPODs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/transporter/pod/approved')
      if (!res.ok) {
        throw new Error('Failed to fetch approved PODs')
      }
      const data = await res.json()
      
      // Filter PODs that don't have invoices yet
      const podsWithoutInvoices = data.pods || []
      setPods(podsWithoutInvoices)
    } catch (err: any) {
      setError(err.message || 'Failed to load PODs')
    } finally {
      setLoading(false)
    }
  }

  const handlePodSelect = (podId: string) => {
    setSelectedPodId(podId)
    const pod = pods.find(p => p._id === podId)
    if (pod) {
      setCurrency(pod.currency || 'ZAR')
      setTonnage(pod.weight?.toString() || '')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB')
        return
      }
      setInvoiceFile(file)
      setError('')
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'fleetxchange')
    formData.append('folder', 'transporter-invoices')

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!res.ok) {
      throw new Error('Failed to upload file')
    }

    const data = await res.json()
    return data.secure_url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!selectedPodId || !invoiceNumber || !amount || !tonnage || !invoiceFile) {
      setError('Please fill in all required fields and upload invoice PDF')
      return
    }

    try {
      setSubmitting(true)
      setUploadProgress(30)

      // Upload file to Cloudinary
      const invoicePdfUrl = await uploadToCloudinary(invoiceFile)
      setUploadProgress(60)

      // Submit invoice
      const res = await fetch('/api/transporter/invoices/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podId: selectedPodId,
          invoiceNumber,
          amount: parseFloat(amount),
          currency,
          tonnage: parseFloat(tonnage),
          invoicePdfUrl,
          invoicePdfName: invoiceFile.name,
          notes
        })
      })

      setUploadProgress(90)

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to submit invoice')
      }

      setUploadProgress(100)
      setSuccess('✅ Invoice submitted successfully! Admin will review it shortly.')

      // Reset form
      setTimeout(() => {
        router.push('/transporter/invoices')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit invoice')
      setUploadProgress(0)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Topbar title="Submit Invoice" />
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
      <Topbar title="Submit Invoice" />
      <PageLayout>
        <div className="max-w-4xl mx-auto">
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Submit Your Invoice
            </h2>
            <p className="text-sm text-blue-800">
              Upload your invoice for an approved POD. Admin will review and approve it before processing payment.
            </p>
          </div>

          {pods.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No approved PODs available for invoicing.</p>
              <button
                onClick={() => router.push('/transporter/loads')}
                className="px-6 py-2 bg-[#3ab54a] text-white rounded font-semibold hover:bg-green-600"
              >
                View My Loads
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* POD Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Approved POD *
                </label>
                <select
                  value={selectedPodId}
                  onChange={(e) => handlePodSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black bg-white"
                  required
                >
                  <option value="">-- Choose a POD --</option>
                  {pods.map(pod => (
                    <option key={pod._id} value={pod._id}>
                      {pod.loadRef} - {pod.origin} → {pod.destination}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black"
                  placeholder="e.g., INV-2024-001"
                  required
                />
              </div>

              {/* Currency & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Currency *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black bg-white"
                  >
                    {['ZAR','USD','BWP','ZMW','ZWL','MZN','NAD','TZS','KES','UGX'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Tonnage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tonnage Delivered *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tonnage}
                  onChange={(e) => setTonnage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black"
                  placeholder="e.g., 3000"
                  required
                />
              </div>

              {/* Invoice PDF Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Invoice PDF *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black"
                  required
                />
                {invoiceFile && (
                  <p className="text-sm text-green-600 mt-2">✓ {invoiceFile.name}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 resize-none text-black"
                  placeholder="Any additional information..."
                />
              </div>

              {/* Progress Bar */}
              {submitting && uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#3ab54a] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-[#3ab54a] text-white rounded-lg font-bold hover:bg-[#2d9e3c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Invoice'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/transporter/invoices')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </PageLayout>
    </>
  )
}
