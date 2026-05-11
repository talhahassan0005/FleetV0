// src/hooks/useVerificationStatus.ts
'use client'
import { useAuth } from './useAuth'
import { useEffect, useState } from 'react'

export function useVerificationStatus() {
  const { user, refreshToken } = useAuth()
  const [isVerified, setIsVerified] = useState(user?.isVerified || false)
  const [loading, setLoading] = useState(false)

  // Sync with user changes
  useEffect(() => {
    if (user?.isVerified !== undefined) {
      setIsVerified(user.isVerified)
    }
  }, [user?.isVerified])

  // Function to refresh verification status from database
  const refreshVerificationStatus = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      // Refresh the JWT token to get updated user data
      await refreshToken()
    } catch (err) {
      console.error('[useVerificationStatus] Failed to refresh:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    isVerified,
    verificationStatus: user?.verificationStatus,
    verificationComment: user?.verificationComment,
    refreshVerificationStatus,
    loading,
  }
}
