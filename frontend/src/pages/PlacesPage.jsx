import { useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import PlaceCard from '../components/PlaceCard'
import PlaceCardSkeleton from '../components/PlaceCardSkeleton'
import Pagination from '../components/Pagination'

// ─── 상수 ──────────────────────────────────────────────────────────────────
const FALLBACK_REGIONS = [
  { regionId: 1, nameKo: '후쿠오카' },
  { regionId: 2, nameKo: '오사카' },
  { regionId: 3, nameKo: '도쿄' },
  { regionId: 4, nameKo: '교토' },
  { regionId: 5, nameKo: '삿포로' },
]

const CATEGORIES = ['전체', '맛집', '관광지', '카페', '쇼핑', '숙박']
const PAGE_SIZE = 12

// ─── 서브 컴포넌트 ──────────────────────────────────────────────────────────

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">🗾</span>
      <p className="text-base font-semibold text-text-main">
        {query ? `"${query}" 검색 결과가 없어요` : '등록된 장소가 없어요'}
      </p>
      <p className="text-sm text-text-sub mt-1">다른 지역이나 카테고리를 선택해보세요</p>
    </div>
  )
}

// ─── 메인 페이지 ────────────────────────────────────────────────────────────

export default function PlacesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const [inputValue, setInputValue] = useState(initialQuery)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedRegionId, setSelectedRegionId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [page, setPage] = useState(0)
  const debounceTimer = useRef(null)

  // 지역 목록
  const { data: regions = FALLBACK_REGIONS } = useQuery({
    queryKey: ['regions'],
    queryFn: () => api.get('/api/regions').then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })

  // 장소 목록 (페이지네이션)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['places', selectedRegionId, selectedCategory, page],
    queryFn: () =>
      api
        .get('/api/places', {
          params: {
            regionId: selectedRegionId ?? undefined,
            category: selectedCategory === '전체' ? undefined : selectedCategory,
            page,
            size: PAGE_SIZE,
          },
        })
        .then((r) => r.data.data),
  })

  const places = data?.content ?? []

  // 검색어 클라이언트 필터 (현재 페이지 내 검색)
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return places
    const q = searchQuery.trim().toLowerCase()
    return places.filter((p) =>
      p.nameKo?.toLowerCase().includes(q) ||
      p.nameJp?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    )
  }, [places, searchQuery])

  // 검색 디바운스
  const handleInput = (e) => {
    const val = e.target.value
    setInputValue(val)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(val)
      setPage(0)
    }, 300)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    clearTimeout(debounceTimer.current)
    setSearchQuery(inputValue)
    setPage(0)
  }

  const handleRegionSelect = (id) => {
    setSelectedRegionId(id)
    setInputValue('')
    setSearchQuery('')
    setPage(0)
  }

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    setInputValue('')
    setSearchQuery('')
    setPage(0)
  }

  const handlePageChange = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const regionTabs = [{ regionId: null, nameKo: '전체' }, ...regions]

  return (
    <div className="pb-24 lg:pb-8">

      {/* 헤더 여백 */}
      <div className="h-14 lg:h-16" />

      {/* 상단 고정 필터 영역 */}
      <div className="sticky top-14 lg:top-16 z-30 bg-background border-b border-gray-100 shadow-sm">

        {/* 검색바 */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-4 md:px-6 lg:px-0 py-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10
                          focus-within:border-primary transition-colors">
            <svg className="w-4 h-4 text-text-sub flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={inputValue}
              onChange={handleInput}
              placeholder="장소명, 주소로 검색..."
              className="flex-1 text-sm outline-none bg-transparent text-text-main placeholder:text-text-sub"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => { setInputValue(''); setSearchQuery(''); setPage(0) }}
                className="text-text-sub hover:text-text-main"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* 지역 탭 */}
        <div className="overflow-x-auto scrollbar-hide">
          <ul className="flex gap-2 px-4 md:px-6 lg:px-0 pb-3 min-w-max">
            {regionTabs.map(({ regionId, nameKo }) => {
              const isActive = regionId === selectedRegionId
              return (
                <li key={regionId ?? 'all'}>
                  <button
                    onClick={() => handleRegionSelect(regionId)}
                    className={`min-h-[36px] px-4 rounded-full text-sm font-semibold border transition-colors ${isActive
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

        {/* 카테고리 필터 */}
        <div className="overflow-x-auto scrollbar-hide border-t border-gray-50">
          <ul className="flex gap-2 px-4 md:px-6 lg:px-0 py-2.5 min-w-max">
            {CATEGORIES.map((cat) => {
              const isActive = cat === selectedCategory
              return (
                <li key={cat}>
                  <button
                    onClick={() => handleCategorySelect(cat)}
                    className={`min-h-[32px] px-3.5 rounded-lg text-xs font-semibold transition-colors ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-sub hover:text-text-main hover:bg-gray-100'
                      }`}
                  >
                    {cat}
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
          총 <span className="font-semibold text-text-main">{data?.totalElements ?? 0}</span>개
        </p>
      )}

      {/* 콘텐츠 */}
      <div className="px-4 md:px-6 lg:px-0 mt-2">

        {/* 스켈레톤 */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* 에러 */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-3">😢</span>
            <p className="text-sm text-text-sub">데이터를 불러오는 데 실패했습니다.</p>
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState query={searchQuery} />
        )}

        {/* 카드 그리드 */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((place) => (
              <PlaceCard key={place.placeId} {...place} />
            ))}
          </div>
        )}

        {/* 페이지네이션 (검색 중에는 숨김) */}
        {!isLoading && !isError && !searchQuery && (
          <Pagination
            currentPage={page}
            totalPages={data?.totalPages ?? 0}
            onPageChange={handlePageChange}
          />
        )}

      </div>
    </div>
  )
}
