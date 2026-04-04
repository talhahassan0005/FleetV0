'use client'
// src/app/login/page.tsx
import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

function LoginContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before using searchParams to avoid hydration errors
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && searchParams.get('registered') === '1') {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, isMounted])

  // Redirect after successful login
  useEffect(() => {
    if (session?.user) {
      const role = session.user.role || 'CLIENT'
      if (role === 'ADMIN') {
        router.push('/admin')
      } else if (role === 'TRANSPORTER') {
        router.push('/transporter/dashboard')
      } else {
        router.push('/client/dashboard')
      }
    }
  }, [session, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) { setError('Invalid email or password.'); return }
    // Session hook will trigger redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#0d1535] flex flex-col items-center justify-center p-4 relative">
      {/* Back Button - Only render if mounted to avoid hydration error */}
      {isMounted && (
        <Link href="/" className="absolute top-6 left-6 z-50 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#3ab54a] hover:bg-[#3ab54a]/90 transition-all duration-300 group shadow-lg">
          <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
        </Link>
      )}

      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(58,181,74,0.15)_0%,transparent_60%)] pointer-events-none" />

      {/* Success Message - Only render if mounted to avoid hydration error */}
      {isMounted && showSuccess && (
        <div className="fixed top-4 left-4 right-4 bg-[#3ab54a] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-base">Account Created Successfully! </p>
            <p className="text-sm text-green-100">Welcome! Please log in with your email and password.</p>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/images/logo-white.png" alt="FleetXchange" width={200} height={60} className="h-16 w-auto mx-auto mb-4" priority />
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl border-t-4 border-[#3ab54a] p-8">
          <h2 className="font-condensed font-bold text-xl text-[#1a2a5e] uppercase tracking-wide mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="field" placeholder="you@company.com"/>
            </div>
            <div>
              <label className="field-label">Password</label>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="field pr-12" 
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 inline-flex items-center justify-center p-2 rounded hover:bg-gray-100 text-[#3ab54a] transition-all"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                      <path d="M15.171 11.586a4 4 0 111.414-1.414l2.829 2.829a1 1 0 11-1.414 1.414l-2.83-2.83z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#3ab54a] hover:bg-[#2d9e3c] text-white font-semibold rounded transition-colors disabled:opacity-60 font-condensed text-base uppercase tracking-wide">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#3ab54a] font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1535]"></div>}>
      <LoginContent />
    </Suspense>
  )
}
