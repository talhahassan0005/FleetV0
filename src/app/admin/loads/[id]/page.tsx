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
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export default function AdminLoadDetailPage() {
  const params = useParams() as { id?: string }
  
  // Get loadId from params or extract from URL pathname as fallback
  const [loadId, setLoadId] = useState<string | null>(null)
  const [load, setLoad] = useState<Load | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showManagement, setShowManagement] = useState(false)

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
        </div>
      </PageLayout>
    </>
  )
}