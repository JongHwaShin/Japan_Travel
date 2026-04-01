import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

// ─── 상수 ──────────────────────────────────────────────────────────────────

const FALLBACK_REGIONS = [
  { regionId: 1, nameKo: '후쿠오카' },
  { regionId: 2, nameKo: '오사카' },
  { regionId: 3, nameKo: '도쿄' },
  { regionId: 4, nameKo: '교토' },
  { regionId: 5, nameKo: '삿포로' },
]

const TYPE_FILTERS = ['전체', 'JR', '지하철', '버스', '공항버스', '택시']

const TYPE_META = {
  JR:    { icon: '🚅', color: 'bg-green-50 text-green-700 border-green-100' },
  지하철: { icon: '🚇', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  버스:   { icon: '🚌', color: 'bg-orange-50 text-orange-700 border-orange-100' },
  공항버스:{ icon: '✈️', color: 'bg-sky-50 text-sky-700 border-sky-100' },
  택시:   { icon: '🚕', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
}

// ─── 스켈레톤 ───────────────────────────────────────────────────────────────

function TransportSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-4/5" />
    </div>
  )
}

// ─── 교통 카드 ──────────────────────────────────────────────────────────────

function TransportCard({ nameKo, nameJp, type, description, price, tip, regionNameKo }) {
  const meta = TYPE_META[type] ?? { icon: '🚃', color: 'bg-gray-50 text-gray-700 border-gray-100' }

  return (
    <div className="bg-card rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border ${meta.color}`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-text-main truncate">{nameKo}</h3>
              {nameJp && <p className="text-xs text-text-sub">{nameJp}</p>}
            </div>
            <span className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${meta.color}`}>
              {type}
            </span>
          </div>
          {regionNameKo && (
            <p className="text-xs text-secondary mt-0.5">📍 {regionNameKo}</p>
          )}
        </div>
      </div>

      {/* 설명 */}
      {description && (
        <p className="mt-3 text-sm text-text-sub leading-relaxed">{description}</p>
      )}

      {/* 요금 */}
      {price && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-semibold text-text-sub">요금</span>
          <span className="text-sm font-bold text-primary">{price}</span>
        </div>
      )}

      {/* 꿀팁 말풍선 */}
      {tip && (
        <div className="mt-3 relative bg-yellow-50 border border-yellow-100 rounded-xl px-3.5 py-2.5">
          {/* 말풍선 꼬리 */}
          <div className="absolute -top-2 left-5 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '8px solid #fef9c3',
            }}
          />
          <div className="absolute -top-2.5 left-5 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '8px solid #fef08a',
            }}
          />
          <p className="text-xs text-yellow-800 leading-relaxed">
            <span className="font-bold mr-1">💡 꿀팁</span>
            {tip}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── 메인 페이지 ────────────────────────────────────────────────────────────

export default function TransportPage() {
  const [selectedRegionId, setSelectedRegionId] = useState(null)
  const [selectedType, setSelectedType] = useState('전체')

  const { data: regions = FALLBACK_REGIONS } = useQuery({
    queryKey: ['regions'],
    queryFn: () => api.get('/api/regions').then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })

  const { data: transports = [], isLoading, isError } = useQuery({
    queryKey: ['transport', selectedRegionId],
    queryFn: () =>
      selectedRegionId
        ? api.get(`/api/transport/${selectedRegionId}`).then((r) => r.data.data)
        : api.get('/api/transport').then((r) => r.data.data),
  })

  const filtered = useMemo(() => {
    if (selectedType === '전체') return transports
    return transports.filter((t) => t.type === selectedType)
  }, [transports, selectedType])

  const regionTabs = [{ regionId: null, nameKo: '전체' }, ...regions]

  return (
    <div className="pb-24 lg:pb-8">
      <div className="h-14 lg:h-16" />

      {/* 헤더 */}
      <div className="px-4 md:px-6 lg:px-0 pt-5 pb-4">
        <h1 className="text-xl font-bold text-text-main">교통정보 🚃</h1>
        <p className="text-xs text-text-sub mt-0.5">일본 대중교통 완벽 가이드</p>
      </div>

      {/* 지역 탭 + 타입 필터: 고정 */}
      <div className="sticky top-14 lg:top-16 z-30 bg-background border-b border-gray-100 shadow-sm">

        {/* 지역 탭 */}
        <div className="overflow-x-auto scrollbar-hide">
          <ul className="flex gap-2 px-4 md:px-6 lg:px-0 pt-3 pb-2 min-w-max">
            {regionTabs.map(({ regionId, nameKo }) => {
              const isActive = regionId === selectedRegionId
              return (
                <li key={regionId ?? 'all'}>
                  <button
                    onClick={() => { setSelectedRegionId(regionId); setSelectedType('전체') }}
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

        {/* 교통수단 타입 필터 */}
        <div className="overflow-x-auto scrollbar-hide">
          <ul className="flex gap-2 px-4 md:px-6 lg:px-0 pb-3 min-w-max">
            {TYPE_FILTERS.map((type) => {
              const isActive = type === selectedType
              const meta = TYPE_META[type]
              return (
                <li key={type}>
                  <button
                    onClick={() => setSelectedType(type)}
                    className={`min-h-[32px] px-3 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-sub hover:text-text-main hover:bg-gray-100'
                    }`}
                  >
                    {meta && <span>{meta.icon}</span>}
                    {type}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <TransportSkeleton key={i} />)}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-3">😢</span>
            <p className="text-sm text-text-sub">교통정보를 불러오는 데 실패했습니다.</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🚃</span>
            <p className="text-base font-semibold text-text-main">교통정보가 없어요</p>
            <p className="text-sm text-text-sub mt-1">다른 지역을 선택해보세요</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((t) => (
              <TransportCard key={t.transportId} {...t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
