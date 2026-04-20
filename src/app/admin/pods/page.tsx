'use client'
// src/app/admin/pods/page.tsx

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Topbar, PageLayout } from '@/components/ui'
import { CheckCircle, XCircle, FileText, Download, MessageSquare } from 'lucide-react'

interface POD {
  _id: string
  loadRef: string
  origin: string
  destination: string
  transporterName: string
  transporterEmail: string
  uploadedAt: string
  podFileName: string
  podUrl: string
  status: string
  loadId: string
  amount: number
  currency: string
}

export default function AdminPodsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [pods, setPods] = useState<POD[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null)
  const [comments, setComments] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [session, router])

  useEffect(() => {
    if (session?.user) {
      fetchPendingPODs()
    }
  }, [session])

  const fetchPendingPODs = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/admin/pods/pending')
      
      console.log('[AdminPODs] Fetch response status:', res.status)
      
      if (!res.ok) {
        const errorData = await res.json()
        console.error('[AdminPODs] Error response:', errorData)
        throw new Error(errorData.error || 'Failed to fetch PODs')
      }

      const data = await res.json()
      console.log('[AdminPODs] Fetched PODs:', data)
      
      setPods(data.data || [])
      setError('')
    } catch (err: any) {
      console.error('[AdminPODs] Fetch error:', err)
      setError(`Failed to load PODs: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClick = (podId: string) => {
    setSelectedPodId(podId)
    setComments('')
    setShowModal(true)
  }

  const handleSubmitApproval = async () => {
    if (!selectedPodId) return

    try {
      setApproving(selectedPodId)
      setError('')

      const res = await fetch(`/api/admin/pods/${selectedPodId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to approve POD')
      }

      setSuccess('✅ POD approved and forwarded to client!')
      setShowModal(false)
      setSelectedPodId(null)
      
      // Refresh list
      setTimeout(() => {
        fetchPendingPODs()
        setSuccess('')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to approve POD')
    } finally {
      setApproving(null)
    }
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
      <Topbar title="POD Management" />
      <PageLayout>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800">
            {success}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1a2a5e] mb-2">Pending POD Approvals</h2>
          <p className="text-gray-600">{pods.length} POD(s) awaiting review</p>
        </div>

        {pods.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No pending PODs</p>
            <p className="text-sm text-gray-500">All PODs have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pods.map((pod) => (
              <div
                key={pod._id}
                className="bg-white rounded-lg shadow p-6 border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow"
              >
                <div className="grid md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Load Ref</p>
                    <p className="font-bold text-[#1a2a5e]">{pod.loadRef}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Route</p>
                    <p className="text-sm">{pod.origin} → {pod.destination}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Transporter</p>
                    <p className="text-sm font-medium">{pod.transporterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Amount</p>
                    <p className="text-lg font-bold text-green-600">
                      {pod.currency} {pod.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Uploaded</p>
                    <p className="text-sm">
                      {new Date(pod.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-xs text-gray-500 mb-1">POD File:</p>
                  <a
                    href={(() => { try { const p = JSON.parse(pod.podUrl); return p.url || pod.podUrl; } catch { return pod.podUrl; } })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#3ab54a] hover:text-[#2d9e3c] font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    {pod.podFileName}
                  </a>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproveClick(pod._id)}
                    disabled={approving === pod._id}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3ab54a] text-white rounded font-semibold hover:bg-[#2d9e3c] disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {approving === pod._id ? 'Approving...' : 'Approve & Forward to Client'}
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${pod.transporterEmail}`)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Email
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="border-b p-6">
                <h2 className="text-xl font-bold text-[#1a2a5e]">Approve POD</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add optional comments for the transporter and client
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 resize-none"
                    placeholder="e.g., 'Delivery verified. All documents in order.'"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ What happens next:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>POD is marked as approved</li>
                    <li>Client receives notification to review</li>
                    <li>Once client approves, invoices can be created</li>
                  </ul>
                </div>
              </div>

              <div className="border-t p-6 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApproval}
                  disabled={approving !== null}
                  className="flex-1 px-4 py-2 bg-[#3ab54a] text-white rounded-lg font-semibold hover:bg-[#2d9e3c] disabled:opacity-50 transition-colors"
                >
                  {approving ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  )
}
