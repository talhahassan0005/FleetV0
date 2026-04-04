'use client'
// src/components/admin/AdminVerificationReviewModal.tsx
import { useState } from 'react'

interface Document {
  id: string
  docType: string
  originalName: string
  fileUrl: string
  verificationStatus: string
  verificationComment: string
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
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectReason, setShowRejectReason] = useState(false)

  if (!user) return null

  const handleApprove = async () => {
    await onApprove(user.id)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter rejection reason')
      return
    }
    await onReject(user.id, rejectionReason)
  }

  const handleClose = () => {
    setRejectionReason('')
    setShowRejectReason(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">
            Verify Registration
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
                <p className="font-semibold text-[#1a2a5e]">{user.companyName}</p>
              </div>
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-semibold text-[#1a2a5e]">{user.role}</p>
              </div>
              <div>
                <p className="text-gray-600">Contact</p>
                <p className="font-semibold text-[#1a2a5e]">{user.contactName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-[#1a2a5e]">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">
              Submitted Documents
            </p>
            <div className="space-y-2">
              {user.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 border border-gray-200 rounded flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#1a2a5e]">{doc.docType}</p>
                    <p className="text-xs text-gray-600">{doc.originalName}</p>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Decision */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">
              Verification Decision
            </p>

            {showRejectReason && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why documents are rejected..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-20 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={isVerifying}
                className="flex-1 px-4 py-2 rounded text-sm font-semibold bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-60"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => {
                  if (!showRejectReason) {
                    setShowRejectReason(true)
                  } else {
                    handleReject()
                  }
                }}
                disabled={isVerifying}
                className="flex-1 px-4 py-2 rounded text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60"
              >
                {showRejectReason ? '✗ Confirm Reject' : '✗ Reject'}
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
  )
}
