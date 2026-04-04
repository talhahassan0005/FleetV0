'use client'
// src/app/transporter/documents/page.tsx
import { useEffect, useState, useCallback } from 'react'
import { Topbar, PageLayout, DocumentsTableSkeleton } from '@/components/ui'
import { useRef } from 'react'

export default function TransporterDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState('REGISTRATION')
  const [selectedDoc, setSelectedDoc] = useState<any>(null)

  const docTypes = [
    { value: 'COMPANY', label: 'Company Registration' },
    { value: 'REGISTRATION', label: 'Vehicle Registration' },
    { value: 'CUSTOMS', label: 'Customs Clearance' },
    { value: 'INVOICE', label: 'Invoice/Receipt' },
    { value: 'OTHER', label: 'Other' },
  ]

  const fetchDocuments = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetching || loading) {
      console.log('[TransporterDocuments] Fetch already in progress, skipping...')
      return
    }

    try {
      setIsFetching(true)
      setLoading(true)
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(data.data || [])
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [isFetching, loading])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = async (file: File) => {
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('docType', selectedType)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      await fetchDocuments()
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Upload error:', err)
      alert('Failed to upload document')
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
            {uploading && <p className="text-xs text-[#3ab54a] mt-2">Uploading...</p>}
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
                  <p className="text-xs text-gray-500 mb-2">DOCUMENT DETAILS</p>
                  <div className="text-sm space-y-1">
                    <p><span className="font-semibold">Type:</span> {selectedDoc.docType}</p>
                    <p><span className="font-semibold">Uploaded:</span> {new Date(selectedDoc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <a
                    href={selectedDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 px-3 py-1.5 rounded text-xs font-semibold bg-[#3ab54a] text-white hover:bg-green-600"
                  >
                    📥 View Document
                  </a>
                </div>

                {/* Reviews from Client/Admin */}
                {selectedDoc.reviews && selectedDoc.reviews.length > 0 ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">FEEDBACK ({selectedDoc.reviews.length})</p>
                    <div className="space-y-3">
                      {selectedDoc.reviews.map((review: any, idx: number) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded text-sm">
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
                          <p className="text-gray-700">{review.comment}</p>
                          <p className="text-xs text-gray-400 mt-2">{new Date(review.timestamp).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-4 rounded text-sm text-blue-700">
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
