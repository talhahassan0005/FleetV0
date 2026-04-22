'use client'
// src/components/shared/VerificationBanner.tsx
import { useSession } from 'next-auth/react'

export function VerificationBanner() {
  const { data: session } = useSession()

  if (['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role ?? '')) return null

  const verificationStatus = (session?.user as any)?.verificationStatus
  if (!verificationStatus) return null

  if (verificationStatus === 'APPROVED') {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-700 mb-6">
        ✓ <span className="font-semibold">Account Verified</span> - Your account has been verified and you have full access to all features.
      </div>
    )
  }

  if (verificationStatus === 'PENDING') {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700 mb-6">
        ⏳ <span className="font-semibold">Pending Verification</span> - Your account documents are being reviewed by our admin team. This typically takes 24-48 hours.
      </div>
    )
  }

  if (verificationStatus === 'REJECTED') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-6">
        ✗ <span className="font-semibold">Verification Failed</span> - Your documents were rejected. Please upload new documents or contact support.
      </div>
    )
  }

  return null
}
