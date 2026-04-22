'use client'
// src/app/admin/verification/page.tsx
import { useEffect, useState } from 'react'
import { Topbar, PageLayout } from '@/components/ui'
import AdminVerificationReviewModal from '@/components/admin/AdminVerificationReviewModal'

interface RegistrationUser {
  id: string
  email: string
  companyName: string
  contactName: string
  phone: string
  role: string
  createdAt: string
  documents: Array<{
    id: string
    docType: string
    originalName: string
    fileUrl: string
    verificationStatus: string
    verificationComment: string
  }>
}

export default function VerificationPage() {
  const [users, setUsers] = useState<RegistrationUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<RegistrationUser | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchPendingRegistrations()
  }, [])

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('[VerificationPage] Fetching pending registrations from /api/admin/registrations')
      const res = await fetch('/api/admin/registrations')
      
      console.log('[VerificationPage] Response status:', res.status)
      
      if (!res.ok) {
        const errorData = await res.json()
        console.error('[VerificationPage] Error response:', errorData)
        setError(errorData.error || 'Failed to fetch pending registrations')
        return
      }

      const data = await res.json()
      console.log('[VerificationPage] Response data:', data)
      
      if (data.success && data.data) {
        setUsers(data.data)
        console.log('[VerificationPage] Loaded', data.data.length, 'pending users')
      } else {
        console.log('[VerificationPage] No data in response')
        setError('No data received from server')
      }
    } catch (err) {
      console.error('[VerificationPage] Fetch error:', err)
      setError('Error loading pending registrations')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (userId: string, approved: boolean, rejectionReason?: string) => {
    if (!approved && !rejectionReason?.trim()) {
      alert('Please enter rejection reason')
      return
    }

    try {
      setVerifyingId(userId)
      const res = await fetch(`/api/admin/registrations/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approved ? 'APPROVED' : 'REJECTED',
          rejectionReason: rejectionReason || 'Document verification failed',
        }),
      })

      if (!res.ok) throw new Error('Verification failed')

      setRejectionReason('')
      setSelectedUser(null)
      await fetchPendingRegistrations()
    } catch (err) {
      console.error('Verification error:', err)
      alert('Failed to verify user')
    } finally {
      setVerifyingId(null)
    }
  }

  const handleApproveUser = async (userId: string) => {
    await handleVerify(userId, true)
  }

  const handleRejectUser = async (userId: string, reason: string) => {
    await handleVerify(userId, false, reason)
  }

  return (
    <>
      <Topbar title="User Verification" />
      <PageLayout>
        <div className="card">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">
              Pending Registrations ({users.length})
            </h3>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 font-semibold">⚠️ Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
              <p className="text-gray-400 mt-4">Loading pending registrations...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              ✅ All registrations verified! No pending users.
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="p-4 border border-gray-200 rounded hover:border-[#3ab54a] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{user.role === 'CLIENT' ? '🏭' : '🚛'}</span>
                        <h4 className="font-semibold text-[#1a2a5e]">{user.companyName}</h4>
                        <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">📧 {user.email}</p>
                      <p className="text-sm text-gray-600 mb-2">👤 {user.contactName} • 📱 {user.phone}</p>
                      <p className="text-xs text-gray-500">
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">📄 Documents:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.fileUrl?.replace('/fl_attachment/', '/') || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-3 py-1.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              📥 {doc.docType}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-4 py-2 rounded text-sm font-semibold bg-[#3ab54a] text-white hover:bg-green-600 ml-4"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        <AdminVerificationReviewModal
          user={selectedUser as any}
          onClose={() => {
            setSelectedUser(null)
            setRejectionReason('')
          }}
          onApprove={handleApproveUser}
          onReject={handleRejectUser}
          isVerifying={verifyingId !== null}
        />
      </PageLayout>
    </>
  )
}
