'use client'
// src/components/shared/Providers.tsx
import { SessionProvider } from 'next-auth/react'
import { HeaderWrapper } from './HeaderWrapper'
import { FooterWrapper } from './FooterWrapper'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <HeaderWrapper />
      {children}
      <FooterWrapper />
    </SessionProvider>
  )
}
