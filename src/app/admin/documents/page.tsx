'use client'
// src/app/admin/documents/page.tsx
import { useEffect, useState, useCallback } from 'react'
import { Topbar, PageLayout, DocumentsTableSkeleton } from '@/components/ui'
import AdminDocumentViewModal from '@/components/admin/AdminDocumentViewModal'

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewStatus, setReviewStatus] = useState('APPROVED')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchDocuments = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetching || loading) {
      console.log('[AdminDocuments] Fetch already in progress, skipping...')
      return
    }

    try {
      setIsFetching(true)
      setLoading(true)
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(data.data || [])
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [isFetching, loading])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

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

  return (
    <>
      <Topbar title="Document Review" />
      <PageLayout>
        <div className="card">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">All Documents ({documents.length})</h3>
          </div>

          {loading ? (
            <DocumentsTableSkeleton />
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No documents found</div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="p-4 border border-gray-200 rounded hover:border-[#3ab54a] transition-colors cursor-pointer"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1a2a5e] mb-1">📄 {doc.originalName}</p>
                      <p className="text-xs text-gray-500">
                        Type: {doc.docType} • Uploaded by: {doc.uploadedByRole} • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
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
