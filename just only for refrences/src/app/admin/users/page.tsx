// src/app/admin/users/page.tsx
import { prisma } from '@/lib/prisma'
import { Topbar, PageLayout, StatusBadge } from '@/components/ui'
import { AdminUserActions } from '@/components/admin/AdminUserActions'
import Link from 'next/link'

export default async function AdminUsersPage({ searchParams }: { searchParams: { role?: string } }) {
  const roleFilter = searchParams.role
  const users = await prisma.user.findMany({
    where: { role: roleFilter ? { equals: roleFilter as any } : { not: 'ADMIN' } },
    include: { documents: { where: { loadId: null } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Topbar title="Users" />
      <PageLayout>
        <div className="flex gap-2 mb-4">
          {[['', 'All'], ['CLIENT', 'Clients'], ['TRANSPORTER', 'Transporters']].map(([r, label]) => (
            <Link key={r} href={`/admin/users${r ? `?role=${r}` : ''}`}
              className={`px-3 py-1 rounded text-[10px] font-semibold uppercase tracking-wide transition-colors ${(roleFilter ?? '') === r ? 'bg-[#1a2a5e] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#1a2a5e]'}`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="card">
          <div className="table-header"><span className="table-title">Users ({users.length})</span></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>{['Company', 'Contact', 'Email', 'Phone', 'Role', 'Verified', 'Joined', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">{h}</th>
              ))}</tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-semibold text-[#1a2a5e]">{user.companyName ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">{user.contactName ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{user.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.role === 'TRANSPORTER' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isVerified
                        ? <span className="badge bg-green-50 text-green-700 border-green-200">Verified</span>
                        : <AdminUserActions userId={user.id} />
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{user.createdAt.toLocaleDateString('en-ZA')}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${user.id}`} className="btn-navy text-[10px] px-2 py-1">Docs ({user.documents.length})</Link>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
