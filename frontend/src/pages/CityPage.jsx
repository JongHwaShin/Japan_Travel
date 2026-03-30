import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import PlaceCard from '../components/PlaceCard'
import PlaceCardSkeleton from '../components/PlaceCardSkeleton'

const CITY_IMAGES = {
  '후쿠오카': 'https://images.unsplash.com/photo-1679230708086-2b10acf31074?w=800&q=80&fit=crop',
  '오사카':   'https://plus.unsplash.com/premium_photo-1733342572346-5420c95f7556?w=800&q=80&fit=crop',
  '도쿄':     'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80&fit=crop',
  '교토':     'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80&fit=crop',
  '삿포로':   'https://images.unsplash.com/photo-1696053066632-3ef25f7bb0eb?w=800&q=80&fit=crop',
  '요코하마': 'https://images.unsplash.com/photo-1737559890706-bbcc6d5945c1?w=800&q=80&fit=crop',
  '나고야':   'https://images.unsplash.com/photo-1719805053349-e8974bb0c60d?w=800&q=80&fit=crop',
}

const CATEGORIES = ['전체', '맛집', '관광지', '카페', '쇼핑', '숙박']

export default function CityPage() {
  const { regionId } = useParams()
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('전체')

  const { data: region } = useQuery({
    queryKey: ['region', regionId],
    queryFn: () => api.get(`/regions/${regionId}`).then((r) => r.data.data),
    enabled: !!regionId,
  })

  const { data: places = [], isLoading, isError } = useQuery({
    queryKey: ['places', regionId, activeCategory],
    queryFn: () => {
      const params = { regionId }
      if (activeCategory !== '전체') params.category = activeCategory
      return api.get('/places', { params }).then((r) => r.data.data ?? [])
    },
    enabled: !!regionId,
  })

  const heroImage = CITY_IMAGES[region?.nameKo] ?? ''

  return (
    <div className="pb-24 lg:pb-8">

      {/* 헤더 여백 */}
      <div className="h-14 lg:h-16" />

      {/* 히어로 이미지 */}
      <div className="relative w-full h-56 md:h-72 lg:h-80 overflow-hidden bg-gray-200">
        {heroImage && (
          <img
            src={heroImage}
            alt={region?.nameKo ?? ''}
            className="w-full h-full object-cover"
          />
        )}
        {/* 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center justify-center w-9 h-9 rounded-full
                     bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* 도시명 */}
        <div className="absolute bottom-5 left-5">
          {region ? (
            <>
              {region.nameJp && (
                <p className="text-white/70 text-sm font-medium mb-0.5">{region.nameJp}</p>
              )}
              <h1 className="text-white text-3xl font-bold tracking-tight">{region.nameKo}</h1>
            </>
          ) : (
            <div className="space-y-1.5 animate-pulse">
              <div className="h-3 w-16 bg-white/40 rounded" />
              <div className="h-8 w-28 bg-white/40 rounded" />
            </div>
          )}
        </div>
      </div>

      {/* 카테고리 탭 (sticky) */}
      <div className="sticky top-14 lg:top-16 z-30 bg-background border-b border-gray-100 shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <ul className="flex gap-1.5 px-4 md:px-6 lg:px-0 py-3 min-w-max">
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory
              return (
                <li key={cat}>
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className={`min-h-[36px] px-4 rounded-full text-sm font-semibold border transition-colors ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-text-sub border-gray-200 hover:border-primary hover:text-primary'
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

      {/* 콘텐츠 */}
      <div className="px-4 md:px-6 lg:px-0 mt-5">

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
        {!isLoading && !isError && places.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🗾</span>
            <p className="text-base font-semibold text-text-main">등록된 장소가 없어요</p>
            <p className="text-sm text-text-sub mt-1">다른 카테고리를 선택해보세요</p>
          </div>
        )}

        {/* 카드 그리드 */}
        {!isLoading && !isError && places.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place) => (
              <PlaceCard key={place.placeId} {...place} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
