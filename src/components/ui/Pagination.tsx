import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export function Pagination({ currentPage, totalPages, onPageChange, loading = false }: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1)
  const safeCurrentPage = Math.max(1, Math.min(currentPage || 1, safeTotalPages))
  
  if (safeTotalPages <= 1) return null

  const pages: (number | string)[] = []
  const maxVisible = 5
  let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2))
  let endPage = Math.min(safeTotalPages, startPage + maxVisible - 1)
  
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  if (startPage > 1) {
    pages.push(1)
    if (startPage > 2) pages.push('...')
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  if (endPage < safeTotalPages) {
    if (endPage < safeTotalPages - 1) pages.push('...')
    pages.push(safeTotalPages)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1 || loading}
        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || loading}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            page === safeCurrentPage
              ? 'bg-[#3ab54a] text-white'
              : page === '...'
              ? 'cursor-default text-gray-400'
              : 'hover:bg-gray-100 text-gray-700'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage === safeTotalPages || loading}
        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <span className="ml-4 text-sm text-gray-600">
        Page {safeCurrentPage} of {safeTotalPages}
      </span>
    </div>
  )
}
