// src/app/client/profile/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { Topbar, PageLayout } from '@/components/ui'
import { ObjectId } from 'mongodb'

export default async function ClientProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return (
      <>
        <Topbar title="My Profile" />
        <PageLayout>
          <div className="text-center py-12">
            <p className="text-gray-600">Not authenticated. Please log in.</p>
          </div>
        </PageLayout>
      </>
    )
  }
  
  let user: any = null
  try {
    const db = await getDatabase()
    user = await db.collection('users').findOne({
      _id: new ObjectId(session.user.id)
    })
  } catch (err) {
    console.error('Error fetching user profile:', err)
  }

  return (
    <>
      <Topbar title="My Profile" />
      <PageLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h2 className="font-condensed font-bold text-xl text-[#1a2a5e] uppercase tracking-wide">Account Information</h2>
              </div>

              <div className="space-y-6">
                {/* Company Info */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1 block">Company Name</label>
                  <p className="text-sm font-medium text-[#1a2a5e]">{user?.companyName || '—'}</p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1 block">Contact Person</label>
                    <p className="text-sm font-medium text-[#1a2a5e]">{user?.contactName || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1 block">Phone</label>
                    <p className="text-sm font-medium text-[#1a2a5e]">{user?.phone || '—'}</p>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1 block">Email Address</label>
                  <p className="text-sm font-medium text-[#1a2a5e]">{user?.email || '—'}</p>
                </div>

                {/* Verification Status */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">Verification Status</label>
                  <div className={`inline-block px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide ${
                    user?.isVerified 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {user?.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                  </div>
                  {!user?.isVerified && (
                    <p className="text-xs text-gray-500 mt-2">Your account is pending verification. We'll review and confirm within 24-48 hours.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="card bg-gradient-to-br from-[#0d1535] to-[#1a2a5e] text-white">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-[#3ab54a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">🏭</div>
                </div>
                <h3 className="font-condensed font-bold text-lg uppercase tracking-wide">{user?.companyName?.split(' ')[0] || 'User'}</h3>
                <p className="text-xs text-white/60 mt-1">Client Account</p>
              </div>
            </div>

            <div className="card mt-4">
              <div className="text-center py-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Member Since</p>
                <p className="text-sm font-medium text-[#1a2a5e]">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
          💡 To update your profile information, please contact support at info@fleetxchange.africa
        </div>
      </PageLayout>
    </>
  )
}
