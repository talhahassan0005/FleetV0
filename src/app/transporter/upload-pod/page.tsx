'use client'
// src/app/transporter/upload-pod/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'
import { AlertCircle, CheckCircle, Upload, FileText } from 'lucide-react'

interface Load {
  _id: string
  ref: string
  origin: string
  destination: string
  status: string
  weightInTons?: number
  tonnage?: number
}

export default function UploadPODPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Form states
  const [loads, setLoads] = useState<Load[]>([])
  const [selectedLoadId, setSelectedLoadId] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [notes, setNotes] = useState('')
  const [podFile, setPodFile] = useState<File | null>(null)
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)

  // UI states
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Auth check
  useEffect(() => {
    if (session && session.user.role !== 'TRANSPORTER') {
      router.push('/login')
    }
  }, [session, router])

  // Fetch assigned loads
  useEffect(() => {
    const fetchLoads = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/transporter/loads')
        if (!res.ok) throw new Error('Failed to fetch loads')
        
        const data = await res.json()
        // Filter for ASSIGNED status loads (ready for delivery)
        const assignedLoads = data.loads?.filter((l: Load) => l.status === 'ASSIGNED') || []
        setLoads(assignedLoads)
        setError('')
      } catch (err) {
        setError('Failed to load your assigned loads')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchLoads()
    }
  }, [session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    // Validation
    if (!selectedLoadId || !deliveryDate || !deliveryTime || !podFile || !invoiceFile) {
      setError('Please fill in all required fields and select both POD and Invoice files')
      return
    }

    const formData = new FormData()
    formData.append('loadId', selectedLoadId)
    formData.append('deliveryDate', deliveryDate)
    formData.append('deliveryTime', deliveryTime)
    formData.append('notes', notes)
    formData.append('podFile', podFile)
    formData.append('invoiceFile', invoiceFile)

    try {
      setSubmitting(true)
      const res = await fetch('/api/pod/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to upload POD')
        return
      }

      setSuccess(true)
      setSuccessMessage(`POD and Invoice uploaded successfully! (ID: ${data.podId})`)
      
      // Reset form
      setTimeout(() => {
        setSelectedLoadId('')
        setDeliveryDate('')
        setDeliveryTime('')
        setNotes('')
        setPodFile(null)
        setInvoiceFile(null)
        setSuccess(false)
      }, 3000)

    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Topbar title="Upload POD & Invoice" />
        <PageLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
              <p className="text-gray-600 mt-4">Loading assigned loads...</p>
            </div>
          </div>
        </PageLayout>
      </>
    )
  }

  return (
    <>
      <Topbar title="Upload POD & Invoice" />
      <PageLayout>
        <div className="max-w-2xl mx-auto">
          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Upload Proof of Delivery (POD)</p>
              <p>Upload both your POD document and the transporter invoice together. Admin and client must approve before invoice processing.</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">{successMessage}</p>
                <p className="text-sm text-green-800 mt-1">Waiting for admin and client approval...</p>
              </div>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Load Selection */}
              <div className="bg-white/85 backdrop-blur-3xl rounded-2xl border-2 border-white/60 p-6 shadow-lg">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Load *
                </label>
                <select
                  value={selectedLoadId}
                  onChange={(e) => setSelectedLoadId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20 transition-all"
                >
                  <option value="">-- Choose an assigned load --</option>
                  {loads.length > 0 ? (
                    loads.map((load) => (
                      <option key={load._id} value={load._id}>
                        {load.ref} • {load.origin} → {load.destination}
                      </option>
                    ))
                  ) : (
                    <option disabled>No assigned loads available</option>
                  )}
                </select>
                {loads.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No assigned loads. Contact admin to get loads assigned.</p>
                )}
              </div>

              {/* Delivery Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/85 backdrop-blur-3xl rounded-2xl border-2 border-white/60 p-6 shadow-lg">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20 transition-all"
                  />
                </div>

                <div className="bg-white/85 backdrop-blur-3xl rounded-2xl border-2 border-white/60 p-6 shadow-lg">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Delivery Time *
                  </label>
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20 transition-all"
                  />
                </div>
              </div>

              {/* File Upload: POD */}
              <div className="bg-white/85 backdrop-blur-3xl rounded-2xl border-2 border-white/60 p-6 shadow-lg">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Proof of Delivery Document (POD) *
                </label>
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => setPodFile(e.target.files?.[0] || null)}
                    required
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20 transition-all"
                  />
                </div>
                {podFile && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {podFile.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">Accepted: PDF, JPG, PNG, GIF</p>
              </div>

              {/* File Upload: Invoice */}
              <div className="bg-white/85 backdrop-blur-3xl rounded-2xl border-2 border-white/60 p-6 shadow-lg">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Transporter Invoice *
                </label>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                    required
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20 transition-all"
                  />
                </div>
                {invoiceFile && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {invoiceFile.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">Accepted: PDF, JPG, PNG, GIF</p>
              </div>

              {/* Notes */}
              <div className="bg-white/85 backdrop-blur-3xl rounded-2xl border-2 border-white/60 p-6 shadow-lg">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information about the delivery..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20 transition-all"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-[#3ab54a] text-white font-semibold rounded-lg hover:bg-[#2d9e3c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Uploading...' : 'Upload POD & Invoice'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
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
