'use client'
// src/app/transporter/quotes/page.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Topbar, PageLayout } from '@/components/ui'

interface Quote {
  _id: string
  loadId: string
  quotedPrice: number
  currency: string
  status: string
  createdAt: string
  rejectionReason?: string
  load?: {
    _id: string
    ref: string
    origin: string
    destination: string
    cargoType?: string
    weight?: number
    status: string
  }
}

const QUOTE_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  ACCEPTED: { bg: 'bg-green-100', text: 'text-green-700' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
  AUTO_REJECTED: { bg: 'bg-gray-100', text: 'text-gray-600' },
  EXPIRED: { bg: 'bg-gray-100', text: 'text-gray-700' },
}

export default function MyQuotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(true)
  const [error, setError] = useState('')

  // Handle session auth
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.role || session.user.role !== 'TRANSPORTER') {
      router.push('/login')
    }
  }, [session, router, status])

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/transporter/my-quotes')

        if (!res.ok) {
          const errorData = await res.json()
          setError(errorData.error || 'Failed to fetch quotes')
          return
        }

        const data = await res.json()
        
        if (!data.verified) {
          setVerified(false)
          setQuotes([])
          return
        }

        setQuotes(data.quotes || [])
        setError('')
      } catch (err) {
        console.error('Error fetching quotes:', err)
        setError('Error loading your quotes')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated' && session?.user?.role === 'TRANSPORTER') {
      fetchQuotes()
    }
  }, [status, session?.user?.role])

  if (loading || status === 'loading') {
    return (
      <>
        <Topbar title="My Quotes" />
        <PageLayout>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
            <p className="text-gray-600 mt-4">
              {status === 'loading' ? 'Verifying session...' : 'Loading your quotes...'}
            </p>
          </div>
        </PageLayout>
      </>
    )
  }

  if (!verified) {
    return (
      <>
        <Topbar title="My Quotes" />
        <PageLayout>
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-yellow-900 mb-2">Account Verification Required</h2>
              <p className="text-yellow-800 mb-4">
                Please verify your account first to view your quotes.
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
        <Topbar title="My Quotes" />
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
      <Topbar title="My Quotes" />
      <PageLayout>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1a2a5e] mb-2">My Quotes</h1>
            <p className="text-gray-600">
              {quotes.length === 0 
                ? 'You haven\'t submitted any quotes yet.' 
                : `You have ${quotes.length} quote${quotes.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {quotes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Quotes Yet</h3>
              <p className="text-gray-600 mb-6">
                Start browsing available loads and submit your quotes!
              </p>
              <Link 
                href="/transporter/loads"
                className="inline-block px-6 py-2 bg-[#3ab54a] text-white rounded font-semibold hover:bg-[#2d9e3c] transition-colors"
              >
                View Available Loads
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {quotes.map(quote => {
                const statusColor = QUOTE_STATUS_COLORS[quote.status] || QUOTE_STATUS_COLORS.PENDING
                
                // Safe fallbacks to prevent crash if backend sends partial data
                const price = typeof quote.quotedPrice === 'number' ? quote.quotedPrice : 0
                const currency = quote.currency || 'ZAR'
                const createdAt = quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'Recently'
                
                return (
                  <div
                    key={quote._id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-[#3ab54a]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#1a2a5e]">
                          {quote.load?.ref || 'Load'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Quoted {createdAt}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}>
                          {quote.status === 'AUTO_REJECTED' ? 'REJECTED' : quote.status}
                        </span>
                        {quote.status === 'AUTO_REJECTED' && (
                          <p className="text-xs text-gray-500 mt-1">Another quote was accepted</p>
                        )}
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {(quote.status === 'REJECTED' || quote.status === 'AUTO_REJECTED') && quote.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-600 font-semibold uppercase mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-800">{quote.rejectionReason}</p>
                      </div>
                    )}

                    {quote.load && (
                      <>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">From</p>
                            <p className="text-sm font-semibold text-gray-700">{quote.load.origin}</p>
                          </div>
                          <div className="flex items-center justify-center">
                            <span className="text-xl text-[#3ab54a]">→</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">To</p>
                            <p className="text-sm font-semibold text-gray-700">{quote.load.destination}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          {quote.load.cargoType && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">Cargo Type</p>
                              <p className="text-sm text-gray-700">{quote.load.cargoType}</p>
                            </div>
                          )}
                          {quote.load.weight && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">Weight</p>
                              <p className="text-sm text-gray-700">{quote.load.weight} tons</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Your Quote</p>
                        <p className="text-2xl font-bold text-[#3ab54a]">
                          {currency} {price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Link
                        href={`/transporter/loads/${quote.loadId}`}
                        className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold transition-colors"
                      >
                        View Load
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PageLayout>
    </>
  )
}
