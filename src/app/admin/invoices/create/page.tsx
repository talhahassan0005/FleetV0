'use client'
import { useAuth } from '@/hooks/useAuth'
// src/app/admin/invoices/create/page.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Topbar, PageLayout, showToast } from '@/components/ui'
import { Plus, AlertCircle } from 'lucide-react'

interface ApprovedPOD {
  _id: string
  loadId: string
  userId: string  // ✅ ADD: Transporter's user ID
  filename: string
  fileUrl: string
  uploadedAt: string
  uploadedBy: string
  approved: boolean
  loadRef: string
  origin: string
  destination: string
  cargoType: string
  weight: number
  currency: string
  transporterAmount: number
}

export default function CreateInvoicePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [pods, setPods] = useState<ApprovedPOD[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [selectedPodId, setSelectedPodId] = useState('')
  const [podSearchTerm, setPodSearchTerm] = useState('')
  const [showPodDropdown, setShowPodDropdown] = useState(false)
  const [tonnageForThisInvoice, setTonnageForThisInvoice] = useState('')
  const [transporterInvoiceNumber, setTransporterInvoiceNumber] = useState('')
  const [transporterAmount, setTransporterAmount] = useState('')
  const [markupPercentage, setMarkupPercentage] = useState('10')
  const [selectedCurrency, setSelectedCurrency] = useState('ZAR')
  const [notes, setNotes] = useState('')

  // Calculated fields
  const [clientAmount, setClientAmount] = useState(0)
  const [markupAmount, setMarkupAmount] = useState(0)

  useEffect(() => {
    if (user && !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER','ADMIN'].includes(user?.role)) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchApprovedPODs()
    }
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.pod-search-container')) {
        setShowPodDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate markup when amount or percentage changes
  useEffect(() => {
    if (transporterAmount) {
      const amount = parseFloat(transporterAmount)
      const markup = amount * (parseFloat(markupPercentage) / 100)
      setMarkupAmount(markup)
      setClientAmount(amount + markup)
    }
  }, [transporterAmount, markupPercentage])

  const fetchApprovedPODs = async () => {
    try {
      setLoading(true)
      console.log('[CreateInvoice] Fetching PODs ready for invoice creation...')
      
      // Use the correct endpoint for PODs ready for invoice creation
      const res = await fetch('/api/admin/pods/for-invoice-creation')
      if (!res.ok) {
        console.error('[CreateInvoice] Failed to fetch PODs, status:', res.status)
        const errorData = await res.json()
        setError(`Failed to load PODs: ${errorData.error || 'Unknown error'}`)
        setPods([])
        return
      }

      const data = await res.json()
      console.log('[CreateInvoice] Got PODs ready for invoicing:', data.data?.length || 0)
      console.log('[CreateInvoice] PODs data:', data.data)
      
      // Map the data to match our interface
      const mappedPods = (data.data || []).map((pod: any) => ({
        _id: pod._id,
        loadId: pod.loadId,
        userId: pod.transporterId, // Map transporterId to userId
        filename: pod.podFileName,
        fileUrl: pod.podUrl,
        uploadedAt: new Date().toISOString(), // Placeholder
        uploadedBy: 'TRANSPORTER',
        approved: true,
        loadRef: pod.loadRef,
        origin: pod.origin,
        destination: pod.destination,
        cargoType: 'General', // Placeholder
        weight: 0, // Placeholder
        currency: pod.currency,
        transporterAmount: pod.amount || 0
      }))
      
      console.log('[CreateInvoice] Mapped PODs:', mappedPods.length)
      setPods(mappedPods)
      setError('')
    } catch (err) {
      console.error('[CreateInvoice] Error:', err)
      setError(`Failed to load PODs: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setPods([])
    } finally {
      setLoading(false)
    }
  }

  // Filter PODs based on search term
  const filteredPods = pods.filter(pod => {
    const searchLower = podSearchTerm.toLowerCase()
    return (
      pod.loadRef.toLowerCase().includes(searchLower) ||
      pod.origin.toLowerCase().includes(searchLower) ||
      pod.destination.toLowerCase().includes(searchLower) ||
      pod.filename.toLowerCase().includes(searchLower)
    )
  })

  const handlePodSelect = (podId: string) => {
    setSelectedPodId(podId)
    setPodSearchTerm('')
    setShowPodDropdown(false)
    const pod = pods.find(p => p._id === podId)
    if (pod) {
      setTransporterAmount(pod.transporterAmount.toString())
      setSelectedCurrency(pod.currency || 'ZAR')
      // Auto-fill transporter invoice number from POD filename
      setTransporterInvoiceNumber(pod.filename || `INV-${pod.loadRef}`)
    }
  }

  const getSelectedPodDisplay = () => {
    const pod = pods.find(p => p._id === selectedPodId)
    if (pod) {
      return `${pod.loadRef} - ${pod.origin} → ${pod.destination}`
    }
    return '-- Choose a POD --'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!selectedPodId || !tonnageForThisInvoice || !transporterInvoiceNumber || !transporterAmount) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch('/api/invoices/create-with-pods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadId: pods.find(p => p._id === selectedPodId)?.loadId,
          podId: selectedPodId,
          transporterId: pods.find(p => p._id === selectedPodId)?.userId,
          tonnageForThisInvoice: parseFloat(tonnageForThisInvoice),
          transporterInvoiceNumber,
          transporterAmount: parseFloat(transporterAmount),
          markupPercentage: parseFloat(markupPercentage),
          currency: selectedCurrency,
          notes,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create invoices')
      }

      const data = await res.json()
      showToast('Invoices created successfully!')

      // Reset form
      setTimeout(() => {
        setSelectedPodId('')
        setTonnageForThisInvoice('')
        setTransporterInvoiceNumber('')
        setTransporterAmount('')
        setMarkupPercentage('10')
        setNotes('')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to create invoices')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Topbar title="Create Invoices" />
      <PageLayout>
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800 flex gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}



          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Client Invoice from Approved POD
            </h2>
            <p className="text-sm text-blue-800">
              Select an approved POD and enter invoice details. Client invoice will be generated with markup and sent to client.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            
            {/* POD Selection - Searchable Dropdown */}
            <div className="pod-search-container relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Approved POD *
              </label>
              <div className="relative">
                {/* Input field */}
                <input
                  type="text"
                  placeholder="Search by Load Ref, Route, or Filename..."
                  value={podSearchTerm}
                  onChange={(e) => {
                    setPodSearchTerm(e.target.value)
                    setShowPodDropdown(true)
                  }}
                  onFocus={() => setShowPodDropdown(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black bg-white"
                />
                
                {/* Dropdown list */}
                {showPodDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {filteredPods.length > 0 ? (
                      filteredPods.map(pod => (
                        <button
                          key={pod._id}
                          type="button"
                          onClick={() => handlePodSelect(pod._id)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-semibold text-gray-900">{pod.loadRef}</div>
                          <div className="text-sm text-gray-600">{pod.origin} → {pod.destination}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {pod.currency} {pod.transporterAmount.toLocaleString()} • {pod.filename}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        {podSearchTerm ? 'No PODs found matching your search' : 'No PODs available'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Selected POD display */}
              {selectedPodId && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900">✓ Selected: {getSelectedPodDisplay()}</p>
                </div>
              )}
              
              {pods.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ No PODs available. Transporter must upload POD first.
                </p>
              )}
            </div>

            {/* Tonnage */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tonnage for This Invoice *
              </label>
              <input
                type="number"
                step="0.01"
                value={tonnageForThisInvoice}
                onChange={(e) => setTonnageForThisInvoice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black"
                placeholder="e.g., 3000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the tonnage delivered in this invoice</p>
            </div>

            {/* Transporter Invoice Number - Auto-filled, read-only */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transporter Invoice Number
              </label>
              <input
                type="text"
                value={transporterInvoiceNumber}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="Auto-filled from transporter's uploaded invoice"
              />
              <p className="text-xs text-gray-500 mt-1">📄 Auto-filled from transporter's uploaded invoice document</p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Currency *
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black bg-white"
              >
                {['ZAR','USD','BWP','ZMW','ZWL','MZN','NAD','TZS','KES','UGX'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Transporter Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount We Pay Transporter *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 font-semibold">
                  {selectedCurrency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={transporterAmount}
                  onChange={(e) => setTransporterAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-lg font-semibold text-black"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Markup Percentage */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Markup Percentage
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={markupPercentage}
                  onChange={(e) => setMarkupPercentage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black"
                />
                <span className="px-4 py-2 bg-gray-100 rounded-lg font-semibold text-gray-700">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Commission/profit margin</p>
            </div>

            {/* Calculation Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">Invoice Preview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transporter Invoice Amount:</span>
                  <span className="font-semibold">
                    {transporterAmount ? `${selectedCurrency} ${parseFloat(transporterAmount).toFixed(2)}` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Markup ({markupPercentage}%):</span>
                  <span className="font-semibold">
                    {markupAmount ? `${markupAmount.toFixed(2)}` : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-600">Client Invoice Amount (to collect):</span>
                  <span className="font-bold text-lg text-green-600">
                    {clientAmount ? `${selectedCurrency} ${clientAmount.toFixed(2)}` : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-600">Your Commission:</span>
                  <span className="font-semibold text-[#3ab54a]">
                    {markupAmount ? markupAmount.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 resize-none text-black"
                placeholder="e.g., 'Partial delivery - remaining 5000 tons next week'"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || !selectedPodId}
                className="flex-1 px-6 py-3 bg-[#3ab54a] text-white rounded-lg font-bold hover:bg-[#2d9e3c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Creating Invoice...' : 'Create Client Invoice'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </PageLayout>
    </>
  )
}
