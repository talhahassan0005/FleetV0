// src/app/admin/loads/page.tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLoadActions } from '@/components/admin/AdminLoadActions'
import { Pagination } from '@/components/ui/Pagination'

const STATUSES = ['', 'PENDING', 'APPROVED', 'QUOTED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
const STATUS_LABELS: Record<string, string> = {
  '': 'All', PENDING: 'Pending', APPROVED: 'Approved', QUOTED: 'Quoted',
  ASSIGNED: 'Assigned', IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
}

interface Load {
  _id: string
  ref: string
  origin: string
  destination: string
  status: string
  cargoType?: string
  [key: string]: any
}

import { hasPermission } from '@/lib/rbac'

export default function AdminLoadsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get('status') ?? ''

  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null)
  const [tabLoading, setTabLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchLoads = async () => {
      try {
        const skip = (currentPage - 1) * itemsPerPage
        const url = status 
          ? `/api/admin/loads?status=${status}&skip=${skip}&limit=${itemsPerPage}`
          : `/api/admin/loads?skip=${skip}&limit=${itemsPerPage}`
        
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setLoads(data.loads || [])
          setTotalPages(Math.ceil((data.total || 0) / itemsPerPage))
        }
      } catch (err) {
        console.error('Error fetching loads:', err)
      } finally {
        setLoading(false)
        setTabLoading(false)
      }
    }

    fetchLoads()
  }, [status, currentPage])

  const handleActionSuccess = () => {
    // Refresh loads after action
    const fetchLoads = async () => {
      try {
        const skip = (currentPage - 1) * itemsPerPage
        const url = status 
          ? `/api/admin/loads?status=${status}&skip=${skip}&limit=${itemsPerPage}`
          : `/api/admin/loads?skip=${skip}&limit=${itemsPerPage}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setLoads(data.loads || [])
          setTotalPages(Math.ceil((data.total || 0) / itemsPerPage))
        }
      } catch (err) {
        console.error('Error refreshing loads:', err)
      }
    }
    fetchLoads()
    setSelectedLoadId(null)
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
      <h1 className="text-2xl font-bold text-[#1a2a5e] mb-6">All Loads</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => {
              setTabLoading(true)
              router.push(`/admin/loads${s ? `?status=${s}` : ''}`)
            }}
            disabled={tabLoading}
            className={`whitespace-nowrap px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2 ${
              status === s
                ? 'bg-[#3ab54a] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${tabLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {tabLoading && status === s && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Route</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loads.map(load => (
                <tr key={load._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#1a2a5e]">{load.ref}</td>
                  <td className="px-4 py-3 text-sm">
                    {load.origin} → {load.destination}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    <div className="space-y-1">
                      <div>{load.currency || 'ZAR'} {load.finalPrice?.toLocaleString() || '—'}</div>
                      {load.commission && load.commission > 0 && (
                        <div className="text-xs text-green-600 font-semibold">
                          +Commission: {load.currency || 'ZAR'} {load.commission.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      load.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      load.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      load.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {load.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link 
                        href={`/admin/loads/${load._id}`}
                        className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-semibold transition-colors"
                      >
                        View
                      </Link>
                      {load.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setSelectedLoadId(selectedLoadId === load._id ? null : load._id)}
                            className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-semibold transition-colors"
                          >
                            Manage
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {selectedLoadId && (
              <tbody>
                <tr className="bg-blue-50 border-b">
                  <td colSpan={5} className="px-4 py-4">
                    <div className="bg-white p-4 rounded border border-blue-200">
                      <h3 className="font-bold text-[#1a2a5e] mb-4">Manage Load - {loads.find(l => l._id === selectedLoadId)?.ref}</h3>
                      <AdminLoadActions 
                        loadId={selectedLoadId}
                        action="loadManagement"
                        onSuccess={handleActionSuccess}
                        initialStatus={loads.find(l => l._id === selectedLoadId)?.status}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && loads.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          loading={loading}
        />
      )}
    </div>
  )
}
