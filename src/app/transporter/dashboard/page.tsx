'use client'
// src/app/transporter/dashboard/page.tsx
import { useEffect, useState } from 'react'
import { Topbar, PageLayout, StatCard, DashboardCardsSkeleton, ChartSkeleton } from '@/components/ui'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useVerificationStatus } from '@/hooks/useVerificationStatus'

export default function TransporterDashboardPage() {
  const { refreshVerificationStatus } = useVerificationStatus()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // BUG FIX #3: Refresh verification status on mount
  useEffect(() => {
    refreshVerificationStatus()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/transporter-stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <>
        <Topbar title="Dashboard" />
        <PageLayout>
          <DashboardCardsSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </PageLayout>
      </>
    )
  }

  const COLORS = ['#3ab54a', '#ef4444', '#8b5cf6']
  const quoteData = stats?.statusBreakdown 
    ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({ name, value }))
    : []

  return (
    <>
      <Topbar title="Dashboard" />
      <PageLayout>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Quotes" value={stats?.totalQuotes || 0} />
          <StatCard label="Total Earnings" value={`ZAR ${(stats?.totalEarnings || 0).toLocaleString()}`} />
          <StatCard label="Accepted Deals" value={stats?.acceptedDeals || 0} />
          <StatCard label="Assigned Loads" value={stats?.assignedLoads || 0} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quote Status */}
          <div className="card">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">Quote Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={quoteData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {quoteData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Earnings */}
          <div className="card">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">Monthly Earnings</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `ZAR ${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="earnings" stroke="#3ab54a" strokeWidth={2} name="Earnings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="card">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">Recent Quotes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-gray-500 bg-gray-50">Route</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-gray-500 bg-gray-50">Price</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-gray-500 bg-gray-50">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentQuotes?.map((quote: any) => (
                  <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{quote.route}</td>
                    <td className="px-4 py-3 font-semibold">{quote.currency || 'ZAR'} {quote.price?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        quote.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
