'use client'
// src/app/client/documents/page.tsx
import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout, DocumentsTableSkeleton, DashboardCardsSkeleton } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeletons'

export default function ClientDocumentsPage() {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState('COMPANY')
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewStatus, setReviewStatus] = useState('APPROVED')
  const [submittingReview, setSubmittingReview] = useState(false)

  const docTypes = [
    { value: 'COMPANY', label: 'Company Registration' },
    { value: 'AUTHORIZATION', label: 'Letter Authorizing Company to Work with Fleetxchange' },
    { value: 'TAX_CLEARANCE', label: 'Tax Clearance' },
    { value: 'OTHER', label: 'Other' },
  ]

  const fetchDocuments = async () => {
    try {
      console.log('[ClientDocuments] Fetching documents...')
      setLoading(true)
      const res = await fetch('/api/documents')
      
      if (!res.ok) {
        console.error('[ClientDocuments] API error:', res.status)
        if (res.status === 401) {
          console.log('[ClientDocuments] Unauthorized - session may have expired')
        }
        setDocuments([])
        return
      }
      
      const data = await res.json()
      console.log('[ClientDocuments] Received documents:', data.data?.length || 0)
      setDocuments(data.data || [])
    } catch (err) {
      console.error('[ClientDocuments] Failed to fetch documents:', err)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('[ClientDocuments] Component mounted, fetching documents...')
    fetchDocuments()
  }, [])

  const handleUpload = async (file: File) => {
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('docType', selectedType)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      await fetchDocuments()
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Upload error:', err)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!selectedDoc || !reviewComment.trim()) {
      alert('Please enter a comment')
      return
    }

    try {
      setSubmittingReview(true)
      const docId = selectedDoc._id?.toString?.() || selectedDoc._id
      
      // Debug logging
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
        body: JSON.stringify({ comment: reviewComment, status: reviewStatus }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      await fetchDocuments()
      const updated = documents.find(d => d._id === selectedDoc._id || d._id?.toString?.() === selectedDoc._id?.toString?.())
      if (updated) setSelectedDoc(updated)
      setReviewComment('')
      setReviewStatus('APPROVED')
      alert('Review submitted successfully!')
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

  // Separate own documents from transporter documents
  const ownDocuments = documents.filter(d => d.uploadedByRole === 'CLIENT')
  const transporterDocuments = documents.filter(d => d.uploadedByRole === 'TRANSPORTER')

  return (
    <>
      <Topbar title="Documents" />
      
      {/* Verification Status Banner */}
      {session?.user && !session.user.isVerified && (
        <div className="bg-amber-50 border-b-2 border-amber-300 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-4">
              <div className="mt-0.5">⚠️</div>
              <div className="flex-1">
                {session.user.verificationStatus === 'REJECTED' ? (
                  <div>
                    <p className="font-semibold text-amber-900">Account Verification Required</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Your account verification was <span className="font-semibold">rejected</span>.
                    </p>
                    {session.user.verificationComment && (
                      <p className="text-sm text-amber-700 mt-1 italic">
                        Reason: {session.user.verificationComment}
                      </p>
                    )}
                    <p className="text-sm text-amber-800 mt-2">
                      Please upload updated documents below to resubmit for verification.
                    </p>
                  </div>
                ) : session.user.verificationStatus === 'PENDING' ? (
                  <div>
                    <p className="font-semibold text-amber-900">Verification Pending</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Your documents are under review. You'll be notified once verification is complete.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-amber-900">Complete Account Verification</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Upload verification documents in the section below to activate your account and post loads.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <PageLayout>
        {/* Upload Section */}
        <div className="card mb-6 border-2 border-[#3ab54a]">
          <div className="bg-green-50 px-6 py-3 border-b border-green-100">
            <div className="flex items-center justify-between">
              <h3 className="font-condensed font-bold text-sm text-[#1a2a5e] uppercase tracking-wide">
                {!session?.user?.isVerified ? '📋 Upload Verification Documents' : '📋 Upload Document'}
              </h3>
              {!session?.user?.isVerified && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-semibold">Required for Verification</span>
              )}
            </div>
          </div>
          <div className="p-6">
            {!session?.user?.isVerified && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                <p className="font-semibold mb-1">Required Verification Documents (All 3 Required):</p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Company Registration</li>
                  <li>• Letter Authorizing Company to Work with Fleetxchange</li>
                  <li>• Tax Clearance</li>
                </ul>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-700 mb-2">Document Type *</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-[#3ab54a]"
                >
                  {docTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-700 mb-2">Select File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file)
                  }}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
            {uploading && <p className="text-xs text-[#3ab54a] mt-2">Uploading...</p>}
          </div>
        </div>

        {/* My Documents */}
        <div className="card mb-6">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">My Documents</h3>
          </div>
          {loading ? (
            <DocumentsTableSkeleton />
          ) : ownDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No documents uploaded yet</div>
          ) : (
            <div className="space-y-3">
              {ownDocuments.map((doc) => {
                // Check if document has admin approval - use verificationStatus field
                const verificationStatus = doc.verificationStatus || 'PENDING'
                const statusBadge = verificationStatus === 'APPROVED'
                  ? { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '✓', label: 'Approved' }
                  : verificationStatus === 'REJECTED'
                  ? { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '✗', label: 'Rejected' }
                  : { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '⏳', label: 'Under Review' }
                
                // Get admin review comment if exists
                const adminReview = doc.reviews?.find((r: any) => r.reviewerRole === 'ADMIN')
                
                return (
                  <div key={doc._id} className="p-4 border border-gray-200 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1a2a5e] mb-1">📄 {doc.originalName}</p>
                        <p className="text-xs text-gray-500">Type: {doc.docType} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                        {adminReview && adminReview.comment && (
                          <p className="text-xs text-gray-600 mt-2 italic">Admin: {adminReview.comment}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/documents/${doc._id}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#1a2a5e] text-white rounded-lg hover:bg-[#152247] transition-colors text-sm font-semibold"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          View Document
                        </a>
                        <span className={`inline-block px-3 py-1.5 rounded text-xs font-semibold ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}>
                          {statusBadge.icon} {statusBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Transporter Documents - Reviewable */}
        <div className="card">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">Transporter Documents ({transporterDocuments.length})</h3>
          </div>

          {loading ? (
            <DocumentsTableSkeleton />
          ) : transporterDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No transporter documents yet</div>
          ) : (
            <div className="space-y-3">
              {transporterDocuments.map((doc) => (
                <div
                  key={doc._id}
                  className="p-4 border border-gray-200 rounded hover:border-[#3ab54a] transition-colors cursor-pointer"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1a2a5e] mb-1">📄 {doc.originalName}</p>
                      <p className="text-xs text-gray-500">Type: {doc.docType} • Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>
                      {doc.reviews && doc.reviews.length > 0 && (
                        <p className="text-xs text-[#3ab54a] mt-1">✓ {doc.reviews.length} review(s)</p>
                      )}
                    </div>
                    <button className="px-3 py-1.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Review Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">{selectedDoc.originalName}</h3>
                <button
                  onClick={() => {
                    setSelectedDoc(null)
                    setReviewComment('')
                    setReviewStatus('APPROVED')
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Document Info */}
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-500 mb-2">DOCUMENT DETAILS</p>
                  <div className="text-sm space-y-1">
                    <p><span className="font-semibold">Type:</span> {selectedDoc.docType}</p>
                    <p><span className="font-semibold">Uploaded by:</span> Transporter</p>
                    <p><span className="font-semibold">Date:</span> {new Date(selectedDoc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <a
                    href={`/api/documents/${selectedDoc._id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2a5e] text-white rounded-lg hover:bg-[#152247] transition-colors text-sm font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    View Document
                  </a>
                </div>

                {/* Existing Reviews */}
                {selectedDoc.reviews && selectedDoc.reviews.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">REVIEWS ({selectedDoc.reviews.length})</p>
                    <div className="space-y-3">
                      {selectedDoc.reviews.map((review: any, idx: number) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-[#1a2a5e]">{review.reviewerRole}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              review.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              review.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {review.status}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                          <p className="text-xs text-gray-400 mt-2">{new Date(review.timestamp).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Review */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">Add Your Review</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Status *</label>
                      <select
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900"
                      >
                        <option value="APPROVED">✓ Approved</option>
                        <option value="REJECTED">✗ Rejected</option>
                        <option value="PENDING">⏳ Need More Info</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Comment *</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Enter your feedback..."
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-20 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="flex-1 px-4 py-2 rounded text-sm font-semibold bg-[#3ab54a] text-white hover:bg-green-600 disabled:opacity-60"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoc(null)
                          setReviewComment('')
                          setReviewStatus('APPROVED')
                        }}
                        className="px-4 py-2 rounded text-sm font-semibold border border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  )
}
