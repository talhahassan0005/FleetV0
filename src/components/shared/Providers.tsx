'use client'
// src/components/shared/Providers.tsx
import { SessionProvider } from 'next-auth/react'
import { HeaderWrapper } from './HeaderWrapper'
import { FooterWrapper } from './FooterWrapper'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <HeaderWrapper />
      {children}
      <FooterWrapper />
    </SessionProvider>
  )
}
