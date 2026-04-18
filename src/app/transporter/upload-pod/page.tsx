'use client'
// src/app/transporter/upload-pod/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'
import { AlertCircle, CheckCircle, Upload, FileText, Eye, Clock, CheckCircle2, Loader } from 'lucide-react'

interface Load {
  _id: string
  ref: string
  origin: string
  destination: string
  status: string
  weightInTons?: number
  tonnage?: number
}

interface SubmittedPOD {
  _id: string
  loadId: string
  loadRef: string
  route: string
  originalName: string
  fileUrl: string
  createdAt: string
  adminApprovalStatus: 'PENDING_ADMIN' | 'APPROVED'
  clientApprovalStatus: 'PENDING_CLIENT' | 'APPROVED'
  adminApprovedAt?: string | null
  clientApprovedAt?: string | null
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

  // Submitted PODs state
  const [submittedPODs, setSubmittedPODs] = useState<SubmittedPOD[]>([])
  const [podsLoading, setPodsLoading] = useState(false)
  const [selectedPOD, setSelectedPOD] = useState<SubmittedPOD | null>(null)
  const [showPODDetails, setShowPODDetails] = useState(false)

  // Invoice tracking state
  const [transporterInvoices, setTransporterInvoices] = useState<any[]>([])

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
        // Filter for loads ready for POD upload (ACCEPTED status means transporter's quote was accepted)
        const readyForPOD = data.data?.filter((l: Load) => 
          ['ACCEPTED', 'ASSIGNED', 'IN_TRANSIT'].includes(l.status)
        ) || []
        console.log('[UploadPOD] Loads ready for POD upload:', readyForPOD.length)
        setLoads(readyForPOD)
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

  // Fetch submitted PODs
  useEffect(() => {
    const fetchSubmittedPODs = async () => {
      try {
        setPodsLoading(true)
        const res = await fetch('/api/pod/upload')
        if (!res.ok) throw new Error('Failed to fetch PODs')
        
        const data = await res.json()
        const transporterPODs = data.data || []
        
        // Enrich with load details
        const enrichedPODs = await Promise.all(
          transporterPODs.map(async (pod: any) => {
            try {
              const loadRes = await fetch(`/api/loads/${pod.loadId}`)
              let loadData: any = null
              if (loadRes.ok) {
                const loadJson = await loadRes.json()
                loadData = loadJson.data || loadJson
              }
              
              return {
                _id: pod._id,
                loadId: pod.loadId,
                loadRef: loadData?.ref || 'Unknown',
                route: loadData ? `${loadData.origin} → ${loadData.destination}` : 'Unknown Route',
                originalName: pod.originalName,
                fileUrl: pod.fileUrl,
                createdAt: pod.createdAt,
                adminApprovalStatus: pod.adminApprovalStatus || 'PENDING_ADMIN',
                clientApprovalStatus: pod.clientApprovalStatus || 'PENDING_CLIENT',
                adminApprovedAt: pod.adminApprovedAt,
                clientApprovedAt: pod.clientApprovedAt,
              }
            } catch (err) {
              return {
                _id: pod._id,
                loadId: pod.loadId,
                loadRef: 'Unknown',
                route: 'Unknown Route',
                originalName: pod.originalName,
                fileUrl: pod.fileUrl,
                createdAt: pod.createdAt,
                adminApprovalStatus: pod.adminApprovalStatus || 'PENDING_ADMIN',
                clientApprovalStatus: pod.clientApprovalStatus || 'PENDING_CLIENT',
                adminApprovedAt: pod.adminApprovedAt,
                clientApprovedAt: pod.clientApprovedAt,
              }
            }
          })
        )
        
        // Sort by date descending
        enrichedPODs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setSubmittedPODs(enrichedPODs)
      } catch (err) {
        console.error('Failed to fetch submitted PODs:', err)
      } finally {
        setPodsLoading(false)
      }
    }

    // Fetch transporter invoices
    const fetchTransporterInvoices = async () => {
      try {
        const res = await fetch('/api/transporter/invoices')
        if (!res.ok) {
          console.error('Failed to fetch transporter invoices')
          return
        }
        const data = await res.json()
        setTransporterInvoices(data.invoices || [])
      } catch (err) {
        console.error('Failed to fetch transporter invoices:', err)
      }
    }

    if (session?.user) {
      fetchSubmittedPODs()
      fetchTransporterInvoices()
    }
  }, [session, success])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    // Validation
    if (!selectedLoadId || !deliveryDate || !deliveryTime || !podFile || !invoiceFile) {
      setError('Please fill in all required fields and select both POD and Invoice files')
      return
    }

    try {
      setSubmitting(true)
      
      // Step 1: Upload POD file directly to Cloudinary
      console.log('[UploadPOD] Uploading POD file to Cloudinary...')
      const { uploadToCloudinary } = await import('@/lib/cloudinary-client')
      
      const podUploadResult = await uploadToCloudinary(podFile, 'pods')
      console.log('[UploadPOD] POD uploaded:', podUploadResult.secureUrl)
      
      // Step 2: Upload Invoice file directly to Cloudinary
      console.log('[UploadPOD] Uploading Invoice file to Cloudinary...')
      const invoiceUploadResult = await uploadToCloudinary(invoiceFile, 'invoices')
      console.log('[UploadPOD] Invoice uploaded:', invoiceUploadResult.secureUrl)
      
      // Step 3: Send metadata + file URLs to API (not the actual files)
      const payload = {
        loadId: selectedLoadId,
        deliveryDate,
        deliveryTime,
        notes,
        podFileUrl: podUploadResult.secureUrl,
        podFileName: podFile.name,
        podPublicId: podUploadResult.publicId,
        invoiceFileUrl: invoiceUploadResult.secureUrl,
        invoiceFileName: invoiceFile.name,
        invoicePublicId: invoiceUploadResult.publicId
      }
      
      const res = await fetch('/api/pod/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to upload POD')
        return
      }

      setSuccess(true)
      setSuccessMessage(`POD and Invoice uploaded successfully!`)
      
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

    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.')
      console.error('[UploadPOD] Error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  function getStatusBadge(pod: SubmittedPOD) {
    const adminApproved = pod.adminApprovalStatus === 'APPROVED'
    const clientApproved = pod.clientApprovalStatus === 'APPROVED'
    
    if (adminApproved && clientApproved) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Approved
        </div>
      )
    } else if (adminApproved) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
          <Clock className="w-4 h-4" />
          Awaiting Client
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
          <Loader className="w-4 h-4 animate-spin" />
          Pending Admin
        </div>
      )
    }
  }

  // Helper to get invoice for a specific load
  const getInvoiceForLoad = (loadId: string) => 
    transporterInvoices.find(inv => inv.loadId === loadId || inv.loadId?.toString() === loadId)

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
        <div className="max-w-7xl mx-auto">
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

          {/* Submitted PODs Section */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Submitted PODs</h2>
              <p className="text-gray-600 text-sm">Track the approval status of your submitted proofs of delivery</p>
            </div>

            {podsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
                  <p className="text-gray-600 mt-4">Loading submitted PODs...</p>
                </div>
              </div>
            ) : submittedPODs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No submitted PODs yet</p>
                <p className="text-gray-500 text-sm mt-1">Submit your first POD above to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Load</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Document</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Invoice #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Payment</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submittedPODs.map((pod) => (
                      <tr key={pod._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-900">{pod.loadRef}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">{pod.route}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600 truncate max-w-xs" title={pod.originalName}>
                            {pod.originalName}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(pod)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {(() => {
                            const inv = getInvoiceForLoad(pod.loadId)
                            return inv ? (
                              <span className="text-blue-600 font-medium text-xs">{inv.invoiceNumber}</span>
                            ) : (
                              <span className="text-gray-400 text-xs">Pending</span>
                            )
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {(() => {
                            const inv = getInvoiceForLoad(pod.loadId)
                            if (!inv) return <span className="text-gray-400 text-xs">—</span>
                            const colors: Record<string, string> = {
                              'PAID': 'bg-green-100 text-green-700',
                              'PARTIAL_PAID': 'bg-yellow-100 text-yellow-700',
                              'UNPAID': 'bg-red-100 text-red-700',
                            }
                            return (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${colors[inv.paymentStatus as keyof typeof colors] || 'bg-gray-100 text-gray-600'}`}>
                                {inv.paymentStatus?.replace('_', ' ') || 'UNPAID'}
                              </span>
                            )
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">
                            {new Date(pod.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedPOD(pod)
                              setShowPODDetails(true)
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                          >
                            <Eye className="w-4 h-4" />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* POD Details Modal */}
        {showPODDetails && selectedPOD && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-6 flex items-center justify-between bg-gray-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">POD Details</h2>
                  <p className="text-sm text-gray-600 mt-1">Load: {selectedPOD.loadRef}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPODDetails(false)
                    setSelectedPOD(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Load Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Load Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Load Reference</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{selectedPOD.loadRef}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Route</p>
                      <p className="text-sm text-gray-800 mt-1">{selectedPOD.route}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Submitted Date</p>
                      <p className="text-sm text-gray-800 mt-1">
                        {new Date(selectedPOD.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Document</p>
                      <p className="text-sm text-gray-800 mt-1 truncate" title={selectedPOD.originalName}>
                        {selectedPOD.originalName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Approval Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Status</h3>
                  <div className="space-y-3">
                    {/* Admin Status */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">Admin Approval</p>
                        {selectedPOD.adminApprovalStatus === 'APPROVED' ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            Approved
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            <Loader className="w-4 h-4 animate-spin" />
                            Pending
                          </div>
                        )}
                      </div>
                      {selectedPOD.adminApprovedAt && (
                        <p className="text-xs text-gray-600">
                          Approved on {new Date(selectedPOD.adminApprovedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Client Status */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">Client Approval</p>
                        {selectedPOD.clientApprovalStatus === 'APPROVED' ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            Approved
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            <Clock className="w-4 h-4" />
                            Awaiting
                          </div>
                        )}
                      </div>
                      {selectedPOD.clientApprovedAt && (
                        <p className="text-xs text-gray-600">
                          Approved on {new Date(selectedPOD.clientApprovedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Link */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Document</h3>
                  {selectedPOD.fileUrl && typeof selectedPOD.fileUrl === 'string' && selectedPOD.fileUrl.startsWith('http') ? (
                    <a
                      href={selectedPOD.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900">{selectedPOD.originalName}</p>
                        <p className="text-xs text-blue-700 mt-1">Click to download or view</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </a>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-600 text-sm">Document file is not available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPODDetails(false)
                    setSelectedPOD(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  )
}
