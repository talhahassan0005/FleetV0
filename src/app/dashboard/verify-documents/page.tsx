'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Suspense } from 'react'

interface DocumentUpload {
  type: 'COMPANY_REG' | 'VEHICLE_REG' | 'ID_PROOF' | 'ADDRESS_PROOF'
  file: File | null
  label: string
  required: boolean
}

function VerifyDocumentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: 'COMPANY_REG', file: null, label: 'Company Registration Certificate', required: true },
    { type: 'VEHICLE_REG', file: null, label: 'Vehicle Registration (for Transporters)', required: false },
    { type: 'ID_PROOF', file: null, label: 'Government ID Proof', required: true },
    { type: 'ADDRESS_PROOF', file: null, label: 'Address Proof', required: true },
  ])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleDocumentSelect = (index: number, file: File | null) => {
    const newDocs = [...documents]
    newDocs[index].file = file
    setDocuments(newDocs)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Check if all required documents are selected
      const missingRequired = documents.filter(doc => doc.required && !doc.file)
      if (missingRequired.length > 0) {
        setError(`Please upload all required documents: ${missingRequired.map(d => d.label).join(', ')}`)
        setLoading(false)
        return
      }

      const formData = new FormData()
      
      // Add selected documents
      documents.forEach((doc, idx) => {
        if (doc.file) {
          formData.append(`documents[${idx}]`, doc.file)
          formData.append(`documentTypes[${idx}]`, doc.type)
        }
      })

      const res = await fetch('/api/auth/upload-documents', {
        method: 'POST',
        body: formData,
      })

      setLoading(false)

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to upload documents')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setLoading(false)
      setError('Server error. Please try again.')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1535] to-[#1a2a5e] p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            📋 Account Verification
          </h1>
          <p className="text-gray-300">
            Upload your documents to verify your account. This allows you to post loads and access all features.
          </p>
        </div>

        {/* Success Toast */}
        {success && (
          <div className="mb-6 p-4 bg-[#3ab54a] text-white rounded-lg flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Documents Uploaded Successfully!</p>
              <p className="text-sm text-green-100">Our team will review and verify your account soon. Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Verification Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-[#1a2a5e]">
              <p className="text-xs text-gray-600 uppercase font-semibold">Status</p>
              <p className="text-lg font-bold text-[#1a2a5e] mt-1">⏳ Pending</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <p className="text-xs text-gray-600 uppercase font-semibold">Review Time</p>
              <p className="text-lg font-bold text-yellow-700 mt-1">24-48 hours</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-[#3ab54a]">
              <p className="text-xs text-gray-600 uppercase font-semibold">After Approval</p>
              <p className="text-lg font-bold text-[#3ab54a] mt-1">Full Access</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1a2a5e] mb-4">Required Documents</h3>
              <p className="text-sm text-gray-600 mb-6">All marked with * are mandatory</p>

              <div className="space-y-4">
                {documents.map((doc, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <label className="block font-semibold text-gray-800">
                        {doc.label}
                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {doc.file && (
                        <span className="text-xs text-[#3ab54a] font-semibold bg-green-50 px-3 py-1 rounded">
                          ✓ {doc.file.name}
                        </span>
                      )}
                    </div>
                    
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentSelect(idx, e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#3ab54a] file:text-white hover:file:bg-[#2d9e3c]"
                    />
                    
                    <p className="text-xs text-gray-500 mt-2">
                      📄 PDF, JPG, PNG (Max 10MB each)
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#3ab54a] hover:bg-[#2d9e3c] text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-condensed uppercase tracking-wide"
              >
                {loading ? '📤 Uploading Documents...' : '📤 Submit for Verification'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                Your information is secure and will only be reviewed by our admin team.
              </p>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
            <h4 className="font-bold text-lg mb-3">✅ What Happens After Upload?</h4>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>✓ Our team reviews your documents</li>
              <li>✓ We verify your information</li>
              <li>✓ You receive an email confirmation</li>
              <li>✓ Your account becomes fully verified</li>
            </ul>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
            <h4 className="font-bold text-lg mb-3">⏱️ What Can I Do Now?</h4>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>✓ Browse available loads/freight</li>
              <li>✓ Check freight routes</li>
              <li>✓ View pricing information</li>
              <li>✗ Post loads (after verification)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyDocumentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#1a2a5e] to-[#0d1535]"></div>}>
      <VerifyDocumentsContent />
    </Suspense>
  )
}
