// src/lib/rbac.ts
// Role-Based Access Control - Single role field approach

export type UserRole = 
  | 'CLIENT' 
  | 'TRANSPORTER' 
  | 'SUPER_ADMIN' 
  | 'POD_MANAGER' 
  | 'OPERATIONS_ADMIN' 
  | 'FINANCE_ADMIN'

const PERMISSIONS: Record<UserRole, string[]> = {
  CLIENT:           ['client_dashboard', 'client_loads', 'client_invoices'],
  TRANSPORTER:      ['transporter_dashboard', 'transporter_loads', 'upload_pod'],
  SUPER_ADMIN:      ['*'],
  POD_MANAGER:      ['pods'],
  OPERATIONS_ADMIN: ['loads', 'pods'],
  FINANCE_ADMIN:    ['invoices', 'quickbooks'],
}

export function hasPermission(role: string | undefined, permission: string): boolean {
  const userRole = (role || 'SUPER_ADMIN') as UserRole
  const perms = PERMISSIONS[userRole] ?? PERMISSIONS.SUPER_ADMIN
  
  // Super admin has all permissions
  if (perms.includes('*')) return true
  if (perms.includes(permission)) return true
  
  // Check prefix match
  return perms.some(p => permission.startsWith(p + ':') || p.startsWith(permission + ':'))
}

export function requirePermission(role: string | undefined, permission: string): boolean {
  return hasPermission(role, permission)
}

// Helper to check if user is admin (any admin type)
export function isAdmin(role: string): boolean {
  return ['SUPER_ADMIN', 'POD_MANAGER', 'OPERATIONS_ADMIN', 'FINANCE_ADMIN'].includes(role)
}
