import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import LogCard from '../components/LogCard'
import LogCardSkeleton from '../components/LogCardSkeleton'

const FALLBACK_REGIONS = [
  { regionId: 1, nameKo: '후쿠오카' },
  { regionId: 2, nameKo: '오사카' },
  { regionId: 3, nameKo: '도쿄' },
  { regionId: 4, nameKo: '교토' },
  { regionId: 5, nameKo: '삿포로' },
]

export default function LogsPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const [selectedRegionId, setSelectedRegionId] = useState(null)

  const { data: regions = FALLBACK_REGIONS } = useQuery({
    queryKey: ['regions'],
    queryFn: () => api.get('/api/regions').then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })

  const { data: logs = [], isLoading, isError } = useQuery({
    queryKey: ['logs'],
    queryFn: () => api.get('/api/logs').then((r) => r.data.data),
  })

  // 지역 클라이언트 필터
  const filtered = useMemo(() => {
    if (selectedRegionId === null) return logs
    return logs.filter((l) => l.regionId === selectedRegionId)
  }, [logs, selectedRegionId])

  const regionTabs = [{ regionId: null, nameKo: '전체' }, ...regions]

  return (
    <div className="pb-24 lg:pb-8">
      <div className="h-14 lg:h-16" />

      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-0 pt-5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">여행일기 ✈️</h1>
          <p className="text-xs text-text-sub mt-0.5">여행자들의 생생한 이야기</p>
        </div>
        {isLoggedIn && (
          <Link
            to="/logs/write"
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold
                       px-4 h-9 rounded-xl hover:bg-orange-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            글쓰기
          </Link>
        )}
      </div>

      {/* 지역 탭 */}
      <div className="overflow-x-auto scrollbar-hide border-b border-gray-100">
        <ul className="flex gap-2 px-4 md:px-6 lg:px-0 pb-3 min-w-max">
          {regionTabs.map(({ regionId, nameKo }) => {
            const isActive = regionId === selectedRegionId
            return (
              <li key={regionId ?? 'all'}>
                <button
                  onClick={() => setSelectedRegionId(regionId)}
                  className={`min-h-[36px] px-4 rounded-full text-sm font-semibold border transition-colors ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-text-sub border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {nameKo}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* 결과 수 */}
      {!isLoading && !isError && (
        <p className="px-4 md:px-6 lg:px-0 pt-4 pb-2 text-xs text-text-sub">
          총 <span className="font-semibold text-text-main">{filtered.length}</span>개
        </p>
      )}

      {/* 콘텐츠 */}
      <div className="px-4 md:px-6 lg:px-0 mt-1">

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <LogCardSkeleton key={i} />)}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-3">😢</span>
            <p className="text-sm text-text-sub">데이터를 불러오는 데 실패했습니다.</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">✈️</span>
            <p className="text-base font-semibold text-text-main">아직 여행일기가 없어요</p>
            <p className="text-sm text-text-sub mt-1">첫 번째 여행 이야기를 들려주세요!</p>
            {isLoggedIn && (
              <Link
                to="/logs/write"
                className="mt-5 bg-primary text-white text-sm font-semibold px-6 h-10 rounded-xl
                           hover:bg-orange-500 transition-colors flex items-center"
              >
                글쓰기
              </Link>
            )}
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((log) => (
              <LogCard key={log.logId} {...log} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
