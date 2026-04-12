// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/shared/Providers'
import '@/lib/initialize' // Initialize background jobs

export const metadata: Metadata = {
  title: 'FleetXchange | Africa\'s Largest Freight Hub',
  description: 'Managed freight brokerage platform for Southern Africa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-gray-50 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
