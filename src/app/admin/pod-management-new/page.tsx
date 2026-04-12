'use client'
// src/app/admin/pod-management/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'
import { CheckCircle, AlertCircle, Clock, FileText, Download } from 'lucide-react'

interface POD {
  _id: string
  loadId: string
  transporterId: string
  clientId: string
  podDocument: {
    filename: string
    url: string
  }
  transporterInvoice: {
    filename: string
    url: string
  }
  deliveryDate: string
  deliveryTime: string
  notes: string
  adminApproval: {
    approved: boolean
    approvedAt?: string
  }
  clientApproval: {
    approved: boolean
    approvedAt?: string
  }
  status: string
  createdAt: string
}

interface ApprovalState {
  podId: string
  comments: string
  submitting: boolean
}

export default function PODManagementPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [pods, setPods] = useState<POD[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [error, setError] = useState('')
  const [approvingId, setApprovingId] = useState<ApprovalState | null>(null)

  // Auth check
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [session, router])

  // Fetch PODs
  useEffect(() => {
    const fetchPODs = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/pod/upload')
        if (!res.ok) throw new Error('Failed to fetch PODs')

        const data = await res.json()
        setPods(data.data || [])
        setError('')
      } catch (err) {
        setError('Failed to load PODs')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchPODs()
    }
  }, [session])

  // Filter PODs
  const filteredPods = pods.filter(pod => {
    if (filter === 'pending') return pod.status === 'PENDING_ADMIN'
    if (filter === 'approved') return pod.adminApproval.approved
    return true
  })

  async function approvePOD(podId: string) {
    if (!approvingId?.podId || !approvingId.comments.trim()) {
      alert('Please add comments before approving')
      return
    }

    try {
      setApprovingId({ ...approvingId, submitting: true })
      const res = await fetch(`/api/pod/${podId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalType: 'admin',
          comments: approvingId.comments
        })
      })

      if (!res.ok) throw new Error('Failed to approve POD')

      const data = await res.json()
      // Update local POD
      setPods(pods.map(p => p._id === podId ? data.data : p))
      setApprovingId(null)
    } catch (err) {
      alert('Failed to approve POD')
      console.error(err)
    } finally {
      setApprovingId(null)
    }
  }

  function getStatusBadge(pod: POD) {
    if (pod.adminApproval.approved) {
      return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">✓ Admin Approved</span>
    }
    if (pod.status === 'PENDING_ADMIN') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">⏳ Pending Admin</span>
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">{pod.status}</span>
  }

  if (loading) {
    return (
      <>
        <Topbar title="POD Management" />
        <PageLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
              <p className="text-gray-600 mt-4">Loading PODs...</p>
            </div>
          </div>
        </PageLayout>
      </>
    )
  }

  return (
    <>
      <Topbar title="POD Management" />
      <PageLayout>
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-2">
            {(['all', 'pending', 'approved'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === f
                    ? 'bg-[#3ab54a] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-900">{error}</p>
            </div>
          )}

          {/* POD List */}
          {filteredPods.length > 0 ? (
            <div className="space-y-4">
              {filteredPods.map(pod => (
                <div key={pod._id} className="bg-white/85 backdrop-blur-3xl rounded-2xl border-2 border-white/60 p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Load ID: {pod.loadId}</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        Transporter ID: {pod.transporterId}
                      </p>
                    </div>
                    {getStatusBadge(pod)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Delivery Date</p>
                      <p className="font-semibold text-gray-900">{new Date(pod.deliveryDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Delivery Time</p>
                      <p className="font-semibold text-gray-900">{pod.deliveryTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Uploaded</p>
                      <p className="font-semibold text-gray-900">{new Date(pod.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Client Approval</p>
                      <p className="font-semibold">
                        {pod.clientApproval.approved ? (
                          <span className="text-green-600">✓ Approved</span>
                        ) : (
                          <span className="text-yellow-600">⏳ Pending</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="mt-4 flex gap-4">
                    <a
                      href={pod.podDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-semibold"
                    >
                      <FileText className="w-4 h-4" />
                      View POD
                    </a>
                    <a
                      href={pod.transporterInvoice.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      View Invoice
                    </a>
                  </div>

                  {/* Notes */}
                  {pod.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Delivery Notes:</p>
                      <p className="text-sm text-gray-800">{pod.notes}</p>
                    </div>
                  )}

                  {/* Approval Section */}
                  {!pod.adminApproval.approved && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Admin Approval Comments
                      </label>
                      <textarea
                        value={approvingId?.podId === pod._id ? approvingId.comments : ''}
                        onChange={(e) => {
                          if (!approvingId || approvingId.podId !== pod._id) {
                            setApprovingId({ podId: pod._id, comments: e.target.value, submitting: false })
                          } else {
                            setApprovingId({ ...approvingId, comments: e.target.value })
                          }
                        }}
                        placeholder="Add verification comments before approving..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20 text-sm mb-3"
                      />
                      <button
                        onClick={() => approvePOD(pod._id)}
                        disabled={approvingId?.podId !== pod._id || !approvingId?.comments.trim() || approvingId.submitting}
                        className="w-full px-4 py-2 bg-[#3ab54a] text-white font-semibold rounded-lg hover:bg-[#2d9e3c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {approvingId?.podId === pod._id && approvingId.submitting ? '✓ Approving...' : '✓ Approve POD'}
                      </button>
                    </div>
                  )}

                  {pod.adminApproval.approved && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-900">Admin Approved</p>
                        <p className="text-sm text-green-800">Waiting for client approval to proceed with invoice creation</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No PODs found for this filter</p>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  )
}
