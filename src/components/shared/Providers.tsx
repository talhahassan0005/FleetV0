'use client'
// src/components/shared/Providers.tsx
import { AuthProvider } from '@/hooks/useAuth'
import { HeaderWrapper } from './HeaderWrapper'
import { FooterWrapper } from './FooterWrapper'
import { ToastContainer } from '@/components/ui'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HeaderWrapper />
      {children}
      <FooterWrapper />
      <ToastContainer />
    </AuthProvider>
  )
}
