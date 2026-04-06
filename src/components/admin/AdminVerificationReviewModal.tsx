'use client'
// src/components/admin/AdminVerificationReviewModal.tsx
import { useState, useEffect } from 'react'

interface Document {
  id: string
  docType: string
  originalName: string
  fileUrl: string
}

interface User {
  id: string
  email: string
  companyName: string
  contactName: string
  phone: string
  role: string
  createdAt: string
  documents: Document[]
}

interface AdminVerificationReviewModalProps {
  user: User | null
  onClose: () => void
  onApprove: (userId: string) => Promise<void>
  onReject: (userId: string, reason: string) => Promise<void>
  isVerifying?: boolean
}

export default function AdminVerificationReviewModal({
  user,
  onClose,
  onApprove,
  onReject,
  isVerifying = false,
}: AdminVerificationReviewModalProps) {
  const [reviewStatus, setReviewStatus] = useState('APPROVED')
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debug: Log documents when modal opens
  useEffect(() => {
    if (user?.documents) {
      console.log('[Modal] User documents:', {
        count: user.documents.length,
        docs: user.documents.map(d => ({
          name: d.originalName,
          type: d.docType,
          urlLength: d.fileUrl?.length || 0,
          urlPrefix: d.fileUrl?.substring(0, 100) || 'NO URL'
        }))
      })
    }
  }, [user])

  if (!user) return null

  const handleSubmit = async () => {
    if (!reviewComment.trim()) {
      alert('Please enter a comment')
      return
    }

    setIsSubmitting(true)
    try {
      if (reviewStatus === 'APPROVED') {
        await onApprove(user.id)
      } else {
        await onReject(user.id, reviewComment)
      }
      handleClose()
    } finally {
      setIsSubmitting(false)
    }
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
            {user.companyName}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">User Information</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Company</p>
                <p className="font-semibold text-gray-900">{user.companyName}</p>
              </div>
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-semibold text-gray-900">{user.role}</p>
              </div>
              <div>
                <p className="text-gray-600">Contact</p>
                <p className="font-semibold text-gray-900">{user.contactName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          {user.documents && user.documents.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">
                Submitted Documents
              </p>
              <div className="space-y-3">
                {user.documents.map((doc) => (
                  <div key={doc.id} className="bg-gray-50 p-4 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">Document Details</p>
                    <div className="text-sm space-y-2 mb-4">
                      <p className="text-gray-900">
                        <span className="font-semibold">Type:</span> {doc.docType}
                      </p>
                      <p className="text-gray-900">
                        <span className="font-semibold">File Name:</span> {doc.originalName}
                      </p>
                    </div>
                    <div className="pt-3">
                      <button
                        onClick={() => {
                          if (!doc.id) {
                            alert('Document ID is not available')
                            return
                          }
                          // Use proper view endpoint instead of data URI
                          const viewUrl = `/api/documents/${doc.id}/view`
                          console.log('[ViewDocument] Opening via endpoint:', viewUrl)
                          window.open(viewUrl, '_blank')
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold bg-[#3ab54a] text-white hover:bg-green-600 transition-colors"
                      >
                        📥 View Document
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(!user.documents || user.documents.length === 0) && (
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-sm text-gray-600">No documents submitted</p>
            </div>
          )}

          {/* Review Section */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">Add Review</p>
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
                  onClick={handleSubmit}
                  disabled={isSubmitting || isVerifying}
                  className="flex-1 px-4 py-2 rounded text-sm font-semibold bg-[#3ab54a] text-white hover:bg-green-600 disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded text-sm text-gray-600 font-semibold border border-gray-300 hover:bg-gray-50"
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
