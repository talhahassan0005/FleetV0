'use client'
// src/components/admin/AdminUserActions.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminUserActions({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function verify() {
    setLoading(true)
    await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'verify' }) })
    setLoading(false); router.refresh()
  }
  return (
    <button onClick={verify} disabled={loading}
      className="px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold hover:bg-amber-100 transition-colors">
      {loading ? '…' : 'Verify'}
    </button>
  )
}
