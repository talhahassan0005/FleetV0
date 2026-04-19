// src/hooks/useVerificationStatus.ts
'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function useVerificationStatus() {
  const { data: session, update } = useSession()
  const [isVerified, setIsVerified] = useState(session?.user?.isVerified || false)
  const [loading, setLoading] = useState(false)

  // Sync with session changes
  useEffect(() => {
    if (session?.user?.isVerified !== undefined) {
      setIsVerified(session.user.isVerified)
    }
  }, [session?.user?.isVerified])

  // Function to refresh verification status from database
  const refreshVerificationStatus = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      const res = await fetch('/api/auth/refresh-session')
      
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user) {
          // Update session with fresh data
          await update({
            ...session,
            user: {
              ...session.user,
              isVerified: data.user.isVerified,
              verificationStatus: data.user.verificationStatus,
              verificationComment: data.user.verificationComment,
            },
          })
          setIsVerified(data.user.isVerified)
        }
      }
    } catch (err) {
      console.error('[useVerificationStatus] Failed to refresh:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    isVerified,
    verificationStatus: session?.user?.verificationStatus,
    verificationComment: session?.user?.verificationComment,
    refreshVerificationStatus,
    loading,
  }
}
