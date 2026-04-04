'use client'
// src/app/register/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole]               = useState<'CLIENT' | 'TRANSPORTER'>('CLIENT')
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone]             = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, companyName, contactName, phone, email, password }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Registration failed.'); return }
    router.push('/login?registered=1')
  }

  return (
    <div className="min-h-screen bg-[#0d1535] flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(58,181,74,0.12)_0%,transparent_60%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-lg">

        <div className="text-center mb-6">
          <span className="font-condensed font-bold text-2xl text-white tracking-wide">
            FLEET<span className="text-[#3ab54a]">X</span>CHANGE
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-2xl border-t-4 border-[#3ab54a] p-8">
          <h2 className="font-condensed font-bold text-xl text-[#1a2a5e] uppercase tracking-wide mb-1">Create Account</h2>
          <p className="text-xs text-gray-400 mb-5">FleetXchange will verify your account before you can post loads.</p>

          {error && <div className="mb-4 p-3 bg-red-50 border-l-4 border-l-red-500 rounded text-red-700 text-sm">{error}</div>}

          {/* Role Picker */}
          <div className="mb-5">
            <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-500 mb-2">I am a...</div>
            <div className="grid grid-cols-2 gap-3">
              {(['CLIENT', 'TRANSPORTER'] as const).map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`p-3 rounded border-2 text-center transition-all ${role === r ? 'border-[#3ab54a] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-2xl mb-1">{r === 'CLIENT' ? '🏭' : '🚛'}</div>
                  <div className="font-semibold text-xs text-[#1a2a5e]">{r === 'CLIENT' ? 'Client / Shipper' : 'Transporter'}</div>
                  <div className="text-[10px] text-gray-400">{r === 'CLIENT' ? 'I need to move cargo' : 'I have trucks available'}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="field-label">Company Name</label>
                <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="field"/>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="field-label">Contact Person</label>
                <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="field"/>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="field-label">Phone / WhatsApp</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="field" placeholder="+27..."/>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="field-label">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="field"/>
              </div>
              <div className="col-span-2">
                <label className="field-label">Password (min 6 characters)</label>
                <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="field"/>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#3ab54a] hover:bg-[#2d9e3c] text-white font-semibold rounded transition-colors disabled:opacity-60 font-condensed text-base uppercase tracking-wide">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-[#3ab54a] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
