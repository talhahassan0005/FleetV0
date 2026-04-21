'use client'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        
        {session?.user && (
          <p className="text-sm text-gray-500 mb-6">
            Your role: <span className="font-semibold">{(session.user as any).adminRole || session.user.role}</span>
          </p>
        )}
        
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="w-full px-4 py-2 bg-[#3ab54a] text-white rounded-lg font-semibold hover:bg-[#2d9e3c] transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
