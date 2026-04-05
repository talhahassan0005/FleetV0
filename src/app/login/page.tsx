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
  const [focusedField, setFocusedField] = useState<string | null>(null)

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" suppressHydrationWarning style={{
      backgroundImage: 'url("/loginbackground.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Premium Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/45" />
      
      {/* Animated Accent Glows */}
      {isMounted && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Gold Accent Glow */}
          <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-br from-yellow-500/15 to-transparent rounded-full filter blur-3xl opacity-40" style={{animation: 'float 8s ease-in-out infinite'}} />
          
          {/* Amber Accent Glow */}
          <div className="absolute bottom-40 left-20 w-72 h-72 bg-gradient-to-br from-amber-500/12 to-transparent rounded-full filter blur-3xl opacity-30" style={{animation: 'float 10s ease-in-out infinite 1s'}} />
        </div>
      )}

      {/* Main Glow Effect - Only render if mounted */}
      {isMounted && (
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(58,181,74,0.1)_0%,transparent_60%)] pointer-events-none" style={{animation: 'glowPulse 4s ease-in-out infinite'}} />
      )}

      {/* Back Button - Only render if mounted to avoid hydration error */}
      {isMounted && (
        <Link href="/" className="absolute top-6 left-6 z-50 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#3ab54a] hover:bg-[#2d9e3c] transition-all duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(58,181,74,0.5)] hover:scale-110 active:scale-95" style={{animation: 'bobbing 3s ease-in-out infinite'}}>
          <ArrowLeft className="w-6 h-6 text-white transition-transform duration-300" />
        </Link>
      )}

      {/* Success Message - Only render if mounted to avoid hydration error */}
      {isMounted && showSuccess && (
        <div className="fixed top-4 left-4 right-4 bg-gradient-to-r from-[#3ab54a] to-[#2d9e3c] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-6 h-6 flex-shrink-0 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-base">Account Created Successfully!</p>
            <p className="text-sm text-green-100">Welcome! Please log in with your email and password.</p>
          </div>
        </div>
      )}

      {/* Back Button - Premium Gold */}
      {isMounted && (
        <Link href="/" className="absolute top-6 left-6 z-50 inline-flex items-center justify-center w-11 h-11 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] hover:scale-110 active:scale-95" 
          style={{animation: 'bobbing 3s ease-in-out infinite'}}
        >
          <ArrowLeft className="w-5 h-5 text-gray-900 group-hover:scale-110 transition-transform duration-300" />
        </Link>
      )}

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo with Premium Branding Glow */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3ab54a]/40 to-[#2d9e3c]/30 blur-3xl rounded-full" style={{animation: 'logoGlow 3s ease-in-out infinite'}} />
            <div className="absolute -inset-2 bg-gradient-to-r from-[#3ab54a]/20 to-[#2d9e3c]/10 blur-2xl rounded-full" style={{animation: 'logoPulse 4s ease-in-out infinite'}} />
            <Image src="/images/logo-green.png" alt="FleetXchange - Africa's Largest Freight Hub" width={200} height={60} className="h-16 w-auto mx-auto mb-4 relative z-10" style={{animation: 'logoPulse 2.5s ease-in-out infinite'}} priority />
          </div>
          <p className="text-sm text-[#3ab54a]/80 font-medium tracking-wider animate-in fade-in duration-700" style={{animationDelay: '0.7s'}}>Premium Freight Management</p>
        </div>

        {/* Card with Premium Glassmorphism Styling */}
        <div className="bg-white/12 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/25 border-t-2 border-t-yellow-300/40 p-8 transition-all duration-300 relative" style={{animation: 'cardGlow 3s ease-in-out infinite', boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.2), 0 0 40px rgba(251,191,36,0.15)'}}>
          {/* Premium animated border glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/25 via-amber-400/15 to-yellow-400/20 rounded-3xl -z-10" style={{animation: 'borderGlow 3s ease-in-out infinite'}} />
          <h2 className="font-condensed font-bold text-4xl bg-gradient-to-r from-white via-white to-yellow-200 bg-clip-text text-transparent uppercase tracking-wider mb-3 animate-in fade-in duration-500 relative" style={{animationDelay: '0.1s'}}>
            Sign In
          </h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-yellow-300 to-transparent mx-auto mb-6 animate-in scale-x-0 duration-500" style={{animationDelay: '0.12s', animation: 'scaleIn 0.5s ease-out 0.12s forwards'}} />
          <p className="text-center text-sm text-white/80 mb-8 animate-in fade-in duration-500 font-light" style={{animationDelay: '0.15s'}}>Welcome back to FleetXchange</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-lg text-red-700 text-sm animate-in shake duration-500 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="animate-in fade-in duration-500" style={{animationDelay: '0.2s'}}>
              <label className="block text-sm font-semibold text-white mb-2 transition-all duration-200" style={{animation: 'labelGlow 2s ease-in-out infinite', animationDelay: '0.3s'}}>Email address</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3ab54a]/0 via-[#3ab54a]/10 to-[#3ab54a]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm" />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="relative w-full px-4 py-3 rounded-lg border-2 border-white/20 hover:border-yellow-300/60 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40 transition-all duration-300 placeholder:text-white/40 bg-white/10 backdrop-blur-sm text-white font-medium" 
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="animate-in fade-in duration-500" style={{animationDelay: '0.3s'}}>
              <label className="block text-sm font-semibold text-white mb-2 transition-all duration-200" style={{animation: 'labelGlow 2s ease-in-out infinite', animationDelay: '0.4s'}}>Password</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3ab54a]/0 via-[#3ab54a]/10 to-[#3ab54a]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="relative w-full px-4 py-3 pr-12 rounded-lg border-2 border-white/20 hover:border-yellow-300/60 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40 transition-all duration-300 placeholder:text-white/40 bg-white/10 backdrop-blur-sm text-white font-medium" 
                  placeholder="••••••••"
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-2 rounded-lg text-[#3ab54a] hover:text-[#2d9e3c] hover:bg-[#3ab54a]/10 transition-all duration-200 active:scale-90"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                      <path d="M15.171 11.586a4 4 0 111.414-1.414l2.829 2.829a1 1 0 11-1.414 1.414l-2.83-2.83z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Premium Sign In Button with Dynamic Glow Animation */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-500 hover:via-amber-500 hover:to-yellow-600 text-gray-900 font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-condensed text-base uppercase tracking-widest shadow-xl hover:shadow-2xl active:scale-95 disabled:scale-100 animate-in fade-in duration-500 relative overflow-hidden border border-white/30" style={{animationDelay: '0.4s', animation: 'buttonGlow 2s ease-in-out infinite', boxShadow: '0 10px 30px rgba(251,191,36,0.5), 0 0 20px rgba(251,191,36,0.3)'}}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </div>
            </button>
          </form>

          {/* Professional Sign in Link */}
          <p className="mt-8 text-center text-sm text-white/80 animate-in fade-in duration-500" style={{animationDelay: '0.5s'}}>
            Don't have an account?{' '}
            <Link href="/register" className="text-yellow-300 font-bold hover:text-white transition-all duration-200">
              Create one
            </Link>
          </p>
        </div>

        {/* Professional Footer Branding */}
        <div className="text-center mt-10 animate-in fade-in duration-500" style={{animationDelay: '0.6s'}}>
          <p className="text-xs text-white/40 flex items-center justify-center gap-1 font-medium">
            <span className="w-1 h-1 rounded-full bg-[#3ab54a]/60"></span>
            Enterprise Freight Management Platform
            <span className="w-1 h-1 rounded-full bg-[#3ab54a]/60"></span>
          </p>
          <p className="text-xs text-white/30 mt-2">Secure login powered by NextAuth</p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        @keyframes gridShift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.8; filter: blur(40px); }
          50% { opacity: 1; filter: blur(60px); }
        }

        @keyframes logoGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.08) rotate(2deg); opacity: 0.9; }
        }

        @keyframes bobbing {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.15), 0 0 40px rgba(251,191,36,0.15); }
          50% { box-shadow: 0 40px 80px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15), 0 0 60px rgba(251,191,36,0.25); }
        }

        @keyframes borderGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        @keyframes shimmerText {
          0%, 100% { text-shadow: 0 0 0 transparent; }
          50% { text-shadow: 0 0 10px rgba(58,181,74,0.3); }
        }

        @keyframes shimmerShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes labelGlow {
          0%, 100% { color: white; text-shadow: none; }
          50% { color: #fef08a; text-shadow: 0 0 8px rgba(251,191,36,0.4); }
        }

        @keyframes scaleIn {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes buttonGlow {
          0%, 100% { box-shadow: 0 8px 20px rgba(251,191,36,0.4), 0 0 0 0px rgba(251,191,36,0.3); }
          50% { box-shadow: 0 12px 30px rgba(251,191,36,0.6), 0 0 25px 5px rgba(251,191,36,0.4); }
        }
      `}</style>
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
