// src/app/admin/users/page.tsx
'use client'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface User {
  _id: string
  email: string
  companyName: string
  role: string
  isVerified: boolean
  verificationStatus: string
  createdAt: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleFilter = searchParams.get('role') || ''
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ userId: string; email: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    const fetchUsers = async () => {
      try {
        const url = roleFilter 
          ? `/api/admin/users?role=${roleFilter}` 
          : '/api/admin/users'
        
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users || [])
        } else if (res.status === 401) {
          router.push('/login')
        }
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [session, router, roleFilter])

  const handleApproveUser = async (userId: string) => {
    try {
      setActioningId(userId)
      const res = await fetch(`/api/admin/registrations/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          rejectionReason: '',
        }),
      })

      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, isVerified: true, verificationStatus: 'APPROVED' } : u))
      } else {
        alert('Failed to approve user')
      }
    } catch (err) {
      console.error('Error approving user:', err)
      alert('Error approving user')
    } finally {
      setActioningId(null)
    }
  }

  const handleRejectUser = async () => {
    if (!rejectModal?.userId || !rejectionReason.trim()) {
      alert('Please enter rejection reason')
      return
    }

    try {
      setActioningId(rejectModal.userId)
      const res = await fetch(`/api/admin/registrations/${rejectModal.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason: rejectionReason.trim(),
        }),
      })

      if (res.ok) {
        setUsers(users.map(u => u._id === rejectModal.userId ? { ...u, isVerified: false, verificationStatus: 'REJECTED' } : u))
        setRejectModal(null)
        setRejectionReason('')
      } else {
        alert('Failed to reject user')
      }
    } catch (err) {
      console.error('Error rejecting user:', err)
      alert('Error rejecting user')
    } finally {
      setActioningId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a2a5e] mb-4">Users Management</h1>
        
        <div className="flex gap-2 mb-4">
          {[['', 'All Users'], ['CLIENT', 'Clients Only'], ['TRANSPORTER', 'Transporters Only']].map(([r, label]) => (
            <Link
              key={r}
              href={`/admin/users${r ? `?role=${r}` : ''}`}
              className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                roleFilter === r
                  ? 'bg-[#3ab54a] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Verification Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Joined</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.companyName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      user.role === 'CLIENT' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'TRANSPORTER' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      user.isVerified 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {!user.isVerified ? (
                        <>
                          <button
                            onClick={() => handleApproveUser(user._id)}
                            disabled={actioningId === user._id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Approve user"
                          >
                            {actioningId === user._id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => setRejectModal({ userId: user._id, email: user.email })}
                            disabled={actioningId === user._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Reject user"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      ) : (
                        <span className="p-2 text-green-600">
                          <CheckCircle2 size={18} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#1a2a5e] mb-2">
              Reject User
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Email: <span className="font-semibold">{rejectModal.email}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Invalid documents, Incomplete information..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal(null)
                  setRejectionReason('')
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectUser}
                disabled={actioningId !== null || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actioningId === rejectModal.userId ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Rejecting...
                  </span>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
