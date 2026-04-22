// src/app/admin/pending-verifications/page.tsx
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Document {
  _id: string
  userId: string
  docType: string
  originalName: string
  fileUrl: string
  verificationStatus: string
  createdAt: string
  user?: {
    email: string
    companyName: string
    role: string
  }
}

export default function PendingVerificationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.role || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      router.push('/login')
      return
    }

    fetchPendingDocuments()
  }, [session, router])

  async function fetchPendingDocuments() {
    try {
      const res = await fetch('/api/admin/pending-documents')
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents || [])
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(documentId: string, userId: string) {
    setApproving(documentId)
    try {
      const res = await fetch(`/api/admin/approve-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, userId }),
      })

      if (res.ok) {
        // Refresh documents list
        fetchPendingDocuments()
        setApproving(null)
      } else {
        alert('Failed to approve document')
      }
    } catch (err) {
      console.error('Error approving document:', err)
      alert('Error approving document')
    }
  }

  async function handleReject(documentId: string) {
    setApproving(documentId)
    const reason = prompt('Enter rejection reason:')
    if (!reason) {
      setApproving(null)
      return
    }

    try {
      const res = await fetch(`/api/admin/reject-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, reason }),
      })

      if (res.ok) {
        fetchPendingDocuments()
        setApproving(null)
      } else {
        alert('Failed to reject document')
      }
    } catch (err) {
      console.error('Error rejecting document:', err)
      alert('Error rejecting document')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d1535] to-[#1a2a5e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ab54a]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1535] to-[#1a2a5e] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📋 Pending Verifications
          </h1>
          <p className="text-gray-300">
            Review and approve/reject user verification documents
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-2xl text-gray-500 mb-4">✅ No Pending Verifications</p>
            <p className="text-gray-600">All users have been verified or their documents are being processed.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Document Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{doc.user?.companyName || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{doc.user?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          doc.user?.role === 'CLIENT' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {doc.user?.role || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {doc.docType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          PENDING
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a 
                            href={doc.fileUrl?.replace('/fl_attachment/', '/') || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            👁️ View
                          </a>
                          <button 
                            onClick={() => handleApprove(doc._id, doc.userId)}
                            disabled={approving === doc._id}
                            className="px-3 py-2 text-xs bg-[#3ab54a] text-white rounded hover:bg-[#2d9e3c] transition-colors disabled:opacity-50"
                          >
                            {approving === doc._id ? '...' : '✅ Approve'}
                          </button>
                          <button 
                            onClick={() => handleReject(doc._id)}
                            disabled={approving === doc._id}
                            className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {approving === doc._id ? '...' : '❌ Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
