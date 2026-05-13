'use client'
import { useCallback, useEffect } from 'react'
import { useAppDispatch } from './useAppDispatch'
import { useAppSelector } from './useAppSelector'
import { clearAuth, loginUser, refreshToken } from '@/store/authSlice'

export function useAuth() {
  const dispatch = useAppDispatch()
  const { user, accessToken, isLoading, isInitialized, error } = useAppSelector(
    (state) => state.auth
  )

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await dispatch(loginUser({ email, password }))
      if (loginUser.fulfilled.match(result)) {
        return { success: true, user: result.payload.user }
      }
      return { success: false, error: result.payload as string }
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    dispatch(clearAuth())
    try {
      await fetch('/api/auth/jwt-logout', { method: 'POST', credentials: 'include' })
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace('/login')
    }
  }, [dispatch])

  const refresh = useCallback(async (): Promise<boolean> => {
    const result = await dispatch(refreshToken())
    return refreshToken.fulfilled.match(result)
  }, [dispatch])

  return {
    user,
    accessToken,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    refreshToken: refresh,
  }
}

/**
 * Auto-refresh access token based on the JWT expiry claim in `accessToken`.
 * Uses Redux state via `useAuth()`.
 */
export function useAutoRefreshToken() {
  const { accessToken, refreshToken } = useAuth()

  // If we don't have a real JWT string, there is nothing to decode.
  useEffect(() => {
    if (!accessToken || accessToken === 'cookie') return

    try {
      const parts = accessToken.split('.')
      if (parts.length !== 3) return

      const payload = JSON.parse(atob(parts[1]))
      if (!payload.exp) return

      const expiresIn = payload.exp * 1000 - Date.now()
      const refreshTime = expiresIn - 5 * 60 * 1000

      if (refreshTime <= 0) {
        refreshToken()
        return
      }

      const timer = setTimeout(() => refreshToken(), refreshTime)
      return () => clearTimeout(timer)
    } catch (error) {
      console.error('[useAuth] Failed to setup token refresh:', error)
    }
  }, [accessToken, refreshToken])
}
