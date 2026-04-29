'use client'
// src/app/admin/loads/[id]/page.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Topbar, PageLayout } from '@/components/ui'
import { AdminLoadActions } from '@/components/admin/AdminLoadActions'

interface Load {
  _id: string
  ref: string
  origin: string
  destination: string
  cargoType?: string
  weight?: number
  description?: string
  collectionDate?: string
  deliveryDate?: string
  finalPrice?: number
  commission?: number
  currency: string
  status: string
  clientId: string
  assignedTransporterId?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

interface Quote {
  _id: string
  transporterId: string
  transporterName: string
  price: number
  currency: string
  notes?: string
  status: string
  rejectionReason?: string
  createdAt: string
}

export default function AdminLoadDetailPage() {
  const params = useParams() as { id?: string }
  
  // Get loadId from params or extract from URL pathname as fallback
  const [loadId, setLoadId] = useState<string | null>(null)
  const [load, setLoad] = useState<Load | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showManagement, setShowManagement] = useState(false)
  const [assigningQuoteId, setAssigningQuoteId] = useState<string | null>(null)
  const [rejectingQuoteId, setRejectingQuoteId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // First effect: Extract the loadId from params or URL
  useEffect(() => {
    // Method 1: Try to get from useParams()
    if (params?.id) {
      console.log('[AdminLoadDetail] Got ID from useParams():', params.id)
      setLoadId(params.id as string)
      return
    }

    // Method 2: Extract from URL pathname as fallback
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/')
      const adminLoadsIndex = pathParts.indexOf('loads')
      
      if (adminLoadsIndex !== -1 && adminLoadsIndex + 1 < pathParts.length) {
        const extractedId = pathParts[adminLoadsIndex + 1]
        if (extractedId && extractedId !== 'undefined') {
          console.log('[AdminLoadDetail] Extracted ID from URL:', extractedId)
          setLoadId(extractedId)
          return
        }
      }
    }

    console.error('[AdminLoadDetail] Could not extract load ID. Params:', params, 'URL:', typeof window !== 'undefined' ? window.location.pathname : 'N/A')
  }, [params])

  // Second effect: Fetch the load data once we have the loadId
  useEffect(() => {
    if (!loadId) return

    const fetchLoad = async () => {
      try {
        setLoading(true)
        setError('')
        
        const apiUrl = `/api/admin/loads/${loadId}`
        console.log('[AdminLoadDetail] Calling API:', apiUrl)
        
        const res = await fetch(apiUrl)
        console.log('[AdminLoadDetail] API Response status:', res.status)
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error('[AdminLoadDetail] API Error:', errorData)
          setError(errorData.error || 'Failed to load load details')
          setLoad(null)
          return
        }

        const data = await res.json()
        console.log('[AdminLoadDetail] API Response data:', data)
        
        if (data.load) {
          setLoad(data.load)
          setError('')
          
          // Fetch quotes for this load
          const quotesRes = await fetch(`/api/admin/loads/${loadId}/quotes`)
          if (quotesRes.ok) {
            const quotesData = await quotesRes.json()
            setQuotes(quotesData.quotes || [])
          }
        } else {
          setError('Invalid response format from server')
          setLoad(null)
        }
      } catch (err) {
        console.error('[AdminLoadDetail] Fetch error:', err)
        setError(`Error loading load: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setLoad(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLoad()
  }, [loadId])

  if (loading) {
    return (
      <>
        <Topbar title="Load Details" />
        <PageLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ab54a]"></div>
          </div>
        </PageLayout>
      </>
    )
  }

  if (error || !load) {
    return (
      <>
        <Topbar title="Load Details" />
        <PageLayout>
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded p-6">
              <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Load</h2>
              <p className="text-red-800 mb-4">{error || 'Load not found'}</p>
              <Link 
                href="/admin/loads"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                ← Back to Loads
              </Link>
            </div>
          </div>
        </PageLayout>
      </>
    )
  }

  return (
    <>
      <PageLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Link 
            href="/admin/loads"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-semibold transition-colors"
          >
            ← Back to Loads
          </Link>

          {/* Load Summary Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500">Reference</label>
                <p className="text-2xl font-bold text-[#1a2a5e]">{load.ref}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500">Status</label>
                <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                  load.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  load.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  load.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {load.status}
                </span>
              </div>
            </div>

            {/* Route Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-semibold text-[#1a2a5e] mb-3">Route</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">From</p>
                  <p className="text-lg font-semibold text-[#1a2a5e]">{load.origin}</p>
                </div>
                <div className="text-2xl text-[#3ab54a]">→</div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">To</p>
                  <p className="text-lg font-semibold text-[#1a2a5e]">{load.destination}</p>
                </div>
              </div>
            </div>

            {/* Load Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {load.cargoType && (
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Cargo Type</label>
                  <p className="text-lg font-semibold text-[#1a2a5e]">{load.cargoType}</p>
                </div>
              )}
              {load.weight && (
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Weight</label>
                  <p className="text-lg font-semibold text-[#1a2a5e]">{load.weight} tons</p>
                </div>
              )}
              {load.collectionDate && (
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Collection Date</label>
                  <p className="text-lg font-semibold text-[#1a2a5e]">{new Date(load.collectionDate).toLocaleDateString()}</p>
                </div>
              )}
              {load.deliveryDate && (
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Delivery Date</label>
                  <p className="text-lg font-semibold text-[#1a2a5e]">{new Date(load.deliveryDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {load.description && (
              <div className="mb-6">
                <label className="text-xs font-semibold uppercase text-gray-500">Description</label>
                <p className="text-gray-700 leading-relaxed">{load.description}</p>
              </div>
            )}

            {/* Pricing Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-[#1a2a5e] mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Base Price</label>
                  <p className="text-2xl font-bold text-[#1a2a5e]">
                    {load.currency} {load.finalPrice?.toLocaleString() || '—'}
                  </p>
                </div>
                {load.commission && load.commission > 0 && (
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-500">Commission</label>
                    <p className="text-2xl font-bold text-blue-600">
                      +{load.currency} {load.commission?.toLocaleString() || '0'}
                    </p>
                  </div>
                )}
                {load.commission && load.commission > 0 && (
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-500">Total</label>
                    <p className="text-2xl font-bold text-green-600">
                      {load.currency} {((load.finalPrice || 0) + (load.commission || 0)).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason */}
            {load.status === 'REJECTED' && load.rejectionReason && (
              <div className="border-t border-gray-200 pt-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <h3 className="font-semibold text-red-900 mb-2">Rejection Reason</h3>
                  <p className="text-red-800">{load.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Meta Information */}
            <div className="border-t border-gray-200 pt-6 mt-6 text-xs text-gray-500 space-y-1">
              <p>Created: {new Date(load.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(load.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Management Actions */}
          {load.status === 'PENDING' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <button
                onClick={() => setShowManagement(!showManagement)}
                className="w-full px-4 py-2 bg-[#1a2a5e] text-white rounded font-semibold hover:bg-[#0f1640] transition-colors mb-4"
              >
                {showManagement ? '▼ Hide Management Panel' : '▶ Show Management Panel'}
              </button>

              {showManagement && loadId && (
                <div className="mt-6">
                  <AdminLoadActions
                    loadId={loadId}
                    action="loadManagement"
                    onSuccess={() => {
                      // Refresh the load data
                      window.location.reload()
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Quotes Section */}
          {quotes.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#1a2a5e] mb-4 flex items-center gap-2">
                📋 Quotes Received
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  {quotes.length}
                </span>
              </h2>
              
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <div key={quote._id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{quote.transporterName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(quote.createdAt).toLocaleDateString()} at {new Date(quote.createdAt).toLocaleTimeString()}
                        </p>
                        {quote.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{quote.notes}"</p>
                        )}
                        {quote.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-xs text-red-600 font-semibold">Rejection Reason:</p>
                            <p className="text-sm text-red-800">{quote.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500 uppercase font-bold">Quoted Price</p>
                        <p className="text-2xl font-black text-blue-600">
                          {quote.currency} {quote.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${
                          quote.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                          quote.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          quote.status === 'AUTO_REJECTED' ? 'bg-gray-100 text-gray-600' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {quote.status === 'AUTO_REJECTED' ? 'REJECTED' : quote.status}
                        </span>
                        
                        {/* Admin Assignment Actions */}
                        {(load.status === 'APPROVED' || load.status === 'QUOTED') && quote.status === 'PENDING' && (
                          <div className="mt-3">
                            {rejectingQuoteId === quote._id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Reason for rejection (optional)"
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:border-red-500"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`/api/quotes/${quote._id}`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: 'REJECTED', rejectionReason })
                                        })
                                        if (res.ok) {
                                          window.location.reload()
                                        } else {
                                          alert('Failed to reject quote')
                                        }
                                      } catch (err) {
                                        alert('Error rejecting quote')
                                      }
                                    }}
                                    className="flex-1 px-3 py-1.5 rounded text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                                  >
                                    ✓ Confirm Reject
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingQuoteId(null)
                                      setRejectionReason('')
                                    }}
                                    className="px-3 py-1.5 rounded text-xs font-semibold bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Assign this load to ${quote.transporterName}?`)) return
                                    setAssigningQuoteId(quote._id)
                                    try {
                                      const res = await fetch(`/api/admin/loads/${loadId}/assign`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ quoteId: quote._id, transporterId: quote.transporterId })
                                      })
                                      if (res.ok) {
                                        alert('Load assigned successfully!')
                                        window.location.reload()
                                      } else {
                                        const error = await res.json()
                                        alert(`Failed to assign: ${error.error}`)
                                      }
                                    } catch (err) {
                                      alert('Error assigning load')
                                    } finally {
                                      setAssigningQuoteId(null)
                                    }
                                  }}
                                  disabled={assigningQuoteId === quote._id}
                                  className="flex-1 px-3 py-1.5 rounded text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-60"
                                >
                                  {assigningQuoteId === quote._id ? '⏳' : '✓'} Assign Load
                                </button>
                                <button
                                  onClick={() => setRejectingQuoteId(quote._id)}
                                  className="flex-1 px-3 py-1.5 rounded text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                  ✗ Reject
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  )
}