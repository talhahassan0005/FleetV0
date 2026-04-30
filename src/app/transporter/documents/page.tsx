'use client'
import { openDocument } from '@/lib/document-url'
// src/app/transporter/documents/page.tsx
import { useEffect, useState, useCallback } from 'react'
import { Topbar, PageLayout, DocumentsTableSkeleton } from '@/components/ui'
import { useRef } from 'react'

export default function TransporterDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState('REGISTRATION')
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [uploadError, setUploadError] = useState<string>('')

  const docTypes = [
    { value: 'COMPANY', label: 'Company Registration' },
    { value: 'BANK_CONFIRMATION', label: 'Bank Confirmation' },
    { value: 'AUTHORIZATION', label: 'Letter Authorizing Company to Work with Fleetxchange' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'TAX_CLEARANCE', label: 'Tax Clearance' },
    { value: 'VEHICLE_LIST', label: 'Vehicle List' },
    { value: 'OTHER', label: 'Other' },
  ]

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      console.log('[TransporterDocuments] Starting fetch...')
      
      const res = await fetch('/api/documents')
      console.log('[TransporterDocuments] Got response:', res.status, res.ok)
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }
      
      const data = await res.json()
      console.log('[TransporterDocuments] Received data:', data)
      
      const docs = data.data || []
      console.log('[TransporterDocuments] Setting documents:', docs.length, 'docs')
      
      setDocuments(docs)
      
      console.log('[TransporterDocuments] ✅ Fetch complete')
    } catch (err) {
      console.error('[TransporterDocuments] Fetch error:', err)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('[TransporterDocuments] Component mounted, fetching documents...')
    fetchDocuments()
  }, [])

  const handleUpload = async (file: File) => {
    if (!file) return
    setUploadError('')

    // Client-side 10MB size validation
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setUploadError(`File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed size is 10MB. Please compress your file and try again.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('docType', selectedType)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        let errMsg = 'Upload failed'
        try {
          const errData = await res.json()
          errMsg = errData.error || errMsg
        } catch {}
        if (res.status === 413) {
          errMsg = 'File too large. Maximum allowed size is 10MB.'
        }
        setUploadError(errMsg)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      const newDoc = await res.json()
      // Optimistic update: add doc to list immediately so UI doesn't lag
      const optimisticDoc = {
        _id: newDoc._id,
        originalName: file.name,
        docType: selectedType,
        uploadedByRole: 'TRANSPORTER',
        createdAt: new Date().toISOString(),
        verificationStatus: 'PENDING',
        reviews: [],
        fileUrl: '',
      }
      setDocuments(prev => [optimisticDoc, ...prev])
      if (fileInputRef.current) fileInputRef.current.value = ''
      // Refresh in background to get full doc data
      fetchDocuments()
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError('Upload failed. Please try again.')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  const ownDocuments = documents.filter(d => d.uploadedByRole === 'TRANSPORTER')

  return (
    <>
      <Topbar title="My Documents" />
      <PageLayout>
        {/* Upload Section */}
        <div className="card mb-6 border-2 border-[#3ab54a]">
          <div className="bg-green-50 px-6 py-3 border-b border-green-100">
            <h3 className="font-condensed font-bold text-sm text-[#1a2a5e] uppercase tracking-wide">Upload Document</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-700 mb-2">Document Type *</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-[#3ab54a]"
                >
                  {docTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-700 mb-2">Select File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file)
                  }}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
            {uploading && <p className="text-xs text-[#3ab54a] mt-2">⏳ Uploading...</p>}
            {uploadError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-semibold">
                ❌ {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* Documents List */}
        <div className="card">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">My Documents</h3>
          </div>

          {loading ? (
            <DocumentsTableSkeleton />
          ) : ownDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No documents uploaded yet</div>
          ) : (
            <div className="space-y-3">
              {ownDocuments.map((doc) => (
                <div
                  key={doc._id}
                  className="p-4 border border-gray-200 rounded hover:border-[#3ab54a] transition-colors cursor-pointer"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1a2a5e] mb-1">📄 {doc.originalName}</p>
                      <p className="text-xs text-gray-500">Type: {doc.docType} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                      {doc.reviews && doc.reviews.length > 0 && (
                        <p className="text-xs text-[#3ab54a] mt-1">
                          ✓ {doc.reviews.length} feedback(s)
                          {doc.reviews.some((r: any) => r.status === 'APPROVED') && ' • Approved'}
                          {doc.reviews.some((r: any) => r.status === 'REJECTED') && ' • Needs Revision'}
                        </p>
                      )}
                    </div>
                    <button className="px-3 py-1.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Review Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">{selectedDoc.originalName}</h3>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Document Info */}
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-700 font-semibold mb-2">DOCUMENT DETAILS</p>
                  <div className="text-sm space-y-1 text-gray-900">
                    <p><span className="font-semibold text-gray-900">Type:</span> {selectedDoc.docType}</p>
                    <p><span className="font-semibold text-gray-900">Uploaded:</span> {new Date(selectedDoc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <a
                    href={`/api/documents/${selectedDoc._id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2a5e] text-white rounded-lg hover:bg-[#152247] transition-colors text-sm font-semibold mt-3"
                    onClick={(e) => {
                      e.preventDefault()
                      openDocument(selectedDoc.fileUrl, selectedDoc.originalName)
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    View Document
                  </a>
                </div>

                {/* Reviews from Client/Admin */}
                {selectedDoc.reviews && selectedDoc.reviews.length > 0 ? (
                  <div>
                    <p className="text-xs text-gray-700 font-semibold mb-3 uppercase">FEEDBACK ({selectedDoc.reviews.length})</p>
                    <div className="space-y-3">
                      {selectedDoc.reviews.map((review: any, idx: number) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded text-sm bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-[#1a2a5e]">{review.reviewerRole}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              review.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              review.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {review.status}
                            </span>
                          </div>
                          <p className="text-gray-900">{review.comment}</p>
                          <p className="text-xs text-gray-500 mt-2">{new Date(review.timestamp).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-4 rounded text-sm text-blue-900">
                    No feedback yet. Awaiting review from admin and client.
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="w-full px-4 py-2 rounded text-sm font-semibold border border-gray-300 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  )
}