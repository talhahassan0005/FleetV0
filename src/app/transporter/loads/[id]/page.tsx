// src/app/transporter/loads/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout } from '@/components/ui'
import { MessageCircle } from 'lucide-react'

interface Load {
  _id: string
  ref: string
  origin: string
  destination: string
  cargoType: string
  weight: number
  description: string
  finalPrice: number
  commission?: number
  currency: string
  status: string
  createdAt: string
  clientId: string
}

export default function TransporterLoadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [load, setLoad] = useState<Load | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quotedPrice, setQuotedPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)
  const [startingChat, setStartingChat] = useState(false)

  const handleStartChat = async () => {
    if (!load) return
    try {
      setStartingChat(true)
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loadId: load._id }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Failed to start chat: ${error.message || error.error}`)
        return
      }

      const data = await res.json()
      router.push('/transporter/chat')
    } catch (err) {
      console.error('Error starting chat:', err)
      alert('Failed to start chat')
    } finally {
      setStartingChat(false)
    }
  }

  useEffect(() => {
    const fetchLoad = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/loads/${params.id}`)

        if (!res.ok) {
          const err = await res.json()
          setError(err.error || 'Failed to load details')
          return
        }

        const data = await res.json()
        setLoad(data)
      } catch (err) {
        console.error('Error fetching load:', err)
        setError('Error loading load details')
      } finally {
        setLoading(false)
      }
    }

    fetchLoad()
  }, [params.id])

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quotedPrice || !load) {
      alert('Please enter a quote price')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadId: load._id,
          price: parseFloat(quotedPrice),
          notes: notes || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to submit quote')
        return
      }

      setQuoteSubmitted(true)
      setTimeout(() => {
        router.push('/transporter/quotes')
      }, 2000)
    } catch (err) {
      console.error('Error submitting quote:', err)
      alert('Error submitting quote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ab54a]"></div>
        <p className="text-gray-600 mt-4">Loading load details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mb-4"
        >
          ← Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!load) {
    return (
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mb-4"
        >
          ← Back
        </button>
        <div className="text-gray-600">Load not found</div>
      </div>
    )
  }

  if (quoteSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#1a2a5e] mb-2">Quote Submitted!</h2>
          <p className="text-gray-600 mb-6">Your quote has been sent to the client.</p>
          <p className="text-sm text-gray-500">You will be redirected to your quotes...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Topbar title="Load Quotation" />
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              ← Back to Available Loads
            </button>

            {/* Chat Button - Show for accepted loads */}
            {load && ['APPROVED', 'IN_TRANSIT', 'DELIVERED'].includes(load.status) && (
              <button
                onClick={handleStartChat}
                disabled={startingChat}
                className="flex items-center gap-2 px-4 py-2 bg-[#3ab54a] text-white font-semibold rounded hover:bg-[#2d9e3c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {startingChat ? 'Starting...' : 'Chat with Client'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Load Details */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a2a5e] to-[#2d4a90] p-6">
                  <h1 className="text-3xl font-bold text-white mb-2">{load.ref || 'Load'}</h1>
                  <p className="text-blue-100">{load.cargoType} • {load.weight} tons</p>
                </div>

                {/* Route */}
                <div className="p-6 bg-blue-50 border-b">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">FROM</p>
                      <p className="text-lg font-bold text-[#1a2a5e]">{load.origin}</p>
                    </div>
                    <div className="text-2xl text-[#3ab54a]">→</div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">TO</p>
                      <p className="text-lg font-bold text-[#1a2a5e]">{load.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 grid grid-cols-2 gap-6 border-b">
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-2">CARGO TYPE</p>
                    <p className="text-lg font-semibold text-[#1a2a5e]">{load.cargoType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-2">WEIGHT</p>
                    <p className="text-lg font-semibold text-[#1a2a5e]">{load.weight} tons</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-2">POSTED PRICE</p>
                    <p className="text-lg font-semibold text-[#3ab54a]">
                      {load.currency} {load.finalPrice?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-2">POSTED DATE</p>
                    <p className="text-lg font-semibold text-[#1a2a5e]">
                      {new Date(load.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Pricing Breakdown - Show if Commission exists */}
                {load.commission !== undefined && load.commission > 0 && (
                  <div className="p-6 bg-blue-50 border-b">
                    <h3 className="text-sm font-semibold text-[#1a2a5e] mb-4">PRICING BREAKDOWN</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Base Price</span>
                        <span className="font-semibold text-[#1a2a5e]">
                          {load.currency} {load.finalPrice?.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#3ab54a]">
                        <span>+ Commission (added by Admin)</span>
                        <span className="font-semibold">
                          +{load.currency} {load.commission?.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="font-bold text-[#1a2a5e]">Total Load Value</span>
                        <span className="font-bold text-lg text-[#3ab54a]">
                          {load.currency} {((load.finalPrice || 0) + (load.commission || 0)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="p-6">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">DESCRIPTION / SPECIAL INSTRUCTIONS</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded border">
                    {load.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Quote Form */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-[#1a2a5e] mb-6">Submit Your Quote</h2>

                <form onSubmit={handleSubmitQuote} className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-700 font-semibold mb-2">
                      MY QUOTE PRICE ({load.currency}) *
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-gray-100 text-gray-700 font-semibold rounded-l">
                        {load.currency}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={quotedPrice}
                        onChange={(e) => setQuotedPrice(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:border-[#3ab54a] text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {load.commission !== undefined && load.commission > 0
                        ? `Total load value: ${load.currency} ${((load.finalPrice || 0) + (load.commission || 0)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
                        : `Client posted: ${load.currency} ${load.finalPrice?.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-700 font-semibold mb-2">
                      ADDITIONAL NOTES (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Can provide refrigeration, special handling available, etc."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#3ab54a] resize-none text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#3ab54a] text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-60 transition-colors"
                  >
                    {submitting ? 'Submitting...' : '📤 Submit Quote'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Client will review all quotes and select based on price, capabilities, and reputation.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  )
}