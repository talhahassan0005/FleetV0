// src/lib/utils.ts
import { nanoid } from 'nanoid'

export function genRef(): string {
  return 'FX-' + nanoid(6).toUpperCase()
}

export function genToken(): string {
  return nanoid(48)
}

export function formatCurrency(amount: number, currency = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:    'Pending',
    QUOTING:    'Quoting',
    QUOTED:     'Quoted',
    APPROVED:   'Approved',
    ASSIGNED:   'Assigned',
    IN_TRANSIT: 'In Transit',
    DELIVERED:  'Delivered',
    CANCELLED:  'Cancelled',
  }
  return map[status] ?? status
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:    'bg-amber-50 text-amber-700 border-amber-200',
    QUOTING:    'bg-blue-50 text-blue-700 border-blue-200',
    QUOTED:     'bg-purple-50 text-purple-700 border-purple-200',
    APPROVED:   'bg-green-50 text-green-700 border-green-200',
    ASSIGNED:   'bg-indigo-50 text-indigo-700 border-indigo-200',
    IN_TRANSIT: 'bg-green-50 text-green-800 border-green-300',
    DELIVERED:  'bg-navy-50 text-navy border-navy-200',
    CANCELLED:  'bg-red-50 text-red-700 border-red-200',
  }
  return map[status] ?? 'bg-gray-50 text-gray-700'
}
