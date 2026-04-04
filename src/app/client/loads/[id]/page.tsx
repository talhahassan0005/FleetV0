// src/app/client/loads/[id]/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Quote {
  _id: string
  transporterName: string
  price: number
  currency: string
  notes?: string
  status: string
  createdAt: string
}

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
  currency: string
  status: string
  createdAt?: string
  quotesCount?: number
  quotes?: Quote[]
}

export default function ClientLoadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [load, setLoad] = useState<Load | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLoad = async () => {
      try {
        const res = await fetch(`/api/client/loads/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setLoad(data.load)
        } else if (res.status === 404) {
          router.push('/client')
        }
      } catch (err) {
        console.error('Error fetching load:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLoad()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
      </div>
    )
  }

  if (!load) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Load not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 mb-6 transition-colors"
      >
        ← Back to My Loads
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        {/* Load Header */}
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#1a2a5e]">{load.ref || 'Unknown Reference'}</h1>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${
                load.status === 'POSTED' ? 'bg-blue-100 text-blue-800' :
                load.status === 'QUOTED' ? 'bg-yellow-100 text-yellow-800' :
                load.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                load.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                load.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' :
                load.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {load.status}
              </span>
            </div>
            {load.createdAt && (
              <p className="text-sm text-gray-500 mt-2">
                Posted on {new Date(load.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Load Body */}
        <div className="p-6">
          {/* Route Section */}
          <div className="flex items-center gap-4 mb-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
            <div className="flex-1">
              <p className="text-xs text-blue-500 uppercase font-bold tracking-wider mb-1">Origin</p>
              <p className="text-lg font-bold text-[#1a2a5e]">{load.origin}</p>
            </div>
            <div className="text-[#3ab54a] font-black text-2xl">
              →
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs text-blue-500 uppercase font-bold tracking-wider mb-1">Destination</p>
              <p className="text-lg font-bold text-[#1a2a5e]">{load.destination}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cargo & Stats */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Cargo Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold">Cargo Type</p>
                  <p className="text-lg font-bold text-[#1a2a5e] mt-1">{load.cargoType || '—'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold">Weight</p>
                  <p className="text-lg font-bold text-[#1a2a5e] mt-1">{load.weight ? `${load.weight}t` : '—'}</p>
                </div>
              </div>

              {load.description && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Description & Requirements:</p>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 whitespace-pre-wrap">
                    {load.description}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline & Price */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Logistics & Price</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold">Collection Date</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {load.collectionDate ? new Date(load.collectionDate).toLocaleDateString() : 'Flexible'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold">Delivery Date</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'Flexible'}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 uppercase font-bold mb-1">Target Price / Budget</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-green-800">{load.currency || 'ZAR'}</span>
                  <span className="text-4xl font-black text-green-600">
                    {load.finalPrice 
                      ? load.finalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })
                      : 'Pending Quotes'}
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-2 font-medium">
                  {load.status === 'POSTED' ? 'Waiting for transporter bids...' : 'Budget locked in.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quotes Section */}
        {load.quotesCount !== undefined && load.quotesCount > 0 && (
          <div className="p-6 border-t border-gray-100">
            <h3 className="text-2xl font-bold text-[#1a2a5e] mb-4 flex items-center gap-2">
              📋 Quotes Received
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                {load.quotesCount}
              </span>
            </h3>
            
            <div className="space-y-3">
              {load.quotes?.map((quote) => (
                <div key={quote._id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{quote.transporterName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(quote.createdAt).toLocaleDateString()} at {new Date(quote.createdAt).toLocaleTimeString()}
                      </p>
                      {quote.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{quote.notes}"</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold">Quoted Price</p>
                      <p className="text-2xl font-black text-blue-600">
                        {quote.currency} {quote.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${
                        quote.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        quote.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Quotes Yet */}
        {load.quotesCount === 0 && load.status === 'POSTED' && (
          <div className="p-6 border-t border-gray-100 bg-yellow-50">
            <p className="text-sm text-yellow-800">
              ⏳ No quotes received yet. Transporters will start bidding on your load soon.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
