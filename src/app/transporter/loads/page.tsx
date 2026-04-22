'use client'
// src/app/transporter/loads/page.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Topbar, PageLayout } from '@/components/ui'
import { useVerificationStatus } from '@/hooks/useVerificationStatus'

interface Load {
  _id: string
  ref: string
  origin: string
  destination: string
  cargoType?: string
  weight?: number
  description?: string
  status: string
  createdAt: string
}

export default function AvailableLoadsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isVerified, refreshVerificationStatus } = useVerificationStatus()
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // BUG FIX #3: Refresh verification status on mount
  useEffect(() => {
    refreshVerificationStatus()
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.role || session.user.role !== 'TRANSPORTER') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchLoads = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/transporter/available-loads')

        if (!res.ok) {
          const errorData = await res.json()
          setError(errorData.error || 'Failed to fetch loads')
          return
        }

        const data = await res.json()
        setLoads(data.loads || [])
        setError('')
      } catch (err) {
        console.error('Error fetching loads:', err)
        setError('Error loading available loads')
      } finally {
        setLoading(false)
      }
    }

    // Only fetch once on mount when session is verified
    if (session?.user?.role === 'TRANSPORTER') {
      fetchLoads()
    }
  }, [session, router])

  if (loading) {
    return (
      <>
        <Topbar title="Available Loads" />
        <PageLayout>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
            <p className="text-gray-600 mt-4">Loading available loads...</p>
          </div>
        </PageLayout>
      </>
    )
  }

  if (!isVerified) {
    return (
      <>
        <Topbar title="Available Loads" />
        <PageLayout>
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-yellow-900 mb-2">Account Verification Required</h2>
              <p className="text-yellow-800 mb-4">
                Please verify your account first to view available loads and submit quotes.
              </p>
              <Link 
                href="/transporter/profile"
                className="inline-block px-6 py-2 bg-[#3ab54a] text-white rounded font-semibold hover:bg-[#2d9e3c] transition-colors"
              >
                Complete Verification
              </Link>
            </div>
          </div>
        </PageLayout>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Topbar title="Available Loads" />
        <PageLayout>
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </PageLayout>
      </>
    )
  }

  return (
    <>
      <Topbar title="Available Loads" />
      <PageLayout>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1a2a5e] mb-2">Available Loads</h1>
            <p className="text-gray-600">
              {loads.length === 0 
                ? 'No available loads at the moment. Check back later!' 
                : `Found ${loads.length} load${loads.length !== 1 ? 's' : ''} available for quoting`}
            </p>
          </div>

          {loads.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Available Loads</h3>
              <p className="text-gray-600 mb-6">
                There are currently no available loads for you to quote on.
              </p>
              <p className="text-sm text-gray-500">
                New loads are posted regularly. Come back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {loads.map(load => (
                <Link
                  key={load._id}
                  href={`/transporter/loads/${load._id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-[#3ab54a]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#1a2a5e]">{load.ref}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Posted {new Date(load.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {load.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">From</p>
                        <p className="text-sm font-semibold text-gray-700">{load.origin}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-xl text-[#3ab54a]">→</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">To</p>
                        <p className="text-sm font-semibold text-gray-700">{load.destination}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {load.cargoType && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Cargo Type</p>
                          <p className="text-sm text-gray-700">{load.cargoType}</p>
                        </div>
                      )}
                      {load.weight && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Weight</p>
                          <p className="text-sm text-gray-700">{load.weight} tons</p>
                        </div>
                      )}
                    </div>

                    {load.description && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Description</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{load.description}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm">
                      View Details & Quote →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </>
  )
}
