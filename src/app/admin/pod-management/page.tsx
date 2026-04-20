'use client'
// src/app/admin/pod-management/page.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'

interface POD {
  _id: string
  loadRef: string
  transporterName: string
  clientName: string
  deliveryDate: string
  deliveryTime?: string
  notes?: string
  status: 'PENDING' | 'VERIFIED' | 'APPROVED'
  loadId: string
  uploadedAt: string
  podFile?: string
  mimeType?: string
}

export default function AdminPODManagementPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [pods, setPods] = useState<POD[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<'PENDING' | 'VERIFIED' | 'APPROVED' | 'ALL'>('PENDING')
  const [selectedPOD, setSelectedPOD] = useState<POD | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchPODs = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.append('status', filter)

      const res = await fetch(`/api/admin/pods?${params.toString()}`)

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to fetch PODs')
        return
      }

      const data = await res.json()
      if (data.success && Array.isArray(data.pods)) {
        setPods(data.pods)
      }
    } catch (err) {
      console.error('[AdminPOD] Error fetching PODs:', err)
      setError('Error loading PODs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchPODs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router, filter])

  const handleVerifyPOD = async (podId: string, approved: boolean) => {
    if (!approved && !rejectionReason?.trim()) {
      alert('Please enter a rejection reason')
      return
    }

    try {
      setVerifyingId(podId)
      setError('')

      const res = await fetch(`/api/admin/pods/${podId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approved ? 'APPROVED' : 'PENDING',
          rejectionReason: approved ? undefined : rejectionReason,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to update POD')
        setVerifyingId(null)
        return
      }

      setSuccess(approved ? '✓ POD approved successfully!' : '✗ POD rejected. Transporter will be notified.')
      setRejectionReason('')
      setSelectedPOD(null)
      setVerifyingId(null)

      setTimeout(() => {
        fetchPODs()
        setSuccess('')
      }, 2000)
    } catch (err) {
      console.error('[AdminPOD] Error updating POD:', err)
      setError('Failed to update POD. Please try again.')
      setVerifyingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      VERIFIED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <>
        <Topbar title="POD Management" />
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
      <Topbar title="Proof of Delivery (POD) Management" />
      <PageLayout>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 border-l-4 border-l-green-500 rounded text-green-800 text-sm">
            {success}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-3">
          {(['PENDING', 'VERIFIED', 'APPROVED', 'ALL'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === status
                  ? 'bg-[#3ab54a] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All PODs' : status}
            </button>
          ))}
        </div>

        {/* PODs Table */}
        {pods.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-gray-600">No PODs found in {filter} status.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Load Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Transporter</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Delivery Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Uploaded</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pods.map(pod => (
                    <tr key={pod._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#1a2a5e]">{pod.loadRef}</td>
                      <td className="px-4 py-3 text-sm">{pod.transporterName}</td>
                      <td className="px-4 py-3 text-sm">{pod.clientName}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(pod.deliveryDate).toLocaleDateString()}
                        {pod.deliveryTime && ` @ ${pod.deliveryTime}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(pod.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pod.status)}`}>
                          {pod.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedPOD(pod)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-semibold hover:bg-blue-200 transition-colors text-xs"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* POD Review Modal */}
        {selectedPOD && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1a2a5e]">POD Review: {selectedPOD.loadRef}</h2>
                <button
                  onClick={() => setSelectedPOD(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* POD Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Transporter</p>
                    <p className="text-lg font-semibold text-[#1a2a5e]">{selectedPOD.transporterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Client</p>
                    <p className="text-lg font-semibold text-[#1a2a5e]">{selectedPOD.clientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Delivery Date</p>
                    <p className="text-lg font-semibold">{new Date(selectedPOD.deliveryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Current Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPOD.status)}`}>
                      {selectedPOD.status}
                    </span>
                  </div>
                </div>

                {selectedPOD.notes && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Delivery Notes</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                      {selectedPOD.notes}
                    </p>
                  </div>
                )}

                {/* POD File Preview */}
                {selectedPOD.podFile && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">POD Document</p>
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                      {selectedPOD.mimeType?.startsWith('image/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedPOD.podFile}
                          alt="POD"
                          className="max-w-full h-auto rounded"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">📄</div>
                          <div>
                            <p className="font-semibold text-gray-700">PDF Document</p>
                            <a
                              href={selectedPOD.podFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#3ab54a] hover:underline text-sm"
                            >
                              Open PDF →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* View Full Document Button */}
                {selectedPOD.podFile && (
                  <div>
                    <button
                      onClick={async () => {
                        try {
                          // Check if podFile is already a direct Cloudinary URL
                          if (selectedPOD.podFile.startsWith('http')) {
                            window.open(selectedPOD.podFile, '_blank')
                          } else {
                            // It's an API route - fetch JSON and extract URL
                            const res = await fetch(selectedPOD.podFile)
                            const data = await res.json()
                            if (data.url) {
                              window.open(data.url, '_blank')
                            } else {
                              alert('Unable to open document')
                            }
                          }
                        } catch (err) {
                          console.error('Error opening document:', err)
                          alert('Failed to open document')
                        }
                      }}
                      className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      📄 View Full Document
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedPOD.status !== 'APPROVED' && (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-700">Take Action:</p>

                    <button
                      onClick={() => handleVerifyPOD(selectedPOD._id, true)}
                      disabled={verifyingId === selectedPOD._id}
                      className="w-full px-4 py-3 bg-green-50 border-2 border-green-300 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verifyingId === selectedPOD._id ? 'Approving...' : '✓ Approve POD'}
                    </button>

                    <div>
                      <label className="text-xs text-gray-600 font-semibold mb-2 block">Or Reject With Reason:</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why POD is rejected (transporter will see this)..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-none text-sm"
                      />
                      <button
                        onClick={() => handleVerifyPOD(selectedPOD._id, false)}
                        disabled={verifyingId === selectedPOD._id || !rejectionReason.trim()}
                        className="w-full mt-2 px-4 py-3 bg-red-50 border-2 border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {verifyingId === selectedPOD._id ? 'Rejecting...' : '✗ Reject POD'}
                      </button>
                    </div>
                  </div>
                )}

                {selectedPOD.status === 'APPROVED' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                    ✓ This POD has been approved. Transporter and Client have been notified.
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedPOD(null)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
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
