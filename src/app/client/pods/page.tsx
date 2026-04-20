'use client'
// src/app/client/pods/page.tsx

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
  cargoType: string
  transporterName: string
  uploadedAt: string
  adminApprovedAt: string
  clientApprovedAt?: string
  clientRejectedAt?: string
  podFileName: string
  podUrl: string
  clientApprovalStatus: string
  rejectionReason?: string
  loadId: string
  amount: number
  currency: string
}

export default function ClientPodsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [pods, setPods] = useState<POD[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null)
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null)
  const [comments, setComments] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (session && session.user.role !== 'CLIENT') {
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
      const res = await fetch('/api/client/pods/all')
      if (!res.ok) throw new Error('Failed to fetch PODs')

      const data = await res.json()
      setPods(data.data || [])
      setError('')
    } catch (err) {
      console.error('[ClientPODs] Error:', err)
      setError('Failed to load PODs')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClick = (podId: string, action: 'approve' | 'reject' = 'approve') => {
    setSelectedPodId(podId)
    setModalAction(action)
    setComments('')
    setShowModal(true)
  }

  const handleSubmitApproval = async () => {
    if (!selectedPodId || !modalAction) return

    try {
      setApproving(selectedPodId)
      setError('')

      // Use the new client-approval endpoint for FIX 5
      const res = await fetch(`/api/pod/client-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podId: selectedPodId,
          action: modalAction,
          reason: modalAction === 'reject' ? comments : undefined,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Failed to ${modalAction} POD`)
      }

      const successMsg = modalAction === 'approve' 
        ? '✅ POD approved! Admin will create invoices now.'
        : '❌ POD rejected. Transporter has been notified.'
        
      setSuccess(successMsg)
      setShowModal(false)
      setSelectedPodId(null)
      setModalAction(null)

      // Refresh list
      setTimeout(() => {
        fetchPendingPODs()
        setSuccess('')
      }, 2000)
    } catch (err: any) {
      setError(err.message || `Failed to ${modalAction} POD`)
    } finally {
      setApproving(null)
    }
  }

  if (loading) {
    return (
      <>
        <Topbar title="POD Review" />
        <PageLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
          </div>
        </PageLayout>
      </>
    )
  }

  const getPodUrl = (podUrl: string) => {
    try { const p = JSON.parse(podUrl); return p.url || podUrl; } catch { return podUrl; }
  }

  return (
    <>
      <Topbar title="POD Review & Approval" />
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
          <h2 className="text-2xl font-bold text-[#1a2a5e] mb-2">POD Management</h2>
          <p className="text-gray-600">
            View and manage all PODs for your loads
          </p>
        </div>

        {pods.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No PODs found</p>
            <p className="text-sm text-gray-500">PODs will appear here once transporters upload delivery proof</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pods.map((pod) => (
              <div
                key={pod._id}
                className={`bg-white rounded-lg shadow p-6 border-l-4 hover:shadow-lg transition-shadow ${
                  pod.clientApprovalStatus === 'APPROVED' ? 'border-l-green-500' :
                  pod.clientApprovalStatus === 'REJECTED' ? 'border-l-red-500' :
                  'border-l-blue-500'
                }`}
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
                    <p className="text-xs text-gray-500 uppercase">Carrier</p>
                    <p className="text-sm font-medium">{pod.transporterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Amount</p>
                    <p className="text-lg font-bold text-green-600">
                      {pod.currency} {pod.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      pod.clientApprovalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      pod.clientApprovalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pod.clientApprovalStatus === 'APPROVED' ? '✓ Approved' :
                       pod.clientApprovalStatus === 'REJECTED' ? '✗ Rejected' :
                       '⏳ Pending'}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-1">Admin Approved:</p>
                    <p className="text-sm font-semibold text-blue-800">
                      {new Date(pod.adminApprovedAt).toLocaleDateString()} at{' '}
                      {new Date(pod.adminApprovedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {pod.clientApprovalStatus === 'APPROVED' && pod.clientApprovedAt && (
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">Client Approved:</p>
                      <p className="text-sm font-semibold text-green-800">
                        {new Date(pod.clientApprovedAt).toLocaleDateString()} at{' '}
                        {new Date(pod.clientApprovedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                  {pod.clientApprovalStatus === 'REJECTED' && pod.clientRejectedAt && (
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">Client Rejected:</p>
                      <p className="text-sm font-semibold text-red-800">
                        {new Date(pod.clientRejectedAt).toLocaleDateString()} at{' '}
                        {new Date(pod.clientRejectedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                  {pod.clientApprovalStatus === 'PENDING_CLIENT' && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">POD Uploaded:</p>
                      <p className="text-sm">
                        {new Date(pod.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {pod.clientApprovalStatus === 'REJECTED' && pod.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
                    <p className="text-xs text-red-600 font-semibold mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-800">{pod.rejectionReason}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-xs text-gray-500 mb-1">POD Document:</p>
                  <button
                    onClick={() => window.open(getPodUrl(pod.podUrl), '_blank')}
                    className="flex items-center gap-2 text-[#3ab54a] hover:text-[#2d9e3c] font-semibold cursor-pointer bg-transparent border-none p-0"
                  >
                    <Download className="w-4 h-4" />
                    {pod.podFileName}
                  </button>
                </div>

                <div className="flex gap-3">
                  {pod.clientApprovalStatus === 'PENDING_CLIENT' && (
                    <>
                      <button
                        onClick={() => handleApproveClick(pod._id, 'approve')}
                        disabled={approving === pod._id}
                        className="flex items-center gap-2 px-4 py-2 bg-[#3ab54a] text-white rounded font-semibold hover:bg-[#2d9e3c] disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {approving === pod._id ? 'Processing...' : 'Approve POD'}
                      </button>
                      <button
                        onClick={() => handleApproveClick(pod._id, 'reject')}
                        disabled={approving === pod._id}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject POD
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => window.open(getPodUrl(pod.podUrl), '_blank')}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                  >
                    <Download className="w-4 h-4" />
                    View Document
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
              <div className={`border-b p-6 ${modalAction === 'reject' ? 'bg-red-50' : 'bg-green-50'}`}>
                <h2 className="text-xl font-bold text-[#1a2a5e]">
                  {modalAction === 'approve' ? 'Approve POD' : 'Reject POD'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {modalAction === 'approve' 
                    ? 'Please confirm the POD details are correct'
                    : 'Please provide a reason for rejection'}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {modalAction === 'approve' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                    <p className="font-semibold mb-1">⚠️ Important:</p>
                    <p>By approving this POD, you confirm that:</p>
                    <ul className="text-xs space-y-1 list-disc list-inside mt-1">
                      <li>Goods have been delivered correctly</li>
                      <li>All delivery documents are in order</li>
                      <li>No damage or discrepancies</li>
                    </ul>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                    <p className="font-semibold mb-1">⚠️ Rejection Notice:</p>
                    <p>The transporter will be notified and may request clarification or resubmit the POD.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {modalAction === 'approve' ? 'Comments (Optional)' : 'Reason for Rejection (Required)'}
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 resize-none"
                    placeholder={
                      modalAction === 'approve'
                        ? 'e.g., "Confirmed delivery in good condition"'
                        : 'e.g., "Discrepancy in weight documentation"'
                    }
                  />
                </div>

                {modalAction === 'approve' && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                    <p className="font-semibold mb-1">✅ Next Steps:</p>
                    <p>After approval, admin will create invoices for payment</p>
                  </div>
                )}
              </div>

              <div className="border-t p-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setModalAction(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApproval}
                  disabled={approving !== null || (modalAction === 'reject' && !comments.trim())}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors ${
                    modalAction === 'approve'
                      ? 'bg-[#3ab54a] hover:bg-[#2d9e3c]'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approving ? 'Processing...' : modalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  )
}
