// src/app/dashboard/client/page.tsx
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  _id: string
  email: string
  companyName: string
  isVerified: boolean
  documentsSubmitted: boolean
  verificationStatus: string
}

export default function ClientDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.email) {
      router.push('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [session, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d1535] to-[#1a2a5e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ab54a]"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d1535] to-[#1a2a5e] flex items-center justify-center">
        <p className="text-white">User data not available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1535] to-[#1a2a5e] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📦 Client Dashboard
          </h1>
          <p className="text-gray-300">
            Welcome, <span className="font-semibold text-[#3ab54a]">{user.companyName}</span>
          </p>
        </div>

        {/* Verification Status Card */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#1a2a5e]">
              {user.isVerified ? '✅ Account Verified' : '⏳ Verification Pending'}
            </h2>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              user.isVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.verificationStatus || 'PENDING'}
            </span>
          </div>

          {!user.isVerified ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                Your account is pending verification. Please upload required documents to unlock all features.
              </p>
              {user.documentsSubmitted ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                  <p className="font-semibold">📋 Documents Under Review</p>
                  <p className="text-sm mt-1">Our team is reviewing your documents. You'll receive an email once verification is complete (24-48 hours).</p>
                </div>
              ) : (
                <Link 
                  href="/dashboard/verify-documents"
                  className="inline-block px-6 py-3 bg-[#3ab54a] hover:bg-[#2d9e3c] text-white font-semibold rounded-lg transition-colors"
                >
                  📋 Upload Documents Now
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">
                Your account has been verified. You can now access all features.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Link 
                  href="/book-a-load"
                  className="p-4 bg-gradient-to-br from-[#3ab54a] to-[#2d9e3c] text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <p className="font-bold text-lg">Post a Load</p>
                  <p className="text-sm text-green-100">Create a new freight request</p>
                </Link>
                <Link 
                  href="/dashboard/my-loads"
                  className="p-4 bg-blue-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <p className="font-bold text-lg">My Loads</p>
                  <p className="text-sm text-blue-100">View your posted loads</p>
                </Link>
                <Link 
                  href="/dashboard/quotes"
                  className="p-4 bg-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <p className="font-bold text-lg">Quotes</p>
                  <p className="text-sm text-purple-100">View transporter quotes</p>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {user.isVerified && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-4xl font-bold text-[#3ab54a]">0</p>
              <p className="text-gray-600 text-sm mt-2">Active Loads</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-4xl font-bold text-blue-500">0</p>
              <p className="text-gray-600 text-sm mt-2">Total Quotes</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-4xl font-bold text-purple-500">0</p>
              <p className="text-gray-600 text-sm mt-2">Completed</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-4xl font-bold text-orange-500">4.8 ⭐</p>
              <p className="text-gray-600 text-sm mt-2">Your Rating</p>
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-[#1a2a5e] mb-4">Welcome to FleetXChange</h3>
          <p className="text-gray-700 mb-4">
            You're on Africa's largest freight hub. Browse loads, post your shipments, and connect with transporters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/book-freight"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#3ab54a] hover:bg-gray-50 transition-all"
            >
              <p className="font-semibold text-[#1a2a5e] mb-2">📍 Browse Available Freight</p>
              <p className="text-sm text-gray-600">View loads available for pickup</p>
            </Link>
            <Link 
              href="/get-a-quote"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#3ab54a] hover:bg-gray-50 transition-all"
            >
              <p className="font-semibold text-[#1a2a5e] mb-2">💰 Get a Quote</p>
              <p className="text-sm text-gray-600">Request quotes from transporters</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
