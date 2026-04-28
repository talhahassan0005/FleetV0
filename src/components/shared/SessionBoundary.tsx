'use client'
// src/components/shared/SessionBoundary.tsx
import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

/**
 * SessionBoundary - Prevents flicker/blink during session loading
 * 
 * How it works:
 * 1. Shows loading spinner while session is loading
 * 2. Once session loads, renders children
 * 3. No re-renders = No blink!
 * 
 * Industry Standard: Used by Vercel, Next.js official docs
 */
export function SessionBoundary({ children }: { children: ReactNode }) {
  const { status } = useSession()
  
  // Show loading state until session is ready
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ab54a] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    )
  }
  
  // Session loaded - render children (Sidebar + Content)
  return <>{children}</>
}
