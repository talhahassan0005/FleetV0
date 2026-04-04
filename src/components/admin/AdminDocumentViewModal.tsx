'use client'
// src/components/admin/AdminDocumentViewModal.tsx
import { useState } from 'react'

interface DocumentReview {
  reviewerRole: string
  status: string
  comment: string
  timestamp: string
}

interface Document {
  _id: string
  originalName: string
  docType: string
  uploadedByRole: string
  createdAt: string
  reviews?: DocumentReview[]
}

interface AdminDocumentViewModalProps {
  document: Document | null
  onClose: () => void
  onSubmitReview: (comment: string, status: string) => Promise<void>
  isSubmitting?: boolean
}

export default function AdminDocumentViewModal({
  document,
  onClose,
  onSubmitReview,
  isSubmitting = false,
}: AdminDocumentViewModalProps) {
  const [reviewComment, setReviewComment] = useState('')
  const [reviewStatus, setReviewStatus] = useState('APPROVED')

  if (!document) return null

  const handleSubmit = async () => {
    if (!reviewComment.trim()) {
      alert('Please enter a comment')
      return
    }
    await onSubmitReview(reviewComment, reviewStatus)
  }

  const handleClose = () => {
    setReviewComment('')
    setReviewStatus('APPROVED')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">
            {document.originalName}
          </h3>
          <button
            onClick={handleClose}
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
              <p>
                <span className="font-semibold">Type:</span> {document.docType}
              </p>
              <p>
                <span className="font-semibold">Uploaded by:</span> {document.uploadedByRole}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{' '}
                {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>
            <a
              href={`/api/documents/${document._id}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 px-3 py-1.5 rounded text-xs font-semibold bg-[#3ab54a] text-white hover:bg-green-600"
            >
              📥 View Document
            </a>
          </div>

          {/* Existing Reviews */}
          {document.reviews && document.reviews.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">
                REVIEWS ({document.reviews.length})
              </p>
              <div className="space-y-3">
                {document.reviews.map((review, idx) => (
                  <div key={idx} className="p-3 border border-gray-200 rounded text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#1a2a5e]">
                        {review.reviewerRole}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          review.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : review.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Review */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">
              Add Your Review
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Status *
                </label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Comment *
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Enter your feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-20 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded text-sm font-semibold bg-[#3ab54a] text-white hover:bg-green-600 disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={handleClose}
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
  )
}
