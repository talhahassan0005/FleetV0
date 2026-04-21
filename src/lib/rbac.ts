// src/lib/rbac.ts
// Role-Based Access Control for admin sub-roles

export type AdminRole = 'superadmin' | 'pod_manager' | 'operations' | 'finance'

const PERMISSIONS: Record<AdminRole, string[]> = {
  superadmin:  ['*'],
  pod_manager: ['pods', 'loads:read'],
  operations:  ['loads', 'pods'],
  finance:     ['invoices', 'quickbooks'],
}

export function hasPermission(adminRole: string | undefined, permission: string): boolean {
  const role = (adminRole || 'superadmin') as AdminRole
  const perms = PERMISSIONS[role] ?? PERMISSIONS.superadmin
  if (perms.includes('*')) return true
  if (perms.includes(permission)) return true
  // Check prefix match e.g. 'loads' covers 'loads:read'
  return perms.some(p => permission.startsWith(p + ':') || p.startsWith(permission + ':'))
}

export function requirePermission(adminRole: string | undefined, permission: string): boolean {
  return hasPermission(adminRole, permission)
}
