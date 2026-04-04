'use client'
// src/app/admin/dashboard/page.tsx
import { useEffect, useState } from 'react'
import { Topbar, PageLayout, StatCard } from '@/components/ui'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/admin-stats')
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
        <Topbar title="Admin Dashboard" />
        <PageLayout>
          <div className="text-center py-12 text-gray-400">Loading...</div>
        </PageLayout>
      </>
    )
  }

  const COLORS = ['#3ab54a', '#1a2a5e', '#f59e0b', '#ef4444', '#8b5cf6']
  const statusData = stats?.statusBreakdown 
    ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({ name, value }))
    : []

  return (
    <>
      <Topbar title="Admin Dashboard" />
      <PageLayout>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Loads" value={stats?.totalLoads || 0} />
          <StatCard label="Total Clients" value={stats?.totalClients || 0} />
          <StatCard label="Total Transporters" value={stats?.totalTransporters || 0} />
          <StatCard label="Platform Value" value={`R${(stats?.totalValue || 0).toLocaleString()}`} />
          <StatCard label="Completed" value={stats?.platformMetrics?.completedLoads || 0} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Breakdown */}
          <div className="card">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">Load Status Distribution</h3>
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
              <h3 className="font-condensed font-bold text-lg text-[#1a2a5e] uppercase tracking-wide">Platform Value Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `R${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3ab54a" strokeWidth={2} name="Platform Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

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
