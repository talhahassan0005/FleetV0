'use client'
// src/components/transporter/PODViewModal.tsx
import { FileText, Eye } from 'lucide-react'

interface PODViewProps {
  _id: string
  originalName: string
  loadRef: string
  route: string
  createdAt: string
  adminApprovalStatus: string
  clientApprovalStatus: string
  adminApprovedAt?: string | null
  clientApprovedAt?: string | null
}

interface PODViewModalProps {
  pod: PODViewProps | null
  onClose: () => void
}

export default function PODViewModal({
  pod,
  onClose,
}: PODViewModalProps) {
  if (!pod) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">
            POD: {pod.loadRef}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* POD Details */}
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">Document Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-600">Load Reference</p>
                <p className="text-gray-900 font-semibold">{pod.loadRef}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Route</p>
                <p className="text-gray-900 font-semibold">{pod.route}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Document Name</p>
                <p className="text-gray-900 font-semibold truncate max-w-xs" title={pod.originalName}>
                  {pod.originalName}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Uploaded</p>
                <p className="text-gray-900 font-semibold">
                  {new Date(pod.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Approval Status */}
          <div className="space-y-3">
            <p className="text-xs text-gray-500 uppercase font-semibold">Approval Status</p>
            
            {/* Admin Approval */}
            <div className="border border-gray-200 rounded p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">Admin Approval</p>
                {pod.adminApprovalStatus === 'APPROVED' ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    ✓ Approved
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    ⏳ Pending
                  </span>
                )}
              </div>
              {pod.adminApprovedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Approved on {new Date(pod.adminApprovedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Client Approval */}
            <div className="border border-gray-200 rounded p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">Client Approval</p>
                {pod.clientApprovalStatus === 'APPROVED' ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    ✓ Approved
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    ⏳ Awaiting
                  </span>
                )}
              </div>
              {pod.clientApprovedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Approved on {new Date(pod.clientApprovedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* View Document Button */}
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <p className="text-xs text-blue-700 mb-3 uppercase font-semibold">Document File</p>
            <a
              href={`/api/pod/${pod._id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold bg-[#3ab54a] text-white hover:bg-green-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
              📥 View or Download Document
            </a>
            <p className="text-xs text-blue-600 mt-2">Opens in a new tab</p>
          </div>

          {/* Close Button */}
          <div className="border-t border-gray-100 pt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
