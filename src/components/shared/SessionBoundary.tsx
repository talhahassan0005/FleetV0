'use client'
// src/components/shared/SessionBoundary.tsx
import { useAuth } from '@/hooks/useAuth'
import { ReactNode } from 'react'

export function SessionBoundary({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ab54a] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}
