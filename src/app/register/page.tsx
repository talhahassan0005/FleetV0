'use client'
// src/app/register/page.tsx
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  
  const [role, setRole]               = useState<'CLIENT' | 'TRANSPORTER'>('CLIENT')
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone]             = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const formData = new FormData()
      formData.append('role', role)
      formData.append('companyName', companyName)
      formData.append('contactName', contactName)
      formData.append('phone', phone)
      formData.append('email', email)
      formData.append('password', password)

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      })
      setLoading(false)
      if (!res.ok) { 
        const d = await res.json(); 
        setError(d.error?.toString() ?? 'Registration failed.'); 
        return 
      }
      
      // Show success toast
      setSuccess(true)
      setTimeout(() => {
        router.push('/login?registered=1')
      }, 2000)
    } catch (err) {
      setLoading(false)
      setError('Server error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1535] flex flex-col items-center justify-center p-4">
      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#3ab54a]/20 hover:bg-[#3ab54a]/40 transition-all duration-300 group">
        <ArrowLeft className="w-5 h-5 text-[#3ab54a] group-hover:scale-110 transition-transform duration-300" />
      </Link>

      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(58,181,74,0.12)_0%,transparent_60%)] pointer-events-none" />

      {/* Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 bg-[#3ab54a] text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-pulse">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">Account Created Successfully!</p>
            <p className="text-sm text-green-100">Redirecting to login...</p>
          </div>
        </div>
      )}

      
        <div className="text-center mb-8">
          <div className="text-center mb-8">
                    <Image src="/images/logo-white.png" alt="FleetXchange" width={200} height={60} className="h-16 w-auto mx-auto mb-4" priority />
                  </div>
          
        

        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl border-t-4 border-[#3ab54a] p-8">
          <h2 className="font-condensed font-bold text-2xl text-[#1a2a5e] uppercase tracking-wide mb-2">
            Create Your Account
          </h2>
          <p className="text-sm text-gray-600 mb-6">Join Africa's largest freight network and start moving cargo today.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Role Picker */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-700 mb-3">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {(['CLIENT', 'TRANSPORTER'] as const).map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`p-4 rounded border-2 text-center transition-all ${role === r ? 'border-[#3ab54a] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-3xl mb-2">{r === 'CLIENT' ? '🏭' : '🚛'}</div>
                  <div className="font-semibold text-sm text-[#1a2a5e]">{r === 'CLIENT' ? 'Client / Shipper' : 'Transporter'}</div>
                  <div className="text-xs text-gray-500">{r === 'CLIENT' ? 'I need to move cargo' : 'I have trucks available'}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Company Name *</label>
                <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} 
                  className="field" placeholder="Your company name"/>
              </div>
              <div>
                <label className="field-label">Contact Person</label>
                <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} 
                  className="field" placeholder="Full name"/>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Email Address *</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                  className="field" placeholder="you@company.com"/>
              </div>
              <div>
                <label className="field-label">Phone / WhatsApp</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} 
                  className="field" placeholder="+27..."/>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="field-label">Password (minimum 6 characters) *</label>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  minLength={6} 
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



            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#3ab54a] hover:bg-[#2d9e3c] text-white font-semibold rounded transition-colors disabled:opacity-60 font-condensed text-base uppercase tracking-wide mt-6">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#3ab54a] font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
