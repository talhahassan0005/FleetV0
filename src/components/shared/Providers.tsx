'use client'
// src/components/shared/Providers.tsx
import { HeaderWrapper } from './HeaderWrapper'
import { FooterWrapper } from './FooterWrapper'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderWrapper />
      {children}
      <FooterWrapper />
    </>
  )
}
