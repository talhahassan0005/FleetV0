'use client'
// src/app/login/page.tsx
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) { setError('Invalid email or password.'); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0d1535] flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(58,181,74,0.15)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="6" fill="#1a2a5e"/>
              <path d="M10 10 L20 20 L10 30" stroke="#3ab54a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M30 10 L20 20 L30 30" stroke="#3ab54a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="14" y1="4" x2="28" y2="36" stroke="#2d9e3c" strokeWidth="3.5" strokeLinecap="round" opacity={0.7}/>
            </svg>
            <span className="font-condensed font-bold text-3xl text-white tracking-wide">
              FLEET<span className="text-[#3ab54a]">X</span>CHANGE
            </span>
          </div>
          <div className="inline-block bg-gray-600 text-white text-[9px] font-semibold uppercase tracking-[2px] px-3 py-1 rounded-sm">
            Africa's Largest Freight Hub
          </div>
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
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="field" placeholder="••••••••"/>
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
