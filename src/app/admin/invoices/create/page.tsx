'use client'
// src/app/admin/invoices/create/page.tsx

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Topbar, PageLayout } from '@/components/ui'
import { Plus, AlertCircle, CheckCircle } from 'lucide-react'

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
  const { data: session } = useSession()
  const router = useRouter()
  const [pods, setPods] = useState<ApprovedPOD[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form fields
  const [selectedPodId, setSelectedPodId] = useState('')
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
    if (session && session.user.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [session, router])

  useEffect(() => {
    if (session?.user) {
      fetchApprovedPODs()
    }
  }, [session])

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

  const handlePodSelect = (podId: string) => {
    setSelectedPodId(podId)
    const pod = pods.find(p => p._id === podId)
    if (pod) {
      setTransporterAmount(pod.transporterAmount.toString())
      setSelectedCurrency(pod.currency || 'ZAR')
    }
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
      setSuccess(`✅ Invoices created successfully!`)

      // Reset form
      setTimeout(() => {
        setSelectedPodId('')
        setTonnageForThisInvoice('')
        setTransporterInvoiceNumber('')
        setTransporterAmount('')
        setMarkupPercentage('10')
        setNotes('')
        setSuccess('')
      }, 2000)
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

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 flex gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{success}</div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Invoice from Approved POD
            </h2>
            <p className="text-sm text-blue-800">
              Select an approved POD and enter invoice details. Two invoices will be generated:
            </p>
            <ul className="text-sm text-blue-800 list-disc list-inside mt-2 space-y-1">
              <li><strong>Transporter Invoice:</strong> Amount you pay the transporter</li>
              <li><strong>Client Invoice:</strong> Amount with markup for the client</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            
            {/* POD Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Approved POD *
              </label>
              <select
                value={selectedPodId}
                onChange={(e) => handlePodSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black bg-white"
                required
              >
                <option value="" className="text-gray-900">-- Choose a POD --</option>
                {pods.map(pod => (
                  <option key={pod._id} value={pod._id} className="text-gray-900">
                    {pod.loadRef} - {pod.origin} → {pod.destination} - {pod.currency} {pod.transporterAmount.toLocaleString()}
                  </option>
                ))}
              </select>
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

            {/* Transporter Invoice Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transporter Invoice Number *
              </label>
              <input
                type="text"
                value={transporterInvoiceNumber}
                onChange={(e) => setTransporterInvoiceNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ab54a]/50 text-black"
                placeholder="e.g., INV-2026-0001"
                required
              />
              <p className="text-xs text-gray-500 mt-1">From transporter's QuickBooks</p>
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
                {submitting ? 'Creating Invoices...' : 'Create Both Invoices'}
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
