'use client'
// src/app/admin/documents/page.tsx
import { useEffect, useState } from 'react'
import { Topbar, PageLayout, DocumentsTableSkeleton } from '@/components/ui'
import AdminDocumentViewModal from '@/components/admin/AdminDocumentViewModal'

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewStatus, setReviewStatus] = useState('APPROVED')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [fixingDocs, setFixingDocs] = useState(false)
  const [verifyingUser, setVerifyingUser] = useState<string | null>(null)

  const handleManualVerify = async (userId: string, userEmail: string) => {
    if (!confirm(`Manually trigger verification check for ${userEmail}?`)) {
      return
    }

    try {
      setVerifyingUser(userId)
      const res = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()
      
      if (data.success) {
        alert(`✅ Success!\n\n${data.message}\n\nUser: ${data.user.email}\nRole: ${data.user.role}\nVerified: ${data.user.isVerified}`)
      } else {
        alert(`⚠️ Verification Check Result:\n\n${data.message}\n\nMissing Documents:\n${data.missingDocuments?.join('\n') || 'None'}\n\nApproved Documents:\n${data.approvedDocuments?.join('\n') || 'None'}`)
      }
      
      await fetchDocuments()
    } catch (err: any) {
      console.error('Manual verify error:', err)
      alert(err.message || 'Failed to verify user')
    } finally {
      setVerifyingUser(null)
    }
  }

  const handleFixOldDocuments = async () => {
    if (!confirm('Fix old documents without verification status and verify eligible accounts?')) {
      return
    }

    try {
      setFixingDocs(true)
      const res = await fetch('/api/admin/fix-documents', {
        method: 'POST',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fix documents')
      }

      const data = await res.json()
      alert(`Success!\n\nFixed ${data.fixed} documents\nVerified ${data.verified} accounts`)
      await fetchDocuments()
    } catch (err: any) {
      console.error('Fix documents error:', err)
      alert(err.message || 'Failed to fix documents')
    } finally {
      setFixingDocs(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      console.log('[AdminDocuments] Fetching documents...')
      const res = await fetch('/api/documents')
      
      if (!res.ok) {
        const error = await res.json()
        console.error('[AdminDocuments] API error:', res.status, error)
        setDocuments([])
        return
      }
      
      const data = await res.json()
      console.log('[AdminDocuments] Success! Documents:', data.data)
      setDocuments(data.data || [])
    } catch (err) {
      console.error('[AdminDocuments] Fetch failed:', err)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const userName = doc.user?.name?.toLowerCase() || ''
      const userEmail = doc.user?.email?.toLowerCase() || ''
      const companyName = doc.user?.companyName?.toLowerCase() || ''
      const docName = doc.originalName?.toLowerCase() || ''
      const docType = doc.docType?.toLowerCase() || ''
      const docId = doc._id?.toString().toLowerCase() || ''
      
      const matchesSearch = 
        userName.includes(search) ||
        userEmail.includes(search) ||
        companyName.includes(search) ||
        docName.includes(search) ||
        docType.includes(search) ||
        docId.includes(search)
      
      if (!matchesSearch) return false
    }

    // Type filter
    if (filterType !== 'ALL' && doc.docType !== filterType) {
      return false
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'PENDING' && doc.verificationStatus !== 'PENDING') return false
      if (filterStatus === 'APPROVED' && doc.verificationStatus !== 'APPROVED') return false
      if (filterStatus === 'REJECTED' && doc.verificationStatus !== 'REJECTED') return false
    }

    return true
  })

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleSubmitReview = async (comment: string, status: string) => {
    if (!selectedDoc) {
      alert('No document selected')
      return
    }

    try {
      setSubmittingReview(true)
      const docId = selectedDoc._id?.toString?.() || selectedDoc._id
      
      console.log('Selected Doc:', selectedDoc)
      console.log('Doc ID:', docId)
      
      if (!docId || docId === 'undefined') {
        alert('Invalid document ID. Please try again.')
        setSubmittingReview(false)
        return
      }
      
      const res = await fetch(`/api/documents/${docId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, status }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.details || 'Failed to submit review')
      }

      const result = await res.json()
      
      // BUG FIX #1: Optimistic update - update local state immediately instead of refetching
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc._id === docId 
            ? { ...doc, verificationStatus: status, reviews: result.data?.reviews || doc.reviews }
            : doc
        )
      )
      
      alert('Review submitted successfully!')
      
      // Close modal after successful review
      setSelectedDoc(null)
      setReviewComment('')
      setReviewStatus('APPROVED')
    } catch (err: any) {
      console.error('Review error:', err)
      if (err.message.includes('already')) {
        alert(err.message + '\n\nYou cannot change the approval status once it is set.')
      } else {
        alert(err.message || 'Failed to submit review')
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <>
      <Topbar title="Document Review" />
      <PageLayout>
        <div className="card">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">
                All Documents ({filteredDocuments.length}{documents.length !== filteredDocuments.length ? ` of ${documents.length}` : ''})
              </h3>
              <button
                onClick={fetchDocuments}
                disabled={loading}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Bar */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Company, Name, Email, Type, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                />
              </div>

              {/* Document Type Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Document Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                >
                  <option value="ALL">All Types</option>
                  <option value="COMPANY">Company Registration</option>
                  <option value="BANK_CONFIRMATION">Bank Confirmation</option>
                  <option value="AUTHORIZATION">Letter Authorizing Company to Work with Fleetxchange</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="TAX_CLEARANCE">Tax Clearance</option>
                  <option value="VEHICLE_LIST">Vehicle List</option>
                  <option value="INVOICE">Invoice</option>
                  <option value="POD">POD</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL') && (
              <div className="mt-3 flex items-center justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterType('ALL')
                    setFilterStatus('ALL')
                  }}
                  className="text-sm text-[#3ab54a] hover:text-[#2d9e3c] font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <DocumentsTableSkeleton />
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {documents.length === 0 ? 'No documents found' : 'No documents match your search criteria'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc._id}
                  className="p-4 border border-gray-200 rounded hover:border-[#3ab54a] transition-colors cursor-pointer"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-[#1a2a5e]">📄 {doc.originalName}</p>
                        {doc.verificationStatus === 'APPROVED' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold">✓ Approved</span>
                        )}
                        {doc.verificationStatus === 'REJECTED' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-semibold">✕ Rejected</span>
                        )}
                        {doc.verificationStatus === 'PENDING' && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">⏳ Pending</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-900">
                        Type: <span className="font-semibold text-gray-900">{doc.docType}</span> • 
                        Uploaded by: <span className="font-semibold text-gray-900">{doc.uploadedByRole}</span> • 
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                      {doc.user && (
                        <p className="text-xs text-gray-700 mt-1">
                          <span className="font-semibold">Client:</span> {doc.user.name || 'N/A'}
                          {doc.user.companyName && ` (${doc.user.companyName})`}
                          {doc.user.email && ` • ${doc.user.email}`}
                          {doc.user.role && (
                            <span className="ml-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                doc.user.isVerified 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {doc.user.isVerified ? '✓ Verified' : '⏳ Unverified'}
                              </span>
                            </span>
                          )}
                        </p>
                      )}
                      {doc.reviews && doc.reviews.length > 0 && (
                        <p className="text-xs text-[#3ab54a] mt-1">✓ {doc.reviews.length} review(s)</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200">
                        Review
                      </button>
                      {doc.user && !doc.user.isVerified && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleManualVerify(doc.user._id?.toString() || doc.user.userId, doc.user.email)
                          }}
                          disabled={verifyingUser === (doc.user._id?.toString() || doc.user.userId)}
                          className="px-3 py-1.5 rounded text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                          title="Check if user can be verified"
                        >
                          {verifyingUser === (doc.user._id?.toString() || doc.user.userId) ? '...' : '✓ Verify'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Review Modal */}
        <AdminDocumentViewModal
          document={selectedDoc}
          onClose={() => {
            setSelectedDoc(null)
            setReviewComment('')
            setReviewStatus('APPROVED')
          }}
          onSubmitReview={async (comment, status) => {
            await handleSubmitReview(comment, status)
          }}
          isSubmitting={submittingReview}
        />
      </PageLayout>
    </>
  )
}
