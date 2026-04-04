// src/components/ui/skeletons.tsx
'use client'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
    />
  )
}

// Shimmer animation
export const shimmerStyle = `
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`

export function LoadTableSkeleton() {
  return (
    <div className="card">
      <div className="table-header">
        <span className="table-title">My Loads (—)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {['Ref', 'Route', 'Cargo', 'Collection', 'Price', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-48" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-16 rounded" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-12 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded border-b-[3px] border-[#3ab54a] p-4 shadow-sm">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-32 mt-2" />
          <Skeleton className="h-2 w-24 mt-2" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="card">
      <div className="border-b border-gray-100 pb-3 mb-4">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="h-80">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  )
}

export function LoadDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {/* Load summary card */}
        <div className="card">
          <div className="table-header">
            <span className="table-title">
              <Skeleton className="h-5 w-40" />
            </span>
            <Skeleton className="h-6 w-20 rounded" />
          </div>
          <div className="card-body grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Updates timeline */}
        <div className="card">
          <div className="table-header">
            <span className="table-title">
              <Skeleton className="h-5 w-32" />
            </span>
          </div>
          <div className="card-body space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="card-body space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DocumentsTableSkeleton() {
  return (
    <div className="card">
      <div className="table-header">
        <span className="table-title">My Documents (—)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {['File', 'Type', 'Load', 'Uploaded', 'Size', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-12 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl">
      <div className="card mb-4">
        <div className="table-header">
          <span className="table-title">
            <Skeleton className="h-5 w-40" />
          </span>
        </div>
        <div className="card-body space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
