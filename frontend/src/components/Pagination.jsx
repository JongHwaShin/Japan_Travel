function getPageNumbers(currentPage, totalPages) {
  const max = 5
  const half = Math.floor(max / 2)
  let start = Math.max(0, currentPage - half)
  let end = Math.min(totalPages - 1, start + max - 1)
  if (end - start < max - 1) start = Math.max(0, end - max + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex items-center justify-center gap-1 mt-8 mb-2">
      {/* 이전 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        aria-label="이전 페이지"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-text-sub
                   hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* 페이지 번호 */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
            p === currentPage
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-sub hover:bg-gray-100'
          }`}
        >
          {p + 1}
        </button>
      ))}

      {/* 다음 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        aria-label="다음 페이지"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-text-sub
                   hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
