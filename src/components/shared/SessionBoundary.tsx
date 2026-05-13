'use client'
import { useAppSelector } from '@/hooks/useAppSelector'
import { ReactNode } from 'react'

export function SessionBoundary({ children }: { children: ReactNode }) {
  const { isInitialized } = useAppSelector((state) => state.auth)

  // Wait for the FIRST session check to complete before rendering anything.
  // This prevents flash of unauthenticated state.
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ab54a] mx-auto mb-4" />
          <p className="text-sm text-gray-600 font-medium">
            Loading your workspace...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
