'use client'
import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { initSession } from '@/store/authSlice'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    dispatch(initSession())
  }, [dispatch])

  return <>{children}</>
}
