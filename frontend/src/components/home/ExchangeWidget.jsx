import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'

function formatTime(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} 기준`
}

export default function ExchangeWidget() {
  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['exchange', 'KRW', 'JPY'],
    queryFn: () =>
      api.get('/exchange', { params: { from: 'KRW', to: 'JPY' } }).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10, // 10분
  })

  // 100엔 기준 원화 계산 (API: 1 KRW = X JPY → 100 JPY = 100/rate KRW)
  const rate = data?.rate         // 1 KRW → JPY
  const krwPer100Jpy = rate ? Math.round(100 / rate) : null
  const updatedAt = data?.updatedAt ?? (dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null)

  return (
    <Link
      to="/exchange"
      className="block bg-card rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 md:p-5">

        {/* 좌측: 환율 정보 */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center text-2xl flex-shrink-0">
            💴
          </div>
          <div>
            <p className="text-xs text-text-sub font-medium mb-0.5">실시간 환율</p>
            {isLoading && (
              <div className="h-7 w-32 bg-gray-100 rounded-lg animate-pulse" />
            )}
            {isError && (
              <p className="text-sm text-text-sub">불러오기 실패</p>
            )}
            {!isLoading && !isError && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-text-main">
                  100엔
                </span>
                <span className="text-text-sub text-sm">=</span>
                <span className="text-xl font-bold text-secondary">
                  {krwPer100Jpy != null
                    ? `${krwPer100Jpy.toLocaleString()}원`
                    : '-'}
                </span>
              </div>
            )}
            {updatedAt && (
              <p className="text-[11px] text-text-sub mt-0.5">{formatTime(updatedAt)}</p>
            )}
          </div>
        </div>

        {/* 우측: 화살표 */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-text-sub">환율 계산기</span>
          <svg className="w-5 h-5 text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </div>

      </div>
    </Link>
  )
}
