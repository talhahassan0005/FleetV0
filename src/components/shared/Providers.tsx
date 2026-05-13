'use client'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { AuthInitializer } from './AuthInitializer'
import { HeaderWrapper } from './HeaderWrapper'
import { FooterWrapper } from './FooterWrapper'
import { ToastContainer } from '@/components/ui'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <HeaderWrapper />
        {children}
        <FooterWrapper />
        <ToastContainer />
      </AuthInitializer>
    </Provider>
  )
}
