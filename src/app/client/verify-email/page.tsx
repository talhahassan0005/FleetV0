'use client'
// src/app/client/verify-email/page.tsx
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleResendVerification() {
    if (!session?.user?.email) return
    
    setLoading(true)
    setError('')
    setSent(false)
    
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send verification email')
        return
      }
      
      setSent(true)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar title="Verify Email">
        <Link href="/client" className="btn-outline-fx text-xs">← Back</Link>
      </Topbar>
      <PageLayout>
        <div className="max-w-md mx-auto">
          <div className="card">
            <div className="table-header"><span className="table-title">Email Verification</span></div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    An email verification link has been sent to <strong>{session?.user?.email}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    Check your inbox and spam folder. Click the verification link to verify your email and start posting loads.
                  </p>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border-l-4 border-l-red-500 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}
                
                {sent && (
                  <div className="p-3 bg-green-50 border-l-4 border-l-green-500 rounded text-green-700 text-sm">
                    ✓ Verification email sent successfully! Check your inbox.
                  </div>
                )}
                
                <div className="pt-2">
                  <p className="text-xs text-gray-600 mb-4">
                    Didn't receive the email? Click below to resend it.
                  </p>
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="w-full btn-fx text-sm px-4 py-2 disabled:opacity-60"
                  >
                    {loading ? 'Sending…' : 'Resend Verification Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
