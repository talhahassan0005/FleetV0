'use client'
// src/app/client/dashboard/page.tsx
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Topbar, PageLayout, StatCard, DashboardCardsSkeleton, ChartSkeleton } from '@/components/ui'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function ClientDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/client-stats')
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </PageLayout>
      </>
    )
  }

  const COLORS = ['#3ab54a', '#1a2a5e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  const statusData = stats?.statusBreakdown 
    ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({ name, value }))
    : []

  return (
    <>
      <Topbar title="Dashboard" />
      
      {/* Verification Status Section */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          {session?.user?.isVerified ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded">
              <div className="text-xl">✅</div>
              <div className="flex-1">
                <p className="font-semibold text-green-900">Account Verified</p>
                <p className="text-sm text-green-800">Your account is verified and you can post loads.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded">
              <div className="text-xl">⚠️</div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900">Account Not Verified</p>
                {session?.user?.verificationStatus === 'REJECTED' ? (
                  <div>
                    <p className="text-sm text-amber-800">Your verification was rejected.</p>
                    {session?.user?.verificationComment && (
                      <p className="text-sm text-amber-700 italic mt-1">Reason: {session.user.verificationComment}</p>
                    )}
                    <p className="text-sm text-amber-800 mt-1">Please upload updated documents to resubmit.</p>
                  </div>
                ) : session?.user?.verificationStatus === 'PENDING' ? (
                  <p className="text-sm text-amber-800">Your documents are under review. You'll be notified once complete.</p>
                ) : (
                  <p className="text-sm text-amber-800">Complete account verification to post loads. You can post loads until verification.</p>
                )}
              </div>
              <button
                onClick={() => router.push('/client/documents')}
                className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-semibold"
              >
                Upload Documents →
              </button>
            </div>
          )}
        </div>
      </div>

      <PageLayout>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Loads" value={stats?.totalLoads || 0} />
          <StatCard label="Total Spent" value={`R${(stats?.totalSpent || 0).toLocaleString()}`} />
          <StatCard label="Pending Quotes" value={stats?.pendingQuotes || 0} />
          <StatCard label="Delivered" value={stats?.statusBreakdown?.DELIVERED || 0} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Breakdown */}
          <div className="card">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">Load Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trends */}
          <div className="card">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">Monthly Spending</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `R${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="spent" stroke="#3ab54a" strokeWidth={2} name="Amount Spent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Loads */}
          <div className="card">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">Recent Loads</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-gray-500 bg-gray-50">Ref</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-gray-500 bg-gray-50">Route</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-gray-500 bg-gray-50">Status</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-gray-500 bg-gray-50">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentLoads?.map((load: any) => (
                    <tr key={load.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-condensed font-bold text-[#1a2a5e]">{load.ref}</td>
                      <td className="px-4 py-3 text-sm">{load.route}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          load.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                          load.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {load.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">R{load.price?.toLocaleString() || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
