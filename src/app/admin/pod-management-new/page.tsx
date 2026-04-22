'use client'
// src/app/admin/pod-management-new/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'
import { isAdmin, hasPermission } from '@/lib/rbac'
import { CheckCircle, AlertCircle, Clock, FileText, MessageSquare } from 'lucide-react'

interface POD {
  _id: string
  loadId: string
  userId?: string
  originalName: string
  fileUrl: string
  docType: string
  createdAt: string
  adminApprovalStatus?: 'PENDING_ADMIN' | 'APPROVED'
  adminApprovedAt?: string | null
  adminComments?: string
  clientApprovalStatus?: 'PENDING_CLIENT' | 'APPROVED' | 'REJECTED'
  clientApprovedAt?: string | null
  // Enriched fields (optional)
  loadRef?: string
  origin?: string
  destination?: string
  route?: string
  loadStatus?: string
  finalPrice?: number
  currency?: string
  tonnes?: number
  transporterId?: string
  transporterName?: string
  transporterEmail?: string
  transporterPhone?: string
  clientName?: string
  clientEmail?: string
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
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null)
  const [comments, setComments] = useState('')

  // Auth check
  useEffect(() => {
    if (session === null) {
      router.push('/login')
      return
    }
    
    if (session && !isAdmin(session.user.role)) {
      router.push('/login')
      return
    }

    // Check RBAC permissions
    if (session && !hasPermission(session.user.role, 'pods')) {
      router.push('/admin/unauthorized')
      return
    }
  }, [session, router])

  // Fetch PODs
  useEffect(() => {
    let isMounted = true
    
    const fetchPODs = async () => {
      try {
        setLoading(true)
        setError('')
        console.log('[AdminPODs] Starting fetch with session:', session?.user?.role)
        
        // Wait for session to be loaded
        if (session === undefined) {
          console.log('[AdminPODs] Session still loading...')
          return
        }
        
        // Quick auth check
        if (!session?.user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
          console.log('[AdminPODs] Not admin, redirecting...')
          if (isMounted) {
            setError('Admin access required')
            setLoading(false)
          }
          return
        }

        console.log('[AdminPODs] Fetching PODs from /api/pod/upload')
        
        const res = await fetch('/api/pod/upload')
        
        if (!isMounted) return
        
        console.log('[AdminPODs] Response status:', res.status)
        
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`)
        }

        const data = await res.json()
        
        if (!isMounted) return
        
        console.log('[AdminPODs] Got PODs:', data.data?.length || 0)
        
        // For now, just set PODs without enrichment to debug
        const podsWithDefaults = (data.data || []).map((pod: any) => ({
          ...pod,
          loadRef: 'Load',
          origin: 'Origin',
          destination: 'Destination',
          route: 'Route',
          loadStatus: 'Status',
          finalPrice: 0,
          currency: 'ZAR',
          tonnes: 0,
          clientName: 'Client',
        }))
        
        if (isMounted) {
          setPods(podsWithDefaults)
          setError('')
        }
      } catch (err: any) {
        console.error('[AdminPODs] Error:', err)
        if (isMounted) {
          if (err.name === 'AbortError') {
            setError('Request cancelled')
          } else {
            setError(`Failed: ${err.message}`)
          }
          setPods([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (session?.user?.id) {
      fetchPODs()
    }
    
    return () => {
      isMounted = false
    }
  }, [session])

  // Filter PODs - fixed to use correct field names
  const filteredPods = pods.filter(pod => {
    const status = pod.adminApprovalStatus || 'PENDING_ADMIN'
    if (filter === 'pending') return status === 'PENDING_ADMIN'
    if (filter === 'approved') return status === 'APPROVED'
    return true
  })

  async function approvePOD(podId: string) {
    if (!comments.trim()) {
      alert('Please add comments before approving')
      return
    }

    try {
      setApprovingId({ podId, comments, submitting: true })
      const res = await fetch(`/api/admin/pods/${podId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: comments
        })
      })

      if (!res.ok) throw new Error('Failed to approve POD')

      // Refresh PODs - use same fetch logic as initial load
      const refreshRes = await fetch('/api/pod/upload')
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        
        // Filter out invalid fileUrls
        const validPods = (data.data || []).filter((pod: any) => {
          if (!pod.fileUrl) return true
          if (typeof pod.fileUrl !== 'string') return false
          if (pod.fileUrl.includes('LOCAL:pods/') || pod.fileUrl.includes('/documents/LOCAL')) {
            return false
          }
          return true
        })
        
        // Re-enrich with load details
        const enrichedPods = await Promise.all(
          validPods.map(async (pod: any) => {
            try {
              const loadRes = await fetch(`/api/loads/${pod.loadId}`)
              let loadData: any = null
              if (loadRes.ok) {
                const loadJson = await loadRes.json()
                loadData = loadJson.data || loadJson
              }
              return {
                ...pod,
                loadRef: loadData?.ref || 'Unknown',
                origin: loadData?.origin || 'Unknown',
                destination: loadData?.destination || 'Unknown',
                route: loadData ? `${loadData.origin} → ${loadData.destination}` : 'Unknown Route',
                loadStatus: loadData?.status || 'Unknown',
                finalPrice: loadData?.finalPrice || 0,
                currency: loadData?.currency || 'ZAR',
                tonnes: loadData?.tonnes || 0,
                clientName: loadData?.clientName || 'Unknown',
              }
            } catch (err) {
              return {
                ...pod,
                loadRef: 'Error',
                route: 'Unable to load details',
                finalPrice: 0,
                currency: 'ZAR',
              }
            }
          })
        )
        
        setPods(enrichedPods)
      }
      
      setComments('')
      setSelectedPodId(null)
      alert('✅ POD approved and forwarded to client!')
    } catch (err: any) {
      alert(`Failed to approve POD: ${err.message}`)
      console.error(err)
    } finally {
      setApprovingId(null)
    }
  }

  function getStatusBadge(pod: POD) {
    const status = pod.adminApprovalStatus || 'PENDING_ADMIN'
    
    if (status === 'APPROVED') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Admin Approved</span>
    }
    if (status === 'PENDING_ADMIN') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1"><Clock className="w-4 h-4" /> Pending Admin</span>
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">{status}</span>
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
                <div key={pod._id} className="bg-white rounded-lg border border-gray-200 p-6 shadow hover:shadow-lg transition-shadow">
                  {/* Header with Load Ref and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Load Reference</p>
                      <p className="text-2xl font-bold text-gray-900">{pod.loadRef || 'Loading...'}</p>
                      <p className="text-sm text-gray-600 mt-1">{pod.route || 'Unknown Route'}</p>
                    </div>
                    {getStatusBadge(pod)}
                  </div>

                  {/* Load and Transporter Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 mb-4 border-y border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Transporter</p>
                      <p className="font-semibold text-gray-900">{pod.transporterName || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">{pod.transporterEmail || ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                      <p className="text-lg font-bold text-green-600">{pod.currency || 'ZAR'} {(pod.finalPrice || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Tonnes</p>
                      <p className="font-semibold text-gray-900">{pod.tonnes || 0} T</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Uploaded</p>
                      <p className="font-semibold text-gray-900">{new Date(pod.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Document Section */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">POD Document</p>
                          <p className="font-semibold text-gray-900">{pod.originalName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Handle both string URL and JSON object
                          let url = pod.fileUrl
                          if (typeof url === 'string') {
                            try {
                              const parsed = JSON.parse(url)
                              url = parsed.url || url
                            } catch {
                              // Already a string URL, use as is
                            }
                          } else if (typeof url === 'object' && url?.url) {
                            url = url.url
                          }
                          if (url) window.open(url, '_blank')
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a2a5e] text-white rounded-lg hover:bg-[#152247] transition-colors text-sm font-semibold"
                      >
                        <FileText className="w-4 h-4" />
                        View Document
                      </button>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 font-semibold">Client to Review</p>
                    <p className="text-sm text-blue-900">{pod.clientName || 'Unknown Client'}</p>
                  </div>

                  {/* Admin Comments (if already approved) */}
                  {pod.adminApprovedAt && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                      <p className="text-xs text-green-700 font-semibold mb-1">Admin Approval:</p>
                      <p className="text-sm text-green-800">{pod.adminComments || '(No additional comments)'}</p>
                      <p className="text-xs text-green-600 mt-1">Approved on {new Date(pod.adminApprovedAt).toLocaleDateString()}</p>
                    </div>
                  )}

                  {/* Approval Section */}
                  {(pod.adminApprovalStatus !== 'APPROVED') && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Admin Verification Comments
                      </label>
                      <p className="text-xs text-gray-600 mb-2">Review POD details and add verification notes before forwarding to client</p>
                      <textarea
                        value={selectedPodId === pod._id ? comments : ''}
                        onChange={(e) => {
                          setSelectedPodId(pod._id)
                          setComments(e.target.value)
                        }}
                        placeholder="e.g., Verified load details, documents in order, ready for client review..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20 text-sm mb-3 resize-none"
                      />
                      <button
                        onClick={() => {
                          setSelectedPodId(pod._id)
                          approvePOD(pod._id)
                        }}
                        disabled={approvingId?.submitting || !comments.trim()}
                        className="w-full px-4 py-3 bg-[#3ab54a] text-white font-semibold rounded-lg hover:bg-[#2d9e3c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {approvingId?.submitting ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" />
                            Approving & Forwarding...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Approve & Forward to Client
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {pod.adminApprovalStatus === 'APPROVED' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-green-900">✓ Admin Approved & Forwarded</p>
                        <p className="text-sm text-green-800 mt-1">
                          Client Approval Status: <span className={`font-semibold ${
                            pod.clientApprovalStatus === 'APPROVED' ? 'text-green-600' :
                            pod.clientApprovalStatus === 'REJECTED' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {pod.clientApprovalStatus === 'APPROVED' ? '✓ Client Approved' :
                             pod.clientApprovalStatus === 'REJECTED' ? '✕ Client Rejected' :
                             '⏳ Awaiting Client'}
                          </span>
                        </p>
                        {pod.clientApprovedAt && (
                          <p className="text-xs text-green-700 mt-1">Client approved on {new Date(pod.clientApprovedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No PODs found</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'pending' && 'All PODs have been reviewed'}
                {filter === 'approved' && 'No approved PODs yet'}
                {filter === 'all' && 'No PODs uploaded yet'}
              </p>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  )
}
