// src/app/client/page.tsx
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Load {
  _id: string
  ref: string
  origin: string
  destination: string
  cargoType?: string
  weight?: number
  collectionDate?: string
  finalPrice?: number
  currency: string
  status: string
  clientId: string
  createdAt: string
  quotesCount?: number
}

export default function ClientDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    const fetchLoads = async () => {
      try {
        const res = await fetch('/api/client/loads')
        if (res.ok) {
          const data = await res.json()
          setLoads(data.loads || [])
        } else if (res.status === 401) {
          router.push('/login')
        }
      } catch (err) {
        console.error('Error fetching loads:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLoads()
  }, [session, router])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a2a5e]">My Loads</h1>
        <Link href="/client/post-load" className="px-4 py-2 bg-[#3ab54a] text-white rounded hover:bg-[#2d9e3c] transition-colors text-sm font-semibold">
          + Post Load
        </Link>
      </div>

      {!session?.user?.isVerified && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 border-l-4 border-l-yellow-500 rounded text-yellow-800 text-sm">
          ⏳ Your account is pending verification. You'll be able to post loads once verified.
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Route</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Cargo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Collection</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Quotes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {loads.map(load => (
                <tr key={load._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#1a2a5e] text-sm">{load.ref}</td>
                  <td className="px-4 py-3 text-sm">
                    {load.origin} <span className="text-[#3ab54a] font-bold">→</span> {load.destination}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {load.cargoType || '—'}{load.weight ? ` · ${load.weight}t` : ''}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {load.collectionDate ? new Date(load.collectionDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {load.finalPrice ? `${load.currency || 'ZAR'} ${load.finalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : <span className="text-gray-400">Pending</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      load.status === 'POSTED' ? 'bg-blue-100 text-blue-800' :
                      load.status === 'QUOTED' ? 'bg-yellow-100 text-yellow-800' :
                      load.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      load.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' :
                      load.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {load.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(load.quotesCount ?? 0) > 0 ? (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                        📋 {load.quotesCount}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/client/loads/${load._id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {loads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-gray-500 mb-4">No loads posted yet.</p>
                    <Link href="/book-a-load" className="inline-block px-4 py-2 bg-[#3ab54a] text-white rounded hover:bg-[#2d9e3c] transition-colors text-sm font-semibold">
                      Post your first load →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
